import express from 'express';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import cron from 'node-cron';
import { processLoanNotifications } from './src/services/notificationJobService.ts';
import { createServer as createViteServer } from 'vite';

async function startServer() {
    const app = express();
    app.use(express.json());

    // Request logging middleware - MUST BE FIRST
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });

    // Initialize Admin SDK with explicit project ID from configuration
    const firebaseConfig = (await import('./firebase-applet-config.json', { with: { type: 'json' } })).default;
    const databaseId = firebaseConfig.firestoreDatabaseId || 'ai-studio-tdtuchirchiqfili-e6506621-eaad-47ce-b29d-77c5dea4b76d';
    if (!getApps().length) {
        initializeApp({
            projectId: firebaseConfig.projectId
        });
    }
    const db = getFirestore(databaseId);
    const auth = getAuth();

    // API Routes
    const apiRouter = express.Router();

    apiRouter.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            databaseId: databaseId
        });
    });

    apiRouter.get('/public-stats', async (req, res) => {
        try {
            const [usersSnap, booksSnap, copiesSnap] = await Promise.all([
                db.collection('users').count().get(),
                db.collection('books').count().get(),
                db.collection('bookCopies').count().get()
            ]);
            res.status(200).json({
                totalUsers: usersSnap.data().count || 0,
                totalBooks: booksSnap.data().count || 0,
                totalCopies: copiesSnap.data().count || 0
            });
        } catch (e: any) {
            console.error("Public stats error:", e);
            res.status(500).json({ error: e.message || 'Failed to fetch public stats' });
        }
    });

    apiRouter.post('/admin/users/create', async (req, res) => {
        console.log("Processing user creation request...");
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader !== 'TDTU_ADMIN_SECRET' && authHeader !== process.env.ADMIN_SECRET) {
                console.warn("Unauthorized attempt to create user");
                return res.status(401).json({ error: 'Ruxsat berilmagan' });
            }

            const { email, password, fullName, role, ...extra } = req.body;
            
            if (!email || !password || !fullName || !role) {
                return res.status(400).json({ error: 'Barcha maydonlar to‘ldirilishi shart' });
            }

            console.log(`Creating ${role}: ${email}`);

            let userRecord;
            try {
                userRecord = await auth.createUser({
                    email,
                    password,
                    displayName: fullName
                });
            } catch (authError: any) {
                if (authError.code === 'auth/email-already-exists') {
                    return res.status(409).json({ error: 'Ushbu email/ID bilan foydalanuvchi allaqachon mavjud.' });
                }
                throw authError;
            }
            
            const profile = {
                uid: userRecord.uid,
                email,
                fullName,
                role,
                isActive: true,
                initialPassword: password, 
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...extra
            };
            
            await db.collection('users').doc(userRecord.uid).set(profile);
            console.log(`User created successfully: ${userRecord.uid}`);
            res.status(200).json({ uid: userRecord.uid });
        } catch (e: any) {
            console.error("User creation error:", e);
            res.status(500).json({ 
                error: e.message || 'Serverda xatolik yuz berdi',
                code: e.code
            });
        }
    });

    apiRouter.post('/admin/users/reset-password', async (req, res) => {
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader !== 'TDTU_ADMIN_SECRET' && authHeader !== process.env.ADMIN_SECRET) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { uid, password } = req.body;
            await auth.updateUser(uid, { password });
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    // Mount API router
    app.use('/api', apiRouter);

    // Schedule notification job
    cron.schedule('*/15 * * * *', async () => {
        try {
            await processLoanNotifications(db);
        } catch (e) {
            console.error('Cron job error:', e);
        }
    });

    // Vite middleware for SPA
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
    });
    app.use(vite.middlewares);

    const port = 3000;
    app.listen(port, () => {
        console.log(`> Server running on http://localhost:${port}`);
    });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

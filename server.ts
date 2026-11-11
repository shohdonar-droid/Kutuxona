import express from 'express';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cron from 'node-cron';
import { processLoanNotifications } from './src/services/notificationJobService.ts';
import { createServer as createViteServer } from 'vite';

async function startServer() {
    const app = express();
    app.use(express.json());

    // Initialize Admin SDK
    initializeApp();
    const db = getFirestore('ai-studio-tdtuchirchiqfili-e6506621-eaad-47ce-b29d-77c5dea4b76d');

    // Schedule notification job every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('Running loan notification job...');
        try {
            await processLoanNotifications(db);
            console.log('Notification job completed');
        } catch (e) {
            console.error('Notification job error:', e);
        }
    });

    app.post('/api/admin/notifications/process-loans', async (req, res) => {
        if (req.headers['authorization'] !== process.env.ADMIN_SECRET && req.headers['authorization'] !== 'TDTU_ADMIN_SECRET') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            await processLoanNotifications(db);
            res.status(200).json({ success: true, message: 'Notifications processed' });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/admin/users/create', async (req, res) => {
        try {
            // Check auth
            const authHeader = req.headers['authorization'];
            if (authHeader !== process.env.ADMIN_SECRET && authHeader !== 'TDTU_ADMIN_SECRET') {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { email, password, fullName, role, ...extra } = req.body;
            
            if (!email || !password || !fullName || !role) {
                return res.status(400).json({ error: 'Barcha maydonlar to‘ldirilishi shart: email, password, fullName, role' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.' });
            }

            const { getAuth } = await import('firebase-admin/auth');
            const auth = getAuth();
            
            console.log(`Admin creating user: ${email} (${role})`);

            let userRecord;
            try {
                userRecord = await auth.createUser({
                    email,
                    password,
                    displayName: fullName
                });
            } catch (authError: any) {
                console.error("Auth creation failed:", authError);
                if (authError.code === 'auth/email-already-exists') {
                    // Try to find the existing user to sync Firestore if needed, 
                    // but usually we should just return error
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
            console.log(`User and profile created: ${userRecord.uid}`);
            res.status(200).json({ uid: userRecord.uid });
        } catch (e: any) {
            console.error("User creation deep error:", e);
            res.status(500).json({ 
                error: e.message || 'Tizimda kutilmagan xatolik yuz berdi.',
                code: e.code || 'unknown'
            });
        }
    });

    app.post('/api/admin/users/reset-password', async (req, res) => {
        if (req.headers['authorization'] !== process.env.ADMIN_SECRET && req.headers['authorization'] !== 'TDTU_ADMIN_SECRET') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { uid, password } = req.body;
        const { getAuth } = await import('firebase-admin/auth');
        const auth = getAuth();

        try {
            await auth.updateUser(uid, { password });
            res.status(200).json({ success: true });
        } catch (e: any) {
            console.error("Password reset error:", e);
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/health', (req, res) => {
        res.status(200).json({ok: true, service: 'library-server'});
    });

    // Vite middleware for SPA
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
    });
    app.use(vite.middlewares);

    const port = 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer();

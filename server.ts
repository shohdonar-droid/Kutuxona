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
    initializeApp({
        projectId: 'probable-wall-007pf'
    });
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
                return res.status(400).json({ error: 'Required fields missing: email, password, fullName, role' });
            }

            const { getAuth } = await import('firebase-admin/auth');
            const auth = getAuth();
            
            console.log(`Attempting to create user: ${email} with role: ${role}`);

            const userRecord = await auth.createUser({
                email,
                password,
                displayName: fullName
            });
            
            const profile = {
                uid: userRecord.uid,
                email,
                fullName,
                role,
                isActive: true,
                initialPassword: password, // Store initial password for reset logic
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...extra
            };
            
            await db.collection('users').doc(userRecord.uid).set(profile);
            console.log(`User created successfully: ${userRecord.uid}`);
            res.status(200).json({ uid: userRecord.uid });
        } catch (e: any) {
            console.error("User creation error detail:", e);
            const errorMessage = e.message || String(e);
            res.status(500).json({ 
                error: errorMessage,
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

import express from 'express';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cron from 'node-cron';
import { processLoanNotifications } from './src/services/notificationJobService.js';
import { createServer as createViteServer } from 'vite';

async function startServer() {
    const app = express();
    app.use(express.json());

    // Initialize Admin SDK
    initializeApp({
        projectId: 'ai-studio-tdtuchirchiqfili-e6506621-eaad-47ce-b29d-77c5dea4b76d'
    });
    const db = getFirestore();

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
        if (req.headers['authorization'] !== process.env.ADMIN_SECRET) {
            return res.status(401).send('Unauthorized');
        }
        try {
            await processLoanNotifications(db);
            res.status(200).send('Notifications processed');
        } catch (e) {
            res.status(500).send(e);
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

    app.listen(process.env.PORT || 3000, () => console.log('Server running on port', process.env.PORT || 3000));
}

startServer();

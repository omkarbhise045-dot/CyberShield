import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth.js';
import caseRoutes from './server/routes/cases.js';
import analysisRoutes from './server/routes/analysis.js';
import evidenceRoutes from './server/routes/evidence.js';
import reportRoutes from './server/routes/reports.js';
import emergencyRoutes from './server/routes/emergency.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure uploads folder exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/analyze', analysisRoutes);
  app.use('/api/evidence', evidenceRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/emergency', emergencyRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CyberShield Fullstack API', timestamp: new Date().toISOString() });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CyberShield] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

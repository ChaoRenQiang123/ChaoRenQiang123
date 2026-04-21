import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8')
);

// Initialize Firebase on server
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  // 1. Get Feedbacks (Proxy)
  app.get('/api/feedbacks', async (req, res) => {
    try {
      const q = query(
        collection(db, 'feedbacks'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const feedbacks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(feedbacks);
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Post Feedback (Proxy)
  app.post('/api/feedbacks', async (req, res) => {
    try {
      const { nickname, content, rating } = req.body;
      
      // Basic validation on server
      if (!content || !rating) {
        return res.status(400).json({ error: 'Content and rating are required' });
      }

      const docRef = await addDoc(collection(db, 'feedbacks'), {
        nickname: nickname || '匿名用户',
        content,
        rating: Number(rating),
        createdAt: serverTimestamp()
      });

      res.status(201).json({ id: docRef.id });
    } catch (error: any) {
      console.error('Error adding feedback:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Firebase Proxy Bridge enabled for China-friendly access.`);
  });
}

startServer();

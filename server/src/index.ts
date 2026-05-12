import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import assessmentRoutes from './routes/assessments';
import studyLogRoutes from './routes/study-logs';
import profileRoutes from './routes/profile';
import chatRoutes from './routes/chat';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/study-logs', studyLogRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

app.listen(port, () => {
  console.log(`[ScholarSync] Server running at http://localhost:${port}`);
});

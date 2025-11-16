import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server } from 'socket.io';
import logger from '@/utils/logger';
import { prisma } from '@/config/database';
import redis from '@/config/redis';

// Routes
import authRoutes from '@/routes/auth.routes';
import projectRoutes from '@/routes/project.routes';
import chapterRoutes from '@/routes/chapter.routes';
import generationRoutes from '@/routes/generation.routes';
import exportRoutes from '@/routes/export.routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/chapters', chapterRoutes);
app.use('/api/v1/generate', generationRoutes);
app.use('/api/v1/export', exportRoutes);

// WebSocket
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('subscribe:project', ({ projectId }) => {
    socket.join(`project:${projectId}`);
    logger.info(`Socket ${socket.id} subscribed to project:${projectId}`);
  });

  socket.on('unsubscribe:project', ({ projectId }) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available globally
app.set('io', io);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  logger.info(`✓ Server running on port ${PORT}`);
  logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);

  // Test database connection
  try {
    await prisma.$connect();
    logger.info('✓ Database connected');
  } catch (error) {
    logger.error('✗ Database connection failed:', error);
  }

  // Test Redis connection
  try {
    await redis.ping();
    logger.info('✓ Redis connected');
  } catch (error) {
    logger.error('✗ Redis connection failed:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
});

export { app, server, io };

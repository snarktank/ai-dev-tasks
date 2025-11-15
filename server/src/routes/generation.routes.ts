import express from 'express';
import { prisma } from '@/config/database';
import { authenticate } from '@/middleware/auth';
import { AuthRequest } from '@/types';
import queueService from '@/services/queue/QueueService';

const router = express.Router();

router.use(authenticate);

// Generate single chapter
router.post('/chapter', async (req: AuthRequest, res) => {
  try {
    const { projectId, chapterNumber } = req.body;
    
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    let chapter = await prisma.chapter.findUnique({
      where: { projectId_chapterNumber: { projectId, chapterNumber } },
    });
    
    if (!chapter) {
      chapter = await prisma.chapter.create({
        data: { projectId, chapterNumber, status: 'not_started' },
      });
    }
    
    const jobId = await queueService.generateChapter({
      projectId,
      chapterId: chapter.id,
      chapterNumber,
      userId: req.user!.id,
    });
    
    res.json({ message: 'Chapter generation queued', jobId, chapterId: chapter.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Batch generate
router.post('/batch', async (req: AuthRequest, res) => {
  try {
    const { projectId, startChapter, endChapter } = req.body;
    
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const jobIds = await queueService.batchGenerate({
      projectId,
      startChapter,
      endChapter,
      userId: req.user!.id,
    });
    
    const count = endChapter - startChapter + 1;
    res.json({ message: `Queued ${count} chapters`, jobIds });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

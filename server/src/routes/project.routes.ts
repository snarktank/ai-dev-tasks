import express from 'express';
import { prisma } from '@/config/database';
import { authenticate } from '@/middleware/auth';
import { AuthRequest } from '@/types';

const router = express.Router();

router.use(authenticate);

// List projects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      include: {
        chapters: { select: { id: true, chapterNumber: true, status: true, wordCount: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          include: { continuityCheck: true },
        },
        characters: true,
        locations: true,
        plotPoints: true,
        timelineEvents: { orderBy: { sequenceOrder: 'asc' } },
      },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, storyBible, genre, targetWordCount } = req.body;
    
    const project = await prisma.project.create({
      data: {
        userId: req.user!.id,
        title,
        storyBible,
        genre,
        targetWordCount: targetWordCount || 130000,
      },
    });
    
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: req.body,
    });
    
    if (project.count === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const updated = await prisma.project.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const deleted = await prisma.project.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

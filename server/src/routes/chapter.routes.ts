import express from 'express';
import { prisma } from '@/config/database';
import { authenticate } from '@/middleware/auth';
import { AuthRequest } from '@/types';

const router = express.Router();

router.use(authenticate);

// Get chapter
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        continuityCheck: true,
        revisions: { orderBy: { revisionNumber: 'desc' } },
        characterAppearances: { include: { character: true } },
      },
    });
    
    if (!chapter || chapter.project.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    
    res.json(chapter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update chapter
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    
    if (!chapter || chapter.project.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    
    const { content, brief } = req.body;
    const wordCount = content ? content.split(/\s+/).length : chapter.wordCount;
    
    const updated = await prisma.chapter.update({
      where: { id: req.params.id },
      data: { content, brief, wordCount, updatedAt: new Date() },
    });
    
    // Create revision if content changed
    if (content && content !== chapter.content) {
      const lastRevision = await prisma.chapterRevision.findFirst({
        where: { chapterId: req.params.id },
        orderBy: { revisionNumber: 'desc' },
      });
      
      await prisma.chapterRevision.create({
        data: {
          chapterId: req.params.id,
          content,
          wordCount,
          revisionNumber: (lastRevision?.revisionNumber || 0) + 1,
          changeNote: 'Manual edit',
        },
      });
    }
    
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

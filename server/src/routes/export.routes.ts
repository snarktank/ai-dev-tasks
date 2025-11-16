import express from 'express';
import { prisma } from '@/config/database';
import { authenticate } from '@/middleware/auth';
import { AuthRequest } from '@/types';

const router = express.Router();

router.use(authenticate);

// Export placeholder (implement DocxExporter service separately)
router.post('/docx', async (req: AuthRequest, res) => {
  try {
    const { projectId, chapters } = req.body;
    
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
      include: {
        chapters: {
          where: chapters ? { chapterNumber: { in: chapters } } : {},
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // TODO: Implement actual export
    res.json({ message: 'Export feature coming soon', project: project.title });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

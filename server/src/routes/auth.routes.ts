import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!);
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!);
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

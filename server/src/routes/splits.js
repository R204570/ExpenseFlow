import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/splits/:expenseId – Create split for expense
router.post('/:expenseId', authenticate, async (req, res) => {
  try {
    const { totalPeople, participants } = req.body;
    const { expenseId } = req.params;

    if (!totalPeople || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'totalPeople and participants array are required' });
    }

    // Verify expense belongs to user
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if split already exists
    const existingSplit = await prisma.split.findUnique({
      where: { expenseId }
    });

    if (existingSplit) {
      // Update existing split
      await prisma.$transaction(async (tx) => {
        await tx.splitParticipant.deleteMany({
          where: { splitId: existingSplit.id }
        });

        await tx.split.update({
          where: { id: existingSplit.id },
          data: {
            totalPeople: parseInt(totalPeople),
            participants: {
              create: participants.map(p => ({
                name: p.name,
                amount: parseFloat(p.amount)
              }))
            }
          }
        });
      });

      const updatedSplit = await prisma.split.findUnique({
        where: { expenseId },
        include: { participants: true }
      });

      return res.json(updatedSplit);
    }

    // Create new split
    const split = await prisma.split.create({
      data: {
        expenseId,
        totalPeople: parseInt(totalPeople),
        participants: {
          create: participants.map(p => ({
            name: p.name,
            amount: parseFloat(p.amount)
          }))
        }
      },
      include: { participants: true }
    });

    res.status(201).json(split);
  } catch (error) {
    console.error('Create split error:', error);
    res.status(500).json({ error: 'Failed to create split' });
  }
});

// GET /api/splits/:expenseId – Get split for expense
router.get('/:expenseId', authenticate, async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.expenseId, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const split = await prisma.split.findUnique({
      where: { expenseId: req.params.expenseId },
      include: { participants: true }
    });

    if (!split) {
      return res.status(404).json({ error: 'Split not found' });
    }

    res.json(split);
  } catch (error) {
    console.error('Get split error:', error);
    res.status(500).json({ error: 'Failed to fetch split' });
  }
});

export default router;

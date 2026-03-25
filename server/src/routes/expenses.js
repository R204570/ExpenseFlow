import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function parseOptionalAmount(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function getPeriodStartDate(period) {
  const now = new Date();

  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

// POST /api/expenses – Create expense with optional items
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, tax, discount, date, merchant, category, notes, imageUrl, items } = req.body;

    if (!amount || !date || !merchant || !category) {
      return res.status(400).json({ error: 'Amount, date, merchant, and category are required' });
    }

    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          userId: req.user.id,
          amount: parseFloat(amount),
          tax: parseOptionalAmount(tax),
          discount: parseOptionalAmount(discount),
          date: new Date(date),
          merchant: merchant.trim(),
          category: category.trim(),
          notes: notes?.trim() || null,
          imageUrl: imageUrl || null,
          items: items?.length > 0 ? {
            create: items.map(item => ({
              name: item.name,
              price: parseFloat(item.price)
            }))
          } : undefined
        },
        include: {
          items: true
        }
      });

      return newExpense;
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// GET /api/expenses – List all expenses for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;

    const where = { userId: req.user.id };

    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { items: true, split: { include: { participants: true } } },
        orderBy: { [sortBy]: order },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/stats – Dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const startDate = getPeriodStartDate(period);

    let expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });
    let statsBasis = 'expense_date';

    // Fallback for cases where receipts have old bill dates but were added recently.
    if (expenses.length === 0) {
      expenses = await prisma.expense.findMany({
        where: {
          userId: req.user.id,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'asc' }
      });
      statsBasis = 'created_at';
    }

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

    // Category breakdown
    const categoryMap = {};
    expenses.forEach(e => {
      if (!categoryMap[e.category]) categoryMap[e.category] = 0;
      categoryMap[e.category] += e.amount;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));

    // Daily spending trend
    const dailyMap = {};
    expenses.forEach(e => {
      const referenceDate = statsBasis === 'created_at' ? e.createdAt : e.date;
      const day = referenceDate.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = 0;
      dailyMap[day] += e.amount;
    });
    const dailyTrend = Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100
    }));

    // Monthly spending trend
    const monthlyMap = {};
    expenses.forEach(e => {
      const referenceDate = statsBasis === 'created_at' ? e.createdAt : e.date;
      const month = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[month]) monthlyMap[month] = 0;
      monthlyMap[month] += e.amount;
    });
    const monthlyTrend = Object.entries(monthlyMap).map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100
    }));

    res.json({
      totalAmount: Math.round(totalAmount * 100) / 100,
      avgAmount: Math.round(avgAmount * 100) / 100,
      count: expenses.length,
      categoryBreakdown,
      dailyTrend,
      monthlyTrend,
      period,
      basis: statsBasis
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/expenses/:id – Get single expense
router.get('/:id', authenticate, async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, split: { include: { participants: true } } }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// PUT /api/expenses/:id – Update expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { amount, tax, discount, date, merchant, category, notes, imageUrl, items } = req.body;

    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = await prisma.$transaction(async (tx) => {
      // Delete old items if new ones provided
      if (items) {
        await tx.expenseItem.deleteMany({
          where: { expenseId: req.params.id }
        });
      }

      return tx.expense.update({
        where: { id: req.params.id },
        data: {
          amount: amount ? parseFloat(amount) : undefined,
          tax: parseOptionalAmount(tax),
          discount: parseOptionalAmount(discount),
          date: date ? new Date(date) : undefined,
          merchant: merchant?.trim(),
          category: category?.trim(),
          notes: notes !== undefined ? (notes?.trim() || null) : undefined,
          imageUrl: imageUrl !== undefined ? imageUrl : undefined,
          items: items?.length > 0 ? {
            create: items.map(item => ({
              name: item.name,
              price: parseFloat(item.price)
            }))
          } : undefined
        },
        include: { items: true, split: { include: { participants: true } } }
      });
    });

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id – Delete expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// POST /api/expenses/:id/items – Add items to expense
router.post('/:id/items', authenticate, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const createdItems = await prisma.expenseItem.createMany({
      data: items.map(item => ({
        expenseId: req.params.id,
        name: item.name,
        price: parseFloat(item.price)
      }))
    });

    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add items error:', error);
    res.status(500).json({ error: 'Failed to add items' });
  }
});

export default router;

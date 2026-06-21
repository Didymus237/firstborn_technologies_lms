import express from 'express';
import { 
  createExpense, 
  getExpenses, 
  updateExpense, 
  deleteExpense, 
  getBudgets, 
  upsertBudget, 
  getExpenseStats 
} from '../controllers/expense';
import { protect, authorize } from '../middleware/auth';

const expenseRouter = express.Router();

// Stats and budgets
expenseRouter.get('/stats', protect, authorize(['admin']), getExpenseStats);
expenseRouter.get('/budgets', protect, authorize(['admin']), getBudgets);
expenseRouter.post('/budgets/create', protect, authorize(['admin']), upsertBudget);

// Expenses CRUD
expenseRouter.get('/', protect, authorize(['admin']), getExpenses);
expenseRouter.post('/create', protect, authorize(['admin', 'teacher']), createExpense);
expenseRouter.put('/update/:id', protect, authorize(['admin']), updateExpense);
expenseRouter.delete('/delete/:id', protect, authorize(['admin']), deleteExpense);

export default expenseRouter;

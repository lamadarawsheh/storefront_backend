import express, { Request, Response } from 'express';
import { UserStore, User } from '../src/models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateToken } from '../src/middleware/auth';

dotenv.config();
const router = express.Router();
const userStore = new UserStore();
const { TOKEN_SECRET } = process.env;

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const user: User = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
    };
    const newUser = await userStore.create(user);
    const token = jwt.sign({ user: newUser }, TOKEN_SECRET as string);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userStore.authenticate(email, password);
    const token = jwt.sign({ user }, TOKEN_SECRET as string);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get all users (protected route)
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const users = await userStore.index();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Get a specific user (protected route)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await userStore.show(parseInt(req.params.id));
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Delete a user (protected route)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    await userStore.delete(parseInt(req.params.id));
    res.json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;

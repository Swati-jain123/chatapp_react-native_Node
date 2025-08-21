import { Router } from 'express';
import { authRest } from '../middleware/auth.js';
import User from '../models/User.js';

// import online map from socket handlers
import { online } from '../sockets/index.js';

const r = Router();

r.get('/', authRest, async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, avatarUrl: 1, lastSeen: 1 }).lean();

    const result = users
      .filter(u => u._id.toString() !== req.user.id)
      .map(u => ({
        ...u,
        isOnline: online.has(u._id.toString()), // 👈 merge presence info
      }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default r;

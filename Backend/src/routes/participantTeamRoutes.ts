import * as express from 'express';

const router = express.Router();

// Basic test route
router.get('/test', (req, res) => {
  res.json({ message: 'Participant team routes are working' });
});

export default router; 
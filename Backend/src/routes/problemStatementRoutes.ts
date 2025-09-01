import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  getProblemStatements,
  createProblemStatement,
  getTeamProblemSelection,
  selectProblemStatement,
  createProblemSelectionPoll,
  voteOnProblemSelectionPoll,
  completeProblemSelectionPoll,
  submitTeamSolution,
  getTeamSubmission,
  getAdminTeamData
} from '../controller/problemStatementController';

const router = express.Router();

// Public routes
router.get('/hackathon/:hackathonId', getProblemStatements);

// Protected routes
router.use(authenticateUser);

// Problem statement management
router.post('/', createProblemStatement);

// Team problem selection
router.get('/team/:teamId/hackathon/:hackathonId/selection', getTeamProblemSelection);
router.post('/select', selectProblemStatement);

// Poll management
router.post('/poll/create', createProblemSelectionPoll);
router.post('/poll/vote', voteOnProblemSelectionPoll);
router.post('/poll/:pollId/complete', completeProblemSelectionPoll);

// Submission management
router.post('/submit', submitTeamSolution);
router.get('/team/:teamId/hackathon/:hackathonId/submission', getTeamSubmission);

// Admin routes
router.get('/admin/hackathon/:hackathonId/team-data', getAdminTeamData);

export default router;
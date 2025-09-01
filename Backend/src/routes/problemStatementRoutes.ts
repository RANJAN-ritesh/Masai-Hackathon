import express from 'express';
import { 
  createProblemStatement, 
  getProblemStatements, 
  updateProblemStatement, 
  deleteProblemStatement 
} from '../controller/problemStatementController';
import {
  getSelectionWindowStatus,
  getTeamSelection,
  selectProblemStatement,
  createProblemPoll,
  voteOnPoll,
  completePoll,
  submitSolution,
  getTeamSubmission,
  getSubmissionWindowStatus,
  getTeamPolls,
  exportHackathonData
} from '../controller/problemStatementController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Existing problem statement CRUD routes
router.post('/create', verifyToken, createProblemStatement);
router.get('/hackathon/:hackathonId', getProblemStatements);
router.put('/update/:id', verifyToken, updateProblemStatement);
router.delete('/delete/:id', verifyToken, deleteProblemStatement);

// New selection system routes
router.get('/selection-window/:hackathonId', verifyToken, getSelectionWindowStatus);
router.get('/team-selection/:teamId/:hackathonId', verifyToken, getTeamSelection);
router.post('/select', verifyToken, selectProblemStatement);

// Poll system routes
router.post('/create-poll', verifyToken, createProblemPoll);
router.post('/vote', verifyToken, voteOnPoll);
router.put('/complete-poll/:pollId', verifyToken, completePoll);
router.get('/team-polls/:teamId/:hackathonId', verifyToken, getTeamPolls);

// Submission system routes
router.post('/submit', verifyToken, submitSolution);
router.get('/team-submission/:teamId/:hackathonId', verifyToken, getTeamSubmission);
router.get('/submission-window/:hackathonId', verifyToken, getSubmissionWindowStatus);

// Admin export route
router.get('/export/:hackathonId', verifyToken, exportHackathonData);

export default router;
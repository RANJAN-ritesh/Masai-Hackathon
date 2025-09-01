import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ProblemStatement from '../model/problemStatement';
import Team from '../model/team';
import Hackathon from '../model/hackathon';
import User from '../model/user';

// Basic CRUD operations
export const createProblemStatement = async (req: Request, res: Response) => {
  try {
    const { problemId, problemNo, techStack, link } = req.body;
    
    const problemStatement = new ProblemStatement({
      problemId,
      problemNo,
      techStack,
      link
    });

    await problemStatement.save();
    res.status(201).json({ message: 'Problem statement created successfully', problemStatement });
  } catch (error) {
    console.error('Error creating problem statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProblemStatements = async (req: Request, res: Response) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    res.json({ problemStatements: hackathon.problemStatements || [] });
  } catch (error) {
    console.error('Error getting problem statements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProblemStatement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const problemStatement = await ProblemStatement.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!problemStatement) {
      return res.status(404).json({ message: 'Problem statement not found' });
    }

    res.json({ message: 'Problem statement updated successfully', problemStatement });
  } catch (error) {
    console.error('Error updating problem statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProblemStatement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const problemStatement = await ProblemStatement.findByIdAndDelete(id);
    
    if (!problemStatement) {
      return res.status(404).json({ message: 'Problem statement not found' });
    }

    res.json({ message: 'Problem statement deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Placeholder functions for selection system (to be implemented)
export const getSelectionWindowStatus = async (req: Request, res: Response) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    const now = new Date();
    const selectionStart = new Date(hackathon.startDate.getTime() - 48 * 60 * 60 * 1000);
    const selectionEnd = new Date(hackathon.endDate.getTime() + 24 * 60 * 60 * 1000);
    const isActive = now >= selectionStart && now <= selectionEnd;

    res.json({
      isSelectionActive: isActive,
      selectionStart,
      selectionEnd,
      timeRemaining: isActive ? selectionEnd.getTime() - now.getTime() : 0
    });
  } catch (error) {
    console.error('Error getting selection window status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTeamSelection = async (req: Request, res: Response) => {
  try {
    res.json({ selection: null }); // Placeholder
  } catch (error) {
    console.error('Error getting team selection:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const selectProblemStatement = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Problem statement selection - Coming soon!' });
  } catch (error) {
    console.error('Error selecting problem statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProblemPoll = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Problem poll creation - Coming soon!' });
  } catch (error) {
    console.error('Error creating problem poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const voteOnPoll = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Poll voting - Coming soon!' });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completePoll = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Poll completion - Coming soon!' });
  } catch (error) {
    console.error('Error completing poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitSolution = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Solution submission - Coming soon!' });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTeamSubmission = async (req: Request, res: Response) => {
  try {
    res.json({ submission: null }); // Placeholder
  } catch (error) {
    console.error('Error getting team submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubmissionWindowStatus = async (req: Request, res: Response) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    const now = new Date();
    const isActive = now >= hackathon.startDate && now <= hackathon.submissionEndDate;
    const timeRemaining = isActive ? hackathon.submissionEndDate.getTime() - now.getTime() : 0;

    res.json({
      isSubmissionActive: isActive,
      submissionStart: hackathon.startDate,
      submissionEnd: hackathon.submissionEndDate,
      timeRemaining
    });
  } catch (error) {
    console.error('Error getting submission window status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTeamPolls = async (req: Request, res: Response) => {
  try {
    res.json({ polls: [] }); // Placeholder
  } catch (error) {
    console.error('Error getting team polls:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const exportHackathonData = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Data export - Coming soon!' });
  } catch (error) {
    console.error('Error exporting hackathon data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

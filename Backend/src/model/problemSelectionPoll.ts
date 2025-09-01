import mongoose from 'mongoose';

const problemSelectionPollSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProblemStatement',
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  selectedProblemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemStatement'
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one active poll per team
problemSelectionPollSchema.index({ teamId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });

export const ProblemSelectionPoll = mongoose.model('ProblemSelectionPoll', problemSelectionPollSchema);

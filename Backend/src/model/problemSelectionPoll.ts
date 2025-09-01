import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemSelectionPoll extends Document {
  teamId: mongoose.Types.ObjectId;
  hackathonId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  problemOptions: mongoose.Types.ObjectId[];
  votes: Array<{
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    votedAt: Date;
  }>;
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  winningProblemId?: mongoose.Types.ObjectId;
}

const problemSelectionPollSchema = new Schema<IProblemSelectionPoll>({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  hackathonId: {
    type: Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Problem Statement Selection Poll'
  },
  description: {
    type: String,
    default: 'Vote for the problem statement your team will work on'
  },
  problemOptions: [{
    type: Schema.Types.ObjectId,
    ref: 'ProblemStatement'
  }],
  votes: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'ProblemStatement',
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  winningProblemId: {
    type: Schema.Types.ObjectId,
    ref: 'ProblemStatement',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
problemSelectionPollSchema.index({ teamId: 1 });
problemSelectionPollSchema.index({ hackathonId: 1 });
problemSelectionPollSchema.index({ status: 1, expiresAt: 1 });
problemSelectionPollSchema.index({ createdBy: 1 });

export const ProblemSelectionPoll = mongoose.model<IProblemSelectionPoll>('ProblemSelectionPoll', problemSelectionPollSchema); 
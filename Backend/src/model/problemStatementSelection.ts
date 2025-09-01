import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemStatementSelection extends Document {
  teamId: mongoose.Types.ObjectId;
  hackathonId: mongoose.Types.ObjectId;
  selectedProblemId?: mongoose.Types.ObjectId;
  selectedBy?: mongoose.Types.ObjectId;
  selectedAt?: Date;
  isLocked: boolean;
  selectionMethod: 'individual' | 'poll' | 'random';
  createdAt: Date;
  updatedAt: Date;
}

const problemStatementSelectionSchema = new Schema<IProblemStatementSelection>({
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
  selectedProblemId: {
    type: Schema.Types.ObjectId,
    ref: 'ProblemStatement',
    default: null
  },
  selectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  selectedAt: {
    type: Date,
    default: null
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  selectionMethod: {
    type: String,
    enum: ['individual', 'poll', 'random'],
    default: 'individual'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
problemStatementSelectionSchema.index({ teamId: 1, hackathonId: 1 }, { unique: true });
problemStatementSelectionSchema.index({ hackathonId: 1 });
problemStatementSelectionSchema.index({ selectedProblemId: 1 });

export const ProblemStatementSelection = mongoose.model<IProblemStatementSelection>('ProblemStatementSelection', problemStatementSelectionSchema); 
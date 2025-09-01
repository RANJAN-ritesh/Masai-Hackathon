import mongoose from 'mongoose';

const teamProblemSelectionSchema = new mongoose.Schema({
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
  selectedProblemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemStatement',
    required: true
  },
  selectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selectedAt: {
    type: Date,
    default: Date.now
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  selectionMethod: {
    type: String,
    enum: ['individual', 'poll', 'random', 'admin'],
    default: 'individual'
  },
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemSelectionPoll'
  }
});

// Ensure one selection per team per hackathon
teamProblemSelectionSchema.index({ teamId: 1, hackathonId: 1 }, { unique: true });

export const TeamProblemSelection = mongoose.model('TeamProblemSelection', teamProblemSelectionSchema);

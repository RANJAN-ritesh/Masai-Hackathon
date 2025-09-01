import mongoose from 'mongoose';

const teamSubmissionSchema = new mongoose.Schema({
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
  submissionUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Submission URL must be a valid HTTP/HTTPS URL'
    }
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isFinal: {
    type: Boolean,
    default: true
  }
});

// Ensure one submission per team per hackathon
teamSubmissionSchema.index({ teamId: 1, hackathonId: 1 }, { unique: true });

export const TeamSubmission = mongoose.model('TeamSubmission', teamSubmissionSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamSubmission extends Document {
  teamId: mongoose.Types.ObjectId;
  hackathonId: mongoose.Types.ObjectId;
  submissionUrl: string;
  submittedBy: mongoose.Types.ObjectId;
  submittedAt: Date;
  isValidUrl: boolean;
  urlCheckedAt: Date;
  submissionTitle?: string;
  submissionDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamSubmissionSchema = new Schema<ITeamSubmission>({
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isValidUrl: {
    type: Boolean,
    default: false
  },
  urlCheckedAt: {
    type: Date,
    default: Date.now
  },
  submissionTitle: {
    type: String,
    maxlength: 200
  },
  submissionDescription: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
teamSubmissionSchema.index({ teamId: 1, hackathonId: 1 }, { unique: true });
teamSubmissionSchema.index({ hackathonId: 1 });
teamSubmissionSchema.index({ submittedBy: 1 });
teamSubmissionSchema.index({ submittedAt: 1 });

export const TeamSubmission = mongoose.model<ITeamSubmission>('TeamSubmission', teamSubmissionSchema); 
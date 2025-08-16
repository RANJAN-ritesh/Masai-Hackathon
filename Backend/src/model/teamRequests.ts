import mongoose, { Schema } from "mongoose";

export interface ITeamRequest extends Document {
    requestId: string;
    userId: mongoose.Schema.Types.ObjectId;
    teamId: mongoose.Schema.Types.ObjectId;
    status: "pending" | "approved" | "rejected";
}

const TeamRequestSchema = new Schema<ITeamRequest>(
    {
        requestId: { type: String, required: true, unique: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
    },
    { timestamps: true }
);

export default mongoose.model<ITeamRequest>("TeamRequest", TeamRequestSchema);
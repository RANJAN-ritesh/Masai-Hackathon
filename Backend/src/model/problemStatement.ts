import mongoose, { Schema, Document } from "mongoose";

export interface IProblemStatement extends Document {
    problemId: string;
    problemNo: number;
    techStack: string[]; 
    link: string; 
}

const ProblemStatementSchema = new Schema<IProblemStatement>(
    {
        problemId: { type: String, required: true, unique: true },
        problemNo: { type: Number, required: true, unique: true },
        techStack: { type: [String], required: true }, 
        link: { type: String, required: true }
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.model<IProblemStatement>("ProblemStatement", ProblemStatementSchema);

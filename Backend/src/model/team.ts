import mongoose, { Schema } from "mongoose"


export interface ITeam extends Document{
    createdBy: mongoose.Schema.Types.ObjectId,
    teamName: string,
    memberLimit : number,
    teamMembers : mongoose.Schema.Types.ObjectId[];
}

const teamSchema = new Schema<ITeam>({
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Links to User
            teamName: { type: String, required: true, unique: true },
            memberLimit: { type: Number, required: false, max: 3 },
            teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}]
},
{
    timestamps:true
})

export default mongoose.model<ITeam>("Team", teamSchema);
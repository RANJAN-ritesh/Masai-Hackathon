import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document{
    userId:string;
    name: string;
    code: string;
    course: string;
    skills: string[];
    vertical: string;
    phoneNumber: string;
    email: string;
    password: string;
    teamId?: string; 
    hackathonIds?: string[]; // Track which hackathons user is part of
    isVerified: boolean;
    role: "admin" | "leader" | "member";
    // NEW FIELDS FOR PARTICIPANT TEAM CREATION
    teamsCreated: mongoose.Types.ObjectId[];
    currentTeamId?: mongoose.Types.ObjectId;
    canSendRequests: boolean;
    canReceiveRequests: boolean;
    lastTeamActivity?: Date;
    // Timestamp fields from mongoose timestamps
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    userId: { type: String, required: true, unique: true },
    name: {type:String, required: true}, // Removed unique constraint - multiple users can have same name
    code: {type:String, required:true},
    course: {type:String, required:true},
    skills: {type:[String], required:true},
    vertical: {type:String, required:true},
    phoneNumber: {type:String, required:false}, // Removed unique constraint and made optional
    email: {type:String, required:true, unique:true, lowercase:true},
    password: {type:String, required:true},
    teamId: {type:String, required:false}, // Make teamId optional
    hackathonIds: {type:[String], required:false, default:[]}, // Track hackathon associations
    isVerified: {type:Boolean, required:true, default:false},
    role: {type:String, enum:["admin", "leader", "member"],required:true, default:"member"},
    // NEW FIELDS FOR PARTICIPANT TEAM CREATION
    teamsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    currentTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    canSendRequests: { type: Boolean, default: true },
    canReceiveRequests: { type: Boolean, default: true },
    lastTeamActivity: { type: Date }
}, 
{ timestamps: true})

export default mongoose.model<IUser>("User", UserSchema);
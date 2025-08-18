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
}

const UserSchema = new Schema<IUser>({
    userId: { type: String, required: true, unique: true },
    name: {type:String, required: true, unique: true},
    code: {type:String, required:true},
    course: {type:String, required:true},
    skills: {type:[String], required:true},
    vertical: {type:String, required:true},
    phoneNumber: {type:String, required:true, unique:true},
    email: {type:String, required:true, unique:true, lowercase:true},
    password: {type:String, required:true},
    teamId: {type:String, required:false}, // Make teamId optional
    hackathonIds: {type:[String], required:false, default:[]}, // Track hackathon associations
    isVerified: {type:Boolean, required:true, default:false},
    role: {type:String, enum:["admin", "leader", "member"],required:true, default:"member"}
}, 
{ timestamps: true})

export default mongoose.model<IUser>("User", UserSchema);
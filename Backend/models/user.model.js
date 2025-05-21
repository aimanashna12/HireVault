import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phoneNumber:{
        type:String,
        required:true,
        unique:true
    },
    password:{ 
        type:String,
        required:true
    },  
    role:{
        type:String,
        enum: ['Student','Recruiter'],
        default: "Student",
        required: true,
    },
    profile: {
        bio:{
            type: String
        },
        skills:[{
            type: String
        }],
        resume: {
            type: String //url of the resume file
        },
        resumeOriginalname: {
            type: String //original name of the resume file
        },
        company:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        },
        profilePhoto: {
            type: String, //url of the profile photo file
            default: "",
        },
    },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const{ fullname, email, phoneNumber, password, role} = req.body;
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(404).json({ 
                error: "All fields are required",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(404).json({
                error: "User already exists",
                success: false,
            });
        }

        // converting password to hash
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
        });
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                role: newUser.role,
            },
        });

    } catch (error) {
        console.log("Error registering user:", error.message);
        res.status(500).json({
            error: "Server error in registering user ",
            success: false,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(404).json({
                error: "All fields are required",
                success: false,
            });
        }
        let user = await User.findOne({ email }); // with let so that we can update user later on 
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                success: false,
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).json({
                error: "Invalid credentials",
                success: false,
            });
        }
        // check role correctly or not
        if (user.role!== role) {
            return res.status(404).json({
                error: "Invalid role",
                success: false,
            });
        }

        // generate token 
        const tokenData = {
            userId: user._id,
        };
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { 
            expiresIn: "1d",
        });

        // update user with token
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).cookie("token", token, {
            maxAge: 1* 24* 60* 60* 1000,
            httpOnly: true,
            sameSite: "strict" //to ensure data can not be accessed from hackers 
        }).json({

            message: `Welcome back ${user.fullname}!`,
            user,
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
            success: false,
        });
    }
};


export const logout = async (req, res) => {
    try {
        return res.status(200).clearCookie("token", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "strict",
        }).json({
            message: "Logged out successfully",
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
            success: false,
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.files;
        let skillsArray ;
        if(skills){
            const skillsArray = skills.split(',');
        }
        // cloudinary upload

        const usrId = req.id; // middleware authenticated
        let user = await User.findById (usrId);
        if(!user) {
            return res.status(404).json({
                error: "User not found",
                success: false,
            });
        }
        if(fullname) user.fullname = fullname;
        if(email) user.email = email;
        if(phoneNumber) user.phoneNumber = phoneNumber;
        if(bio) user.bio = bio;
        if(skills) user.skills = skillsArray;
        
        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
            success: false,
        });
    };
}

import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import bcrypt from 'bcryptjs';

//............signup controller.............
export const signup= async (req,res)=>{
    try{
      const {fullName, username,email,password} = req.body;
     
      //for email verification....
      const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(email)){
        return res.status(400).json({error:"Invalid email format"});
      }
      
      //checking for existing username....
      const existingUser= await User.findOne({username});
      if(existingUser){
        return res.status(400).json({error:"Username is already taken"});
      }
      
      //checking for existing emailId......
      const existingEmail= await User.findOne({email});
      if(existingUser){
        return res.status(400).json({error:"Email is already taken"});
      }
      
      if(password.length<6){
        return res.status(400).json({error:"Password must be at least 6 character long"});
      }
      //hashing the password...........
      const salt=await bcrypt.genSalt(10);
      const hashPassword= await bcrypt.hash(password, salt);

      const newUser= new User({
         fullName,
         username,
         email,
         password:hashPassword,
      })
     if(newUser){
        generateTokenAndSetCookie(newUser._id,res);
        await newUser.save();

        //returning data to the client system.......
        res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            username:newUser.username,
            email:newUser.email,
            follower:newUser.followers,
            following:newUser.following,
            profileImg:newUser.profileImg,
            coverImg:newUser.coverImg,
        });
     }
     else{
        res.status(400).json({error:"Invalid user data"}); 
     }

    }
    catch(error){
       console.log("Error in signup controller",error.message);
       res.status(500).json({error:"Internal Server Error"});
    }
}
//............End of Signup controllers..............................

//.......login controller......................
export const login= async (req,res)=>{
    try{
       const {username,password} = req.body;
       const user= await User.findOne({username});
       const ispasswordCorrect = await bcrypt.compare(password,user?.password || "");
       if(!user || !ispasswordCorrect){
          res.status(400).json({error:"Invalid username or password"});
       } 
      
       generateTokenAndSetCookie(user._id,res);
       res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            username:user.username,
            email:user.email,
            follower:user.followers,
            following:user.following,
            profileImg:user.profileImg,
            coverImg:user.coverImg,
        });

    }
    catch(error){
       console.log("Error in login controller",error.message);
       res.status(500).json({error:"Internal Server Error"});
    }
}
//.....End of login controller

//.......logout controller......................
export const logout= async (req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    }
    catch(error){
        console.log("Error in logout controller",error.message);
       res.status(500).json({error:"Internal Server Error"});
    }
}

//controller to check that user is authenticated or not.......
export const getMe = async(req,res)=>{
    try{
      const user= await User.findById(req.user._id).select("-password");
      res.status(200).json(user);
    }
    catch(error){
       console.log("Error in getMe controller",error.message);
       res.status(500).json({error:"Internal Server Error"});
    }
}
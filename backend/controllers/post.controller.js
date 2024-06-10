import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

//.......create Post controller........................
export const createPost = async (req,res)=>{
    try{
       const { text } = req.body;
       let { img } =req.body;
       const userId= req.user._id.toString();

       const user = await User.findById(userId);
       if(!user) return res.status(404).json({ message:"user not found"});

       if(!text && !img){
        return res.status(400).json({ message:"Post must have text or image"});
       }

//.......upload image in cloundinary and getting secure url..........
       if(img){
        const uploadedResponse = await cloudinary.uploader.upload(img);
        img = uploadedResponse.secure_url;
       }

       const newPost = new Post({
         user:userId,
         text,
         img
       });

       await newPost.save();
       res.status(201).json(newPost);

    }
    catch(error){
       console.log("Error in createPost controller",error.message);
       res.status(500).json({error:error.message});
    }
}
//.......End of createPost controller.......................

//.........delete Post controller........................
export const deletePost = async (req,res)=>{
   try{
     const post = await Post.findById(req.params.id);
     if(!post){
        return res.status(404).json({error:"Post not found"});
     }
     if(post.user.toString()!==req.user._id.toString()){
        return res.status(401).json({error:"you are not authorized to delete this post"});
     }

     //....first delete the image from the cloudinary..........
     if(post.img){
        const imgId= Post.img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
     }

     await Post.findByIdAndDelete(req.params.id);
     res.status(200).json({message:"Post deleted successfully"});
   }
   catch(error){
       console.log("Error in deletePost controller",error.message);
       res.status(500).json({error:error.message});
   } 
}
//................End of delete Post controller..................

//.........commentOnPost controllers...............
export const commentOnPost = async (req,res)=>{
  try{
    const { text } = req.body;
    const postId= req.params.id;
    const userId = req.user._id;
    if(!text){
        return res.status(400).json({error:"Text field is required"});
    }
    
    const post= await Post.findById(postId);
    if(!post){
        return res.status(404).json({error:"Post not found"});
    }

    const comment = {user:userId,text};

    post.comments.push(comment);
    await post.save();
    const updatedComments = post.comments;
    res.status(200).json(updatedComments);
  }
  catch(error){
     console.log("Error in commentOnPost controller",error.message);
     res.status(500).json({error:error.message});
  }
}
//.........End of commentOnPostController.............

//............likeUnlike post controllers......................
export const likeUnlikePost = async (req,res)=>{
   try{
     const userId= req.user._id;
     const {id:postId} = req.params;

    const post= await Post.findById(postId);
    if(!post){
        return res.status(404).json({error:"Post not found"});
    }

    const userLikedPost = post.likes.includes(userId);

    if(userLikedPost){
        //Unlike post
     await Post.updateOne({_id:postId},{$pull:{likes:userId}});
     //update in user model that unlike the post 
     await User.updateOne({_id:userId},{$pull:{likedPosts:postId}});

     const updatedLikes = post.likes.filter((id)=> id.toString()!==userId.toString());

     res.status(200).json(updatedLikes);
    }
    else{
      //likes post
      post.likes.push(userId);

      //push in the User model liked posts
      await User.updateOne({_id:userId},{$push:{likedPosts:postId}});

      await post.save();

      const notification=new Notification(
        {
          from: userId,
          to:  post.user,
          type:"like",
        }
      );
      await notification.save();
      
      const updatedLikes = post.likes;
     // console.log(updatedLikes);
      res.status(200).json(updatedLikes);
    }
   }
   catch(error){
     console.log("Error in likeUnlikePost controller",error.message);
     res.status(500).json({error:error.message});
   }
}
//.....End of likeUnlikePostController...............

//........getAllPosts controller......................
export const getAllPosts = async (req,res)=>{
  try{

    //...get all posts from post models but in post model we have only userId but i want username fullname that why i populate it.....
    const posts= await Post.find().sort({createdAt: -1}).populate({
        path:"user",
        select:"-password"
    })
    .populate({
        path:"comments.user",
        select:"-password",
    })

    if(posts.length==0){
       return res.status(200).json([]); 
    }

    res.status(200).json(posts);
  }
  catch(error){
    console.log("Error in getAllPosts controller",error.message);
     res.status(500).json({error:error.message});
  }
}
//.......end of getAllPosts controllers..................


//........getLikedPosts contollers...........................
export const getLikedPosts = async(req,res) =>{
  const userId = req.params.id;
  console.log(userId);
  try{
    const user=await User.findById(userId);
    if(!user){
      return res.status(404).json({error:"User not found"});
    }
    const likedPosts= await Post.find({_id:{$in:user.likedPosts}}).populate({
      path:"user",
      select:"-password"
    })
    .populate({
      path:"comments.user",
      select:"-password",
      
    });

    res.status(200).json(likedPosts);

  }
  catch(error){
     console.log("Error in getLikedPosts controller",error.message);
     res.status(500).json({error:error.message});
  }
}
//................End of getLikedposts...............................

//.........getFollowingPost controller.................................
export const getFollowingPosts= async(req,res)=>{
   try{
     const userId= req.user._id;
     const user = await User.findById(userId);
     if(!user){
      return res.status(404).json({error:"user not found"});
     }
     const following = user.following;  //give the arry of following user

     //find the post which is posted by following users....................
    const feedPosts = await Post.find({user: {$in: following}})
    .sort({createdAt:-1})
    .populate({
      path:"user",
      select:"-password",
    })
    .populate({
      path:"comments.user",
      select:"-password",
    })

    res.status(200).json(feedPosts);
   } 
   catch(error){
     console.log("Error in getFollowingPosts controller",error.message);
     res.status(500).json({error:error.message});
   }
}
//.........End of getFollowingPosts.............................

//................getUsersPosts controllers..............................
export const getUserPosts = async(req,res) =>{
  try{
    const { username } = req.params;
    const user = await User.findOne({ username });

    if(!user){
      return res.status(404).json({error:"user not found"});
    }

    const posts = await Post.find({user:user._id}).sort({ createdAt:-1 }).populate({
      path:"user",
      select:"-password",
    }).populate({
      path:"comments.user",
      select:"-password",
    })
    res.status(200).json(posts);

  }
  catch(error){
     console.log("Error in getUserPosts controller",error.message);
     res.status(500).json({error:error.message});
  }
}
//........end of getUserPosts controllers..........................


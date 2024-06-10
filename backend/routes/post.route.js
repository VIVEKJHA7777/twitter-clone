import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost,deletePost,commentOnPost,likeUnlikePost,getAllPosts,getLikedPosts,getFollowingPosts,getUserPosts } from '../controllers/post.controller.js';
const router= express.Router();

router.get('/all',protectRoute,getAllPosts);  //get all posts
router.get("/following",protectRoute,getFollowingPosts) //get only posts that is following by the user
router.get("/likes/:id", protectRoute,getLikedPosts);  //get liked posts by the user
router.get("/user/:username",protectRoute,getUserPosts)  //get all posts posted by user...
router.post('/create', protectRoute, createPost); //create the post
router.post('/like/:id', protectRoute, likeUnlikePost);  //like and unlike the post
router.post('/comment/:id', protectRoute, commentOnPost); //comment on posts
router.delete("/:id",protectRoute, deletePost);  //deleting the post

export default router;
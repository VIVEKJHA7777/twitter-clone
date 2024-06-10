import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile,followUnfollowUser,getSuggestedUsers,updateUser } from '../controllers/user.controller.js';
const router= express.Router();

router.get('/profile/:username',protectRoute,getUserProfile); //get userProfile route.......
router.get("/suggested",protectRoute,getSuggestedUsers);  //get all the suggested user which is not followed bu user
router.post("/follow/:id",protectRoute,followUnfollowUser);  //route to follow and unfollow the user.......
router.post("/update",protectRoute,updateUser);  //route to update the profile of the user.....................


export default router;
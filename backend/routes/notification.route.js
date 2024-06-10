import express from 'express';
const router= express.Router();
import { protectRoute } from '../middleware/protectRoute.js';
import { getNotifications,deleteNotifications,deleteOneNotification } from '../controllers/notification.controller.js';

router.get("/",protectRoute,getNotifications);  //..get all the notification for the user for liking folloow or comment
router.delete("/",protectRoute,deleteNotifications);  //delete all the notification for the user
router.delete("/:id",protectRoute,deleteOneNotification );  //delete only one notification that is done by th user ....


export default router;
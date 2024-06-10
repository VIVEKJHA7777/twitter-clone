import Notification from "../models/notification.model.js";

//......getNotifications controller........................
export const getNotifications = async(req,res)=>{
  try{
   const userId= req.user._id;
   if(!userId){
    return res.status(404).json({error:"User not found"});
   }
   //get only username and profie img of the user
   const notifications= await Notification.find({to:userId}).populate({
    path:"from",
    select:"username profileImg"
   });

   //update notification model that notification is read by user
   await Notification.updateMany({to:userId},{read:true});

   res.status(200).json(notifications);

  }
  catch(error){
     console.log("Error in getNotifications controller",error.message);
     res.status(500).json({error:error.message});
  }
}
//......End of getNotifications controllers..................

//............deleteNotification controller....................
export const deleteNotifications = async(req,res)=>{
  try{
   const userId = req.user._id;
   await Notification.deleteMany({to:userId});
   res.status(200).json({message:"Notification deleted successfully"});
  }
  catch(error){
    console.log("Error in deleteNotifications controller",error.message);
     res.status(500).json({error:error.message});
  }
}
//............End of deleteNotification controller..........

//.......deleteoneNotification controllers.......................
export const deleteOneNotification = async(req,res)=>{
    try{
        const notificationId = req.params.id;
        const userId= req.user._id;
        const notification = await Notification.findById(notificationId);

        if(!notification){
          return res.status(404).json({error:"Notification not found"});
        }
        if(notification.to.toString() ===userId.toString()){
            return res.status(403).json({error:"you are not allowed to delete this notification"})
        }
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({message:"Notification deleted successfully"});

    }
    catch(error){
        console.log("Error in deleteOneNotifications controller",error.message);
        res.status(500).json({error:error.message});
    }
}
//...........End of deleteoneNotifications controllers........................
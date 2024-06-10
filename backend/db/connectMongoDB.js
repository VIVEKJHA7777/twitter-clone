import mongoose from "mongoose";


//............mongoDB connection logic.....................
const connectMongoDB = async ()=>{
    try{
       // console.log(process.env.MONGODB_URI)
       const conn= await mongoose.connect(process.env.MONGODB_URI);
       console.log(`MongoDB connected : ${conn.connection.host}`);
    }
    catch(error){
        console.error(`Error connection to mongoDB: ${error.message}`);
        process.exit(1);
    }
}
export default connectMongoDB;
import mongoose from "mongoose";
import dns from  "node:dns"
dns.setServers(["8.8.8.8" ,"1.1.1.1"])



import dotenv  from "dotenv";
dotenv.config()

const connectdb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("mongodb connected");
        
    } catch (error) {
        console.log("can't connect mongodb" , error);
        
    }
}

export default connectdb;
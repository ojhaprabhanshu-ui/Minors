import app from "./src/app.js"
import dotenv from "dotenv"
dotenv.config();
import connectdb from "./src/config/db.js";


connectdb()



let PORT = process.env.port;

app.listen(PORT , ()=>{
    console.log(`server is running at ${PORT}`);
    
})
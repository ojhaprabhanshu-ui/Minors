import multer from "multer"
import dotenv from "dotenv"
import ImageKit from "imagekit"
dotenv.config()

const storageInstance = new ImageKit({
    publicKey : process.env.IK_PUB_KEY,
    privateKey :process.env.IK_PRI_KEY,
    urlEndpoint : process.env.IK_URL
})

export const sendfiles = async (file ,fileName)=>{
let obj ={
    file,
    fileName,
    folder :"VEREZA"
};
return await storageInstance.upload(obj);
}


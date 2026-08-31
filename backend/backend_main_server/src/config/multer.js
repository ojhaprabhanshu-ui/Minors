import multer from "multer"

let storage = multer.memoryStorage()

 const upload = multer({storage});

 export default upload;
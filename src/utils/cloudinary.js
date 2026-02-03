import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

//These are the configuration for the cloudinary
  cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

export const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
       const response = await cloudinary.uploader.upload(localFilePath , {resource_type : auto})
       console.log("File is uploaded successfully",response.url)
       return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the local saved temporary files as the operation got failed 
        return null
    }

}
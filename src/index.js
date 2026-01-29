// require('dotenv').config({path : './env'})

import dotenv from "dotenv"
import { connectDB } from "./db/index.js";

dotenv.config({path : './env'})

connectDB();


//This is the other method by which we can make a connection here but also perform professional way;
// import express from "express"
// const app = express()

// ;(async()=>{
// try {
// await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
// app.on("error",(error)=>{
// console.log("ERROR",error);
// throw error
// })
// app.listen(process.env.PORT,()=>{
// console.log(`App is listening on PORT ${process.env.PORT}`)
// })
// } catch (error) {
// console.error("Error connnecting DB", error)
// throw error;

// }
// })() //using IFFI funtion that directly invoke 

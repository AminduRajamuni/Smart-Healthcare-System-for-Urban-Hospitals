import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

let mongoUrl = process.env.mongo_url;

mongoose.connect(mongoUrl);
let connection = mongoose.connection;
connection.once("open", ()=>{
    console.log("MongoDB connection established successfully!")
})

import express from "express"
import dotenv from "dotenv";

import authRoutes from "./routes/authroute.js";
import {connectDB} from "./lib/db.js";

// Load environment variables from .env file

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// Middleware to handle CORS

app.use("/api/auth",authRoutes)

app.listen(PORT,()=>{
    console.log("Server is running on port 5001")
    connectDB();
});
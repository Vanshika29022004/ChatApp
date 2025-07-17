import jwt from "jsonwebtoken";
import { User } from "../models/User.js";


export const protectRoute = async (req, res, next) => {

    try{
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access - No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized access - Invalid token" });
        }
        const user = await User.findById(decoded.userid);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized access - User not found" });
        }

        req.user = user;
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized access - Error verifying token" });
    }

}
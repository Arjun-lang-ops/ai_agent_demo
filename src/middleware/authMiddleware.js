import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {

    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Token required."
        });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT token
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }

    // 3. Find user in database
    const user = await User.findById(decoded.userId)
        .select("fullname email role tenantId isActive");

    if (!user || !user.isActive) {
        return res.status(401).json({
            success: false,
            message: "User not found or account is inactive."
        });
    }

    // 4. Find user's tenant
    const tenant = await Tenant.findById(user.tenantId)
        .select("name plan isActive");

    if (!tenant || !tenant.isActive) {
        return res.status(403).json({
            success: false,
            message: "Your organization is inactive."
        });
    }

    // 5. Attach authenticated information to request
    req.user = user;
    req.tenant = tenant;
    req.tenantId = user.tenantId;

    next();
});

export default protect;
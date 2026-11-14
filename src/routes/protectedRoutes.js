import express from "express";

import protect from "../middleware/authMiddleware.js";
import requireTenant from "../middleware/tenantMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protected route for all authenticated tenant users
router.get("/profile", protect, requireTenant, (req, res) => {

    res.status(200).json({
        success: true,
        message: "You have accessed a protected route.",
        user: {
            id: req.user._id,
            fullname: req.user.fullname,
            email: req.user.email,
            role: req.user.role
        },
        tenant: {
            id: req.tenant._id,
            name: req.tenant.name
        }
    });

});

// Admin-only route
router.get(
    "/admin",
    protect,
    requireTenant,
    authorizeRoles("ADMIN"),
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Welcome, Admin!"
        });

    }
);

export default router;
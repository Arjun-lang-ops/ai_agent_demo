import Tenant from "../models/Tenant.js";

const requireTenant = async (req, res, next) => {
    try {
        if (!req.user || !req.user.tenantId) {
            return res.status(403).json({
                success: false,
                message: "Tenant authorization required."
            });
        }

        const tenant = await Tenant.findById(req.user.tenantId);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found."
            });
        }

        if (!tenant.isActive) {
            return res.status(403).json({
                success: false,
                message: "Tenant account is inactive."
            });
        }

        req.tenant = tenant;
        req.tenantId = tenant._id;

        next();

    } catch (error) {
        next(error);
    }
};

export default requireTenant;
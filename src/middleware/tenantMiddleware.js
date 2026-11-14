const requireTenant = (req, res, next) => {

    if (!req.user || !req.tenantId || !req.tenant) {
        return res.status(403).json({
            success: false,
            message: "Tenant authorization required."
        });
    }

    if (!req.tenant.isActive) {
        return res.status(403).json({
            success: false,
            message: "Tenant account is inactive."
        });
    }

    next();
};

export default requireTenant;
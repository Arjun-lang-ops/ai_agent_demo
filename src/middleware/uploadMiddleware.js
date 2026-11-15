import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadRoot = path.resolve("uploads");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        const tenantFolder = path.join(
            uploadRoot,
            req.tenantId.toString()
        );

        fs.mkdirSync(tenantFolder, {
            recursive: true
        });

        cb(null, tenantFolder);
    },

    filename: (req, file, cb) => {

        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName = `${crypto.randomUUID()}${extension}`;

        cb(null, uniqueName);
    }

});

// Allowed file types
const allowedExtensions = [".pdf", ".docx", ".txt"];

const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
];

const fileFilter = (req, file, cb) => {

    const extension = path.extname(file.originalname).toLowerCase();

    const isAllowedExtension = allowedExtensions.includes(extension);

    const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype);

    if (isAllowedExtension && isAllowedMimeType) {
        return cb(null, true);
    }

    cb(new Error("Only PDF, DOCX, and TXT files are allowed."));
};

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    }

});

export default upload;
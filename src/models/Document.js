import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        originalName: {
            type: String,
            required: true
        },

        storedName: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        mimeType: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        extractedText: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["UPLOADED", "EXTRACTED", "FAILED","CHUNKED","EMBEDDED"],
            default: "UPLOADED"
        }
    },
    {
        timestamps: true
    }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
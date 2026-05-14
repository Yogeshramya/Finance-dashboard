import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },

        email: { type: String, required: true, unique: true },

        password: { type: String, required: true },

        role: {
            type: String,
            enum: [
                "ADMINISTRATOR",
                "AREA_MANAGER",
                "MANAGER",
                "EMPLOYEE_MFI"
            ],
            default: "EMPLOYEE_MFI"
        },

        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch"
        },

        branches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Branch"
            }
        ]

    },
    { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
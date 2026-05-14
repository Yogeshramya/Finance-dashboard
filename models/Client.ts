import mongoose, { Schema } from "mongoose";

const FamilySchema = new Schema({
    name: String,
    relation: String,
    occupation: String,
    income: Number,
    phone: String,
});

const NomineeSchema = new Schema({
    name: String,
    dob: String,
    age: String,
    gender: String,
    aadhar: String,
    phone: String,
    relation: String,
    photo: String,
    occupation: String,
    aadhaarFront: String,
    aadhaarBack: String,
});

const ClientSchema = new Schema(
    {
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
        branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },

        joiningDate: String,

        customerCode: { type: String, required: true },
        name: { type: String, required: true },

        dob: String,
        age: String,
        gender: String,

        doorStreet: String,
        area: String,
        city: String,
        district: String,
        state: String,
        postalCode: String,

        aadhar: String,
        phone: { type: String, required: true },

        memberPhoto: String,
        memberAadhaarFront: String,
        memberAadhaarBack: String,
        documentFile: String,

        voterId: String,
        rationCard: String,
        religion: String,
        houseType: String,

        nominee: NomineeSchema,

        refundSavings: {
            type: Boolean,
            default: false,
            index: true,
        },

        panNo: String,
        occupation: String,

        savingsDue: String,
        loanType: String,
        loanAmount: String,
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "CLOSED"],
            default: "PENDING",
            index: true,
        },

        familyDetails: [FamilySchema],
    },
    { timestamps: true }
);

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);

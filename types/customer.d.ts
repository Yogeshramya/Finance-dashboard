import { Branch } from "@/types/branch";

export interface PopulatedEmployee {
    _id: string;
    name: string;
    branch?: string | Branch | null;
}

export interface PopulatedGroup {
    employee: {
        _id: string;
        name: string;
    }
    createdBy: {
        _id: string;
        name: string;
    }
    _id: string;
    groupName: string;
    branch?: string | Branch | null;
}

export interface Customer {
    _id: string;

    customerCode: string;
    name: string;
    phone: string;

    dob: string;
    age: string;
    gender: string;
    aadhar: string;
    joiningDate: string;

    doorStreet: string;
    area: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;

    memberPhoto?: string;
    memberAadhaarFront?: string;
    memberAadhaarBack?: string;
    documentFile?: string;
    occupation?: string;

    voterId?: string;
    rationCard?: string;

    employee: PopulatedEmployee | null;
    group: PopulatedGroup | null;
    createdAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";

    nominee?: {
        name: string;
        dob: string;
        age: string;
        gender: string;
        aadhar: string;
        phone: string;
        relation: string;
        occupation: string;

        photo?: string;
        aadhaarFront?: string;
        aadhaarBack?: string;
    };
}

export type LoanStatus =
    | "REPAID"
    | "NONE"
    | "APPROVED"
    | "PENDING"
    | "REJECTED";

export interface CustomerForLoan {
    _id: string;
    customerCode: string;
    name: string;
    phone: string;
    loanStatus: LoanStatus;
}

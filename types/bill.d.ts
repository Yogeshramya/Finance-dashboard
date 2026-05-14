import { Group } from "./group";

// Referenced types
export interface EmployeeRef {
    _id: string;
    name: string;
}

export interface GroupRef {
    _id: string;
    groupName: string;
}

export interface BranchRef {
    _id: string;
    name: string;
    code: string;
}

export interface BillLoan {
    mfloanId: ReactNode;
    savings: number;
    interest: number;
    principal: number;
    loanId: string;
    customerName: string;
    paidAmount: number;
}

export interface BillCollection {
    loanId: string;
    weekNo: number;
    payAmount: number;
    principal: number;
    interest: number;
    savings: number;
}

export interface Bill {
    paidAmount: ReactNode;
    _id: string;

    employee: Employee | string | null; // ObjectId
    group: Group | string | null;    // ObjectId
    branch: Branch | string | null;   // ObjectId

    weekNo: number;
    type: "Normal" | "PreClose" | "PreBill";

    loans: BillLoan[];

    totalMembers: number;
    totalCollected: number;
    collectedAt: string; // ISO date string
    collections?: BillCollection[];

    createdAt: string;
    updatedAt: string;
}

/* -------------------------------------------
   POPULATED BILL — for .populate()
-------------------------------------------- */

export interface PopulatedBill extends Omit<Bill, "employee" | "group" | "branch"> {
    employee: EmployeeRef | null;
    group: GroupRef | null;
    branch: BranchRef | null;
}

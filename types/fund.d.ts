import { Group } from "./group";

type Loan = {
    draftSavings: number;
    savingsRefunded: boolean;
    createdAt: string | number | Date;
    phone: string;
    savings: ReactNode;
    interest: ReactNode;
    _id: string;
    mfLoanId: string;
    loanDate: string;
    firstDueDate: string;
    maturedDate: string;
    loanAmount: number;
    principal: number;
    employee: { _id: string; name: string };
    scheme: { _id: string; schemeId: string; schemeName: string; loanType: string; totalAmount: number; rows: Array[] };
    customer: {
        nominee: {
            name: string;
            phone: string;
        };
        _id: string; customerCode: string; name: string; group: { _id: string; groupName: string }; phone: string
    };
    group: Group | null;
    loanType: string;
    loanPurpose: string;
    loanAmount: number;
    dues: Dues[];
    status: string;
    updatedAt: string;
    isPaying: boolean;
    payAmount: number;
    dueAmount: number;
    nextDueNo: number;
    collections: Collection[];
    isFullyPaid: boolean;
    savingsRequested: boolean;
    savingsReturned: boolean;
};

type Dues = {
    isPartial: boolean;
    paidAmount: number;
    savingsPaid: number;
    interestPaid: number;
    principalPaid: number;
    savingsRemaining: number;
    interestRemaining: number;
    principalRemaining: number;
    remainingAmount: number;
    count: number;
    weekNo: number;
    principal: number;
    interest: number;
    savings: number;
    total: number;
    paid: boolean;
    paidAt: string | null;
    present: boolean;
};

interface PendingLoanItem {
    arrear2Weeks: number;
    _id: Key | null | undefined;
    customerId: string;
    customerName: string;
    phone: string;
    weekNo: number;
    principal: number;
    interest: number;
    savings: number;
    pendingAmount: number;
    total: number;
    paid: boolean;
}

interface PendingDuesResponse {
    customer: Customer;
    loan: Loan;
    pendingDues: PendingDueItem[];
}

export interface FundReportLoan {
    _id: string;
    mfLoanId: string;
    customer: {
        _id: string;
        name: string;
        phone: string;
    } | null;

    phone: string;
    loanAmount: number;
    group: {
        _id: string;
        groupName: string;
    } | null;

    status: "APPROVED" | "PENDING" | "REJECTED";
}

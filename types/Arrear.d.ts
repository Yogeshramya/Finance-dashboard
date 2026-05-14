interface PartialPayment {
    amount: number;
    paidAt: string;
    collectedBy?: { name?: string };
}

interface ArrearRow {
    _id: string;

    mfLoanId: string;
    arrearFromWeek: number;
    arrearTillWeek: number;

    principal: number;
    interest: number;
    savings: number;

    totalAmount: number;
    remainingAmount: number;

    status: "OPEN" | "CLOSED";

    createdAt: string;

    group?: { groupName: string };
    loan?: { mfLoanId: string };

    partialPayments: PartialPayment[];
}

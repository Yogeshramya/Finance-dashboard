interface SchemeRow {
    weekNo: number;
    principal: string;
    interest: string;
    savings: string;
    total: number;
}

interface Scheme {
    createdAt: Date;
    _id: string;
    schemeId: string;
    schemeName: string;
    loanType: string;
    totalAmount: string;
    interest: string;
    applicationFees: string;
    insuranceFees: string;
    upfrontFees: string;
    dues: number;
    rows?: SchemeRow[];
}
export interface DaySheetItem {
    _id: string;       // description/category
    total: number;     // amount
}

export interface DaySheetReport {
    denomination: { note: number; count: number; total: number }[];
    from: string;                // date
    to: string;                  // date
    openingBalance: number;
    closingBalance: number;

    income: DaySheetItem[];
    expenses: DaySheetItem[];

    totalIncome: number;
    totalExpense: number;
    cashBoxStatus: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
}

export interface CashDenomination {
    [key: string]: number;
}
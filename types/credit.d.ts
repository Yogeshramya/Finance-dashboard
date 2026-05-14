export interface Credit {
    _id: string;

    date: string;          // stored as ISO string when sent from API
    title: string;
    details: string;
    amount: number;

    mode: "Cash" | "Bank";
    status?: "PENDING" | "APPROVED" | "REJECTED";

    branch: {
        _id: string;
        name?: string;     // optional when populated
    } | null;

    employee: {
        _id: string;
        name?: string;     // optional when populated
    } | null;

    createdAt: string;
    updatedAt: string;
}

export interface CreditInput {
    date: string;
    title: string;
    details: string;
    amount: number;
    mode: "Cash" | "Bank";
    branch?: string | null;
    employee?: string | null;
}

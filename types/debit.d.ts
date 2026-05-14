export interface Debit {
    _id: string;

    date: string;          // ISO string from MongoDB
    title: string;
    details: string;
    amount: number;

    mode: "Cash" | "Bank";
    status?: "PENDING" | "APPROVED" | "REJECTED";

    branch: {
        _id: string;
        name?: string;     // optional if populated
    } | null;

    employee: {
        _id: string;
        name?: string;     // optional if populated
    } | null;

    createdAt: string;
    updatedAt: string;
}

export interface DebitListResponse {
    success: boolean;
    debits: Debit[];
    page?: number;
    totalPages?: number;
}
export interface DemandItem {
    customerId: string;
    name: string;
    phone: string;
    principal: number;
    interest: number;
    savings: number;
    total: number;
}

export interface DemandReport {
    from: string;
    to: string;
    dues: DemandItem[];
    totals: {
        principal: number;
        interest: number;
        savings: number;
        total: number;
    };
}

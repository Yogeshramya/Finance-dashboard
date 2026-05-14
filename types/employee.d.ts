interface Employee {
    branches: mongoose.Types.ObjectId[] | { _id: string, name: string, code: string }[];
    _id: string;
    name: string;
    role: "MANAGER" | "EMPLOYEE_MFI" | "EMPLOYEE_GOLD" | "EMPLOYEE_CHIT" | "ADMINISTRATOR";
    branch: {
        _id: string;
        name: string;
        code: string;
    } | null;
    email: string;
}
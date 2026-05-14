import { DefaultSession, DefaultUser } from "next-auth";

type Role =
    | "ADMINISTRATOR"
    | "AREA_MANAGER"
    | "MANAGER"
    | "TELLER"
    | "EMPLOYEE_MFI";

interface Branch {
    _id: string;
    name: string;
    code: string;
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: Role;

            /* Single branch users */
            branch: Branch | null;

            /* Area manager multiple branches */
            branches?: Branch[];

            /* Currently selected branch */
            activeBranch?: Branch | null;

        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        _id: string;
        role: Role;

        branch: Branch | null;

        branches?: Branch[];

        activeBranch?: Branch | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role;

        branch: Branch | null;

        branches?: Branch[];

        activeBranch?: Branch | null;
    }
}
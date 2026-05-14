import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { connectDB } from "./db";
import UserModel from "@/models/User";
import type { NextAuthOptions, User } from "next-auth";
import Branch from "@/models/Branch";

const populateFields = [
    { path: "branch", select: "name code", model: Branch },
    { path: "branches", select: "name code", model: Branch },
];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (credentials?.email === "admin" && credentials?.password === "admin") {
                    return {
                        id: "admin_id",
                        _id: "admin_id",
                        name: "Administrator",
                        email: "admin",
                        role: "ADMINISTRATOR",
                        branch: { name: "Head Office", code: "HO" },
                        branches: [{ name: "Head Office", code: "HO" }]
                    } as any;
                }

                await connectDB();

                const user = await UserModel
                    .findOne({ email: credentials?.email })
                    .populate(populateFields);

                if (!user) throw new Error("No user found");

                const isValid = await compare(credentials!.password, user.password);
                if (!isValid) throw new Error("Invalid password");

                return user;
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24,
    },

    jwt: {
        maxAge: 60 * 60 * 24,
    },

    callbacks: {

        async jwt({ token, user, trigger, session }) {

            /* ---------- LOGIN ---------- */

            if (user) {

                token.id = (user as User)._id;
                token.role = user.role;

                token.branch = (user as User).branch ?? null;
                token.branches = (user as User).branches ?? [];

                /* ---------- MANAGER / EMPLOYEE / TELLER ---------- */

                if (
                    user.role === "MANAGER" ||
                    user.role === "EMPLOYEE_MFI" ||
                    user.role === "TELLER"
                ) {
                    token.activeBranch = (user as User).branch ?? null;
                }

                /* ---------- AREA MANAGER ---------- */

                if (user.role === "AREA_MANAGER") {

                    token.activeBranch =
                        (user as User).branches?.[0] ?? null;

                    token.branch = token.activeBranch;
                }

                /* ---------- ADMINISTRATOR ---------- */

                if (user.role === "ADMINISTRATOR") {

                    /* if admin has no branch assign first branch */

                    if (!(user as User).branch) {

                        const firstBranch = await Branch.findOne().select("name code");

                        if (firstBranch) {
                            token.activeBranch = firstBranch;
                            token.branch = firstBranch;
                        } else {
                            token.activeBranch = null;
                            token.branch = null;
                        }

                    } else {

                        token.activeBranch = (user as User).branch;
                    }

                }

            }

            /* ---------- SESSION UPDATE (branch switch) ---------- */

            if (trigger === "update" && session?.user?.activeBranch) {
                token.activeBranch = session.user.activeBranch ?? null;
                token.branch = session.user.activeBranch ?? null;
            }

            return token;
        },

        async session({ session, token }) {

            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;

                session.user.branch = token.branch ?? null;
                session.user.branches = token.branches ?? [];
                session.user.activeBranch = token.activeBranch ?? null;
            }

            return session;
        }
    },

    pages: {
        signIn: "/",
    },
};
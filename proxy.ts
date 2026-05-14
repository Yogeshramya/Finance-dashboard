import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {

    const pathname = req.nextUrl.pathname;

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    /* ================= NOT LOGGED ================= */

    if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const role = token.role;

    /* ================= ROUTE GROUPS ================= */

    const adminOnlyRoutes = [
        "/dashboard/branches",
        "/dashboard/employees",
    ];

    const managerRestrictedRoutes = [
        "/dashboard/approval",
        "/dashboard/branches",
        "/dashboard/employees",

        "/dashboard/group/manage",
        "/dashboard/group/add",
        "/dashboard/group/close",

        "/dashboard/scheme/new",

        "/dashboard/credit/manage",
        "/dashboard/credit/title",

        "/dashboard/debit/manage",
        "/dashboard/debit/title",

        "/dashboard/bill/partial",
        "/dashboard/bill/prebill",
    ];

    const staffRestrictedRoutes = [
        "/dashboard/approval",
        "/dashboard/branches",
        "/dashboard/employees",

        "/dashboard/group/manage",
        "/dashboard/group/add",
        "/dashboard/group/close",

        "/dashboard/client/edit",

        "/dashboard/fund/manage",
        "/dashboard/fund/provide",
        "/dashboard/fund/return",

        "/dashboard/scheme/new",

        "/dashboard/credit/manage",
        "/dashboard/credit/entry",
        "/dashboard/credit/report",
        "/dashboard/credit/title",

        "/dashboard/debit/manage",
        "/dashboard/debit/entry",
        "/dashboard/debit/report",
        "/dashboard/debit/title",

        "/dashboard/bill/partial",
        "/dashboard/bill/prebill",

        "/dashboard/report/day-sheet",
        "/dashboard/report/summary-report",
    ];

    const isClientEditRoute =
        pathname.startsWith("/dashboard/client/") &&
        pathname.endsWith("/edit");

    /* ================= ADMIN ================= */

    if (role === "ADMINISTRATOR") {
        return NextResponse.next();
    }

    /* ================= AREA MANAGER + MANAGER ================= */

    if (role === "AREA_MANAGER" || role === "MANAGER" || role === "TELLER") {

        if (
            adminOnlyRoutes.some(route => pathname.startsWith(route)) ||
            managerRestrictedRoutes.some(route => pathname.startsWith(route))
        ) {
            return NextResponse.redirect(
                new URL("/unauthorized", req.url)
            );
        }

        return NextResponse.next();
    }

    /* ================= STAFF ================= */

    if (role === "EMPLOYEE_MFI") {

        const blockedForStaff =
            staffRestrictedRoutes.some(route => pathname.startsWith(route)) ||
            isClientEditRoute;

        if (blockedForStaff) {
            return NextResponse.redirect(
                new URL("/unauthorized", req.url)
            );
        }

        return NextResponse.next();
    }

    /* ================= DEFAULT BLOCK ================= */

    return NextResponse.redirect(
        new URL("/unauthorized", req.url)
    );
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
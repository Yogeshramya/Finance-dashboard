"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

export default function Sidebar({
    setIsOpen,
}: {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();

    const role = session?.user?.role;

    const VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "FinoraX v1.0 (Demo)";

    /* ---------------- MENU SECTIONS ---------------- */

    const sections = [
        {
            title: "Financial Operations",
            tabs: [
                { name: "Dashboard", path: "/dashboard" },
                ...(role === "ADMINISTRATOR" || role === "MANAGER" || role === "AREA_MANAGER" || role === "TELLER" ? [
                    { name: "Credit", path: "/dashboard/credit" },
                    { name: "Debit", path: "/dashboard/debit" },
                ] : []),
                { name: "Fund", path: "/dashboard/fund" },
                { name: "Bills", path: "/dashboard/bill" },
            ]
        },
        {
            title: "Customer Operations",
            tabs: [
                { name: "Clients", path: "/dashboard/client" },
                { name: "Groups", path: "/dashboard/group" },
                { name: "Centers", path: "/dashboard/centers" },
                { name: "Schemes", path: "/dashboard/scheme" },
            ]
        },
        {
            title: "Administration",
            tabs: role === "ADMINISTRATOR" ? [
                { name: "Branches", path: "/dashboard/branches" },
                { name: "Employees", path: "/dashboard/employees" },
                { name: "Approvals", path: "/dashboard/approval" },
            ] : []
        },
        {
            title: "Analytics",
            tabs: [
                { name: "Reports", path: "/dashboard/report" },
            ]
        }
    ];

    const handleNavigate = (path: string) => {
        router.push(path);
        if (setIsOpen) setIsOpen(false);
    };

    return (
        <aside className="h-full w-full bg-white border-r border-gray-200 flex flex-col print:hidden">

            {/* Top Section */}
            <div className="p-5 overflow-y-auto flex-1">

                {/* Mobile Close */}
                <div className="flex items-center justify-between mb-4 md:hidden">
                    <h2 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">
                        Menu
                    </h2>
                    <button
                        onClick={() => setIsOpen?.(false)}
                        className="p-1.5 rounded-md hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-6">
                    {sections.map((section) => (
                        section.tabs.length > 0 && (
                            <div key={section.title}>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.tabs.map((tab) => {
                                        const active =
                                            pathname === tab.path ||
                                            (pathname.startsWith(tab.path + "/") &&
                                                tab.path !== "/dashboard");

                                        return (
                                            <button
                                                key={tab.path}
                                                onClick={() => handleNavigate(tab.path)}
                                                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                                    ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md"
                                                    : "hover:bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {tab.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </nav>
            </div>

            {/* Bottom Version Section */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="w-full flex items-center justify-center px-4 py-2 rounded-xl text-xs font-medium text-gray-600 bg-white">
                    <span>{VERSION}</span>
                </div>
            </div>

        </aside>
    );
}
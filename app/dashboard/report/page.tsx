"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CalendarCheck,
    ShieldCheck,
    TimerIcon,
    FileText
} from "lucide-react";

export default function ReportsPage() {
    const router = useRouter();

    const reports = [
        {
            title: "Day Sheet",
            description: "Daily collection & closing cash records.",
            icon: <CalendarCheck className="w-6 h-6 text-green-600" />,
            route: "/dashboard/report/day-sheet",
            color: "from-green-600 to-emerald-600"
        },
        {
            title: "Closed Accounts",
            description: "List of fully paid/pre-closed loan accounts.",
            icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
            route: "/dashboard/report/closed-accounts",
            color: "from-red-600 to-rose-600"
        },
        /*{
            title: "Cash In Hand",
            description: "View remaining cash available in branch.",
            icon: <Wallet className="w-6 h-6 text-purple-600" />,
            route: "/dashboard/report/cash-in-hand",
            color: "from-purple-600 to-violet-600"
        },*/
        {
            title: "Pendings Report",
            description: "List of pending loan accounts.",
            icon: <TimerIcon className="w-6 h-6 text-red-600" />,
            route: "/dashboard/report/pending-fund",
            color: "from-red-600 to-rose-600"
        },
        /*{
            title: "Disposal Report",
            description: "List of Disposal clients.",
            icon: <FileText className="w-6 h-6 text-red-600" />,
            route: "/dashboard/report/disposal",
            color: "from-purple-600 to-purple-600"
        },*/
        {
            title: "Group Closed Report",
            description: "Closed group report.",
            icon: <FileText className="w-6 h-6 text-blue-600" />,
            route: "/dashboard/report/closed-report",
            color: "from-green-600 to-green-600"
        },
        {
            title: "Bill Report",
            description: "Date, group & employee wise bill collection report.",
            icon: <FileText className="w-6 h-6 text-blue-600" />,
            route: "/dashboard/report/bill-report",
            color: "from-purple-600 to-purple-600"
        },
        {
            title: "Day Sheets Report",
            description: "Collection & closing cash records.",
            icon: <CalendarCheck className="w-6 h-6 text-green-600" />,
            route: "/dashboard/report/summary-report",
            color: "from-green-600 to-emerald-600"
        },
        {
            title: "Preclose Report",
            description: "Pre-closed loan report ",
            icon: <ShieldCheck className="w-6 h-6 text-red-60" />,
            route: "/dashboard/report/preclose",
            color: "from-red-600 to-rose-700",
        },
        {
            title: "Outstanding Report",
            description: "Outstanding loan report",
            icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
            route: "/dashboard/report/outstanding",
            color: "from-rose-500 to-red-600",
        },
        {
            title: "Savings Refund Report",
            description: "Savings refund report",
            icon: <ShieldCheck className="w-6 h-6 text-red-60" />,
            route: "/dashboard/report/savings",
            color: "from-orange-500 to-amber-600",
        },
        {
            title: "Arrear Report",
            description: "Arrear report",
            icon: <ShieldCheck className="w-6 h-6 text-red-60" />,
            route: "/dashboard/report/arrear",
            color: "from-purple-600 to-purple-600"
        },
        /*{
            title: "Weekly Report",
            description: "Weekly report",
            icon: <ShieldCheck className="w-6 h-6 text-red-60" />,
            route: "/dashboard/report/weekly-demand-sheet",
            color: "from-red-600 to-rose-80",
        }*/
        /*{
            title: "Cashbox Report",
            description: "Last Cashbox details.",
            icon: <FileText className="w-6 h-6 text-red-600" />,
            route: "/dashboard/report/cashbox",
            color: "from-purple-600 to-purple-600"
        },*/
    ];

    return (
        <section className="space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((item, idx) => (
                    <Card
                        key={idx}
                        className="p-6 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border border-gray-200 bg-white rounded-xl"
                        onClick={() => router.push(item.route)}
                    >
                        <CardContent className="flex flex-col space-y-4 p-0">
                            <div className="p-3 bg-gray-100 rounded-full w-fit">
                                {item.icon}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <Button
                                className={`mt-3 text-white bg-gradient-to-r ${item.color} w-full hover:opacity-90`}
                            >
                                Open
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

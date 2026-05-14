"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, PenBox, User, Wallet } from "lucide-react";

export default function Approval() {
    const router = useRouter();

    const actions = [
        {
            title: "Loan Approval",
            description: "Review and approve pending loan applications.",
            icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            action: () => router.push("/dashboard/approval/fund"),
        },
        {
            title: "Bill Approval",
            description: "Review and approve pending bills.",
            icon: <CheckCircle className="w-6 h-6 text-orange-600" />,
            action: () => router.push("/dashboard/approval/bill"),
        },
        {
            title: "Credit Approval",
            description: "Approve or manage client credit applications.",
            icon: <CreditCard className="w-6 h-6 text-blue-600" />,
            action: () => router.push("/dashboard/approval/credit"),
        },
        {
            title: "Debit Approval",
            description: "Approve debit-related client requests.",
            icon: <Wallet className="w-6 h-6 text-purple-600" />,
            action: () => router.push("/dashboard/approval/debit"),
        },
        {
            title: "Savings Approval",
            description: "Approve or manage savings debit applications.",
            icon: <CreditCard className="w-6 h-6 text-blue-600" />,
            action: () => router.push("/dashboard/approval/savings"),
        },
        {
            title: "Client Approval",
            description: "Approve client requests.",
            icon: <User className="w-6 h-6 text-purple-600" />,
            action: () => router.push("/dashboard/approval/client"),
        },
        {
            title: "Preclose Approval",
            description: "Review and approve pre-close loan applications.",
            icon: <PenBox className="w-6 h-6 text-yellow-500" />,
            action: () => router.push("/dashboard/approval/preclose"),
        },
        {
            title: "DaySheet Approval",
            description: "Review and approve daysheet applications.",
            icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            action: () => router.push("/dashboard/approval/day-sheet"),
        },
    ];

    return (
        <section className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Approvals</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((item, i) => (
                    <Card
                        key={i}
                        className="p-6 cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all border border-gray-200 bg-white rounded-xl"
                        onClick={item.action}
                    >
                        <CardContent className="flex flex-col items-start space-y-4">
                            <div className="p-3 bg-gray-100 rounded-full">
                                {item.icon}
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {item.title}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {item.description}
                                </p>
                            </div>

                            <Button className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90">
                                Open
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

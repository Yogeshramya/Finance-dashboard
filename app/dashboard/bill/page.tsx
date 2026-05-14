"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FilePlus2,
    FileText,
    Layers,
} from "lucide-react";

export default function Bill() {
    const router = useRouter();

    const actions = [
        {
            title: "Bill Entry",
            description: "Create a new bill.",
            icon: <FilePlus2 className="w-6 h-6 text-blue-500" />,
            action: () => router.push("/dashboard/bill/entry"),
        },
        {
            title: "Weekly Demand Sheet",
            description: "Generate bill for entire group.",
            icon: <Layers className="w-6 h-6 text-green-500" />,
            action: () => router.push("/dashboard/bill/weekly-demand"),
        },
        {
            title: "Pre-Bill",
            description: "Manage pre-billing entries.",
            icon: <FileText className="w-6 h-6 text-purple-500" />,
            action: () => router.push("/dashboard/bill/prebill"),
        },
        {
            title: "Demand Sheet",
            description: "View generated demand sheet.",
            icon: <FileText className="w-6 h-6 text-purple-500" />,
            action: () => router.push("/dashboard/bill/demand-sheet"),
        },
        {
            title: "Partial Bill",
            description: "Manage partial bill entries.",
            icon: <FileText className="w-6 h-6 text-yellow-500" />,
            action: () => router.push("/dashboard/bill/partial"),
        },
    ];

    return (
        <section className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Bill Management</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((item, i) => (
                    <Card
                        key={i}
                        className="p-6 cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all border border-gray-200 bg-white rounded-xl"
                        onClick={item.action}
                    >
                        <CardContent className="flex flex-col items-start space-y-4">
                            <div className="p-3 bg-gray-100 rounded-full">{item.icon}</div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <Button className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90">
                                Open
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, FileSpreadsheet } from "lucide-react";

export default function Credit() {
    const router = useRouter();

    const actions = [
        {
            title: "Credit Entry",
            description: "Add credit entry for a client.",
            icon: <PlusCircle className="w-6 h-6 text-green-600" />,
            action: () => router.push("/dashboard/credit/entry"),
        },
        {
            title: "Modify/Remove Credit",
            description: "Edit or delete credit records.",
            icon: <Edit className="w-6 h-6 text-yellow-600" />,
            action: () => router.push("/dashboard/credit/manage"),
        },
        {
            title: "Credit Report",
            description: "Check overall credit details.",
            icon: <FileSpreadsheet className="w-6 h-6 text-blue-600" />,
            action: () => router.push("/dashboard/credit/report"),
        },
        {
            title: "Credit Title",
            description: "Manage credit titles.",
            icon: <Edit className="w-6 h-6 text-purple-600" />,
            action: () => router.push("/dashboard/credit/title"),
        }
    ];

    return (
        <section className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Credit Management</h1>

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
                            <Button className="mt-2 bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90">
                                Open
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

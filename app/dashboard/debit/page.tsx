"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, FileSpreadsheet } from "lucide-react";

export default function Debit() {
    const router = useRouter();

    const actions = [
        {
            title: "Debit Entry",
            description: "Add debit details for a client.",
            icon: <PlusCircle className="w-6 h-6 text-red-600" />,
            action: () => router.push("/dashboard/debit/entry"),
        },
        {
            title: "Modify/Remove Debit",
            description: "Edit or remove debit info.",
            icon: <Edit className="w-6 h-6 text-orange-600" />,
            action: () => router.push("/dashboard/debit/manage"),
        },
        {
            title: "Debit Report",
            description: "Check debit records and summaries.",
            icon: <FileSpreadsheet className="w-6 h-6 text-purple-600" />,
            action: () => router.push("/dashboard/debit/report"),
        },
        {
            title: "Debit Title",
            description: "Manage debit titles.",
            icon: <Edit className="w-6 h-6 text-pink-600" />,
            action: () => router.push("/dashboard/debit/title"),
        }
    ];

    return (
        <section className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Debit Management</h1>

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
                            <Button className="mt-2 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90">
                                Open
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

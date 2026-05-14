"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search } from "lucide-react";

export default function Center() {
    const router = useRouter();

    const actions = [
        {
            title: "Add Center",
            description: "Create a new center record in the system.",
            icon: <PlusCircle className="w-6 h-6 text-blue-500" />,
            action: () => router.push("/dashboard/centers/add"),
        },
        {
            title: "Edit Center",
            description: "Modify details of an existing center.",
            icon: <Edit3 className="w-6 h-6 text-green-500" />,
            action: () => router.push("/dashboard/centers/edit"),
        },
        {
            title: "Delete Center",
            description: "Remove a center from your records.",
            icon: <Trash2 className="w-6 h-6 text-red-500" />,
            action: () => router.push("/dashboard/centers/delete"),
        },
        {
            title: "Search Center",
            description: "Find a center quickly by name or ID.",
            icon: <Search className="w-6 h-6 text-purple-500" />,
            action: () => router.push("/dashboard/centers/search"),
        },
    ];

    return (
        <section className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Center Management</h1>

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

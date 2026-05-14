"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
    UserPlus,
    Search,
    Edit,
    FileText
} from "lucide-react";

export default function Client() {
    const router = useRouter();

    const actions = [
        {
            title: "Add New Client",
            description: "Create a new client entry.",
            icon: <UserPlus className="w-6 h-6 text-blue-500" />,
            action: () => router.push("/dashboard/client/new"),
        },
        {
            title: "Search Client (Group Wise)",
            description: "Search clients based on group.",
            icon: <Search className="w-6 h-6 text-pink-500" />,
            action: () => router.push("/dashboard/client/search-group"),
        },
        {
            title: "Modify / Remove Client",
            description: "Edit or delete a client's record.",
            icon: <Edit className="w-6 h-6 text-green-500" />,
            action: () => router.push("/dashboard/client/edit"),
        },
        {
            title: "New Client Report",
            description: "Generate a report of newly added clients.",
            icon: <FileText className="w-6 h-6 text-orange-500" />,
            action: () => router.push("/dashboard/client/report"),
        },
    ];

    return (
        <section className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Client Management</h1>

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
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {item.title}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {item.description}
                                </p>
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

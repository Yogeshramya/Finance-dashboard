"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Search, BarChart3 } from "lucide-react";

export default function Group() {
    const router = useRouter();

    const actions = [
        {
            title: "Add Group",
            description: "Create a new group in the system.",
            icon: <PlusCircle className="w-6 h-6 text-blue-500" />,
            action: () => router.push("/dashboard/group/add"),
        },
        {
            title: "Modify / Remove Group",
            description: "Edit or delete existing group details.",
            icon: <Edit3 className="w-6 h-6 text-green-500" />,
            action: () => router.push("/dashboard/group/manage"),
        },
        {
            title: "Search Group",
            description: "Find a group by name, ID, or center.",
            icon: <Search className="w-6 h-6 text-purple-500" />,
            action: () => router.push("/dashboard/group/search"),
        },
        {
            title: "Group close",
            description: "Close the group.",
            icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
            action: () => router.push("/dashboard/group/close"),
        },
    ];

    return (
        <section className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Group Management</h1>

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

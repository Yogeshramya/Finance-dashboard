"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FilePlus2,
    FileText,
    Layers,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    Clock
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Bill() {
    const router = useRouter();

    const actions = [
        {
            title: "Bill Entry",
            description: "Generate a new individual collection bill.",
            icon: <FilePlus2 className="w-6 h-6 text-blue-600" />,
            bgColor: "bg-blue-50",
            action: () => router.push("/dashboard/bill/entry"),
        },
        {
            title: "Weekly Demand Sheet",
            description: "Process group-wide weekly collection demands.",
            icon: <Layers className="w-6 h-6 text-emerald-600" />,
            bgColor: "bg-emerald-50",
            action: () => router.push("/dashboard/bill/weekly-demand"),
        },
        {
            title: "Pre-Bill",
            description: "Review and approve billing entries before finalizing.",
            icon: <FileText className="w-6 h-6 text-indigo-600" />,
            bgColor: "bg-indigo-50",
            action: () => router.push("/dashboard/bill/prebill"),
        },
        {
            title: "Demand Sheet",
            description: "Access and print the comprehensive group demand sheet.",
            icon: <FileText className="w-6 h-6 text-purple-600" />,
            bgColor: "bg-purple-50",
            action: () => router.push("/dashboard/bill/demand-sheet"),
        },
        {
            title: "Partial Bill",
            description: "Record and manage split or partial loan payments.",
            icon: <FileText className="w-6 h-6 text-amber-600" />,
            bgColor: "bg-amber-50",
            action: () => router.push("/dashboard/bill/partial"),
        },
    ];

    return (
        <section className="space-y-10 max-w-7xl mx-auto p-6">
            <PageHeader />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Billing & Collections
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Manage loan collection schedules, demand sheets, and billing entries.
                    </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-emerald-700">Billing Cycle Active</span>
                </div>
            </div>

            {/* Billing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Collected</p>
                            <h4 className="text-xl font-bold">₹4.2L</h4>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending</p>
                            <h4 className="text-xl font-bold">₹1.8L</h4>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Efficiency</p>
                            <h4 className="text-xl font-bold">94.2%</h4>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-blue-600 rounded-3xl overflow-hidden text-white">
                    <CardContent className="p-6 flex flex-col justify-center h-full">
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Next Due</p>
                        <h4 className="text-xl font-bold">In 2 Days</h4>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {actions.map((item, i) => (
                    <Card
                        key={i}
                        className="
                            group p-8 cursor-pointer transition-all duration-300 
                            border-none shadow-md hover:shadow-2xl hover:-translate-y-1 
                            bg-white rounded-[2.5rem] relative overflow-hidden
                        "
                        onClick={item.action}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${item.bgColor} opacity-30 rounded-bl-[4rem] -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
                        
                        <CardContent className="p-0 flex flex-col items-start space-y-6 relative">
                            <div className={`p-4 ${item.bgColor} rounded-2xl`}>
                                {item.icon}
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h2>
                                <p className="text-gray-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <div className="pt-4 w-full flex items-center justify-between border-t border-gray-50">
                                <span className="text-sm font-bold text-gray-300 group-hover:text-blue-600 transition-colors">Launch Tool</span>
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

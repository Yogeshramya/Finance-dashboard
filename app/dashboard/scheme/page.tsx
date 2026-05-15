"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    FileText,
    EyeIcon,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Coins
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Scheme() {
    const router = useRouter();

    const actions = [
        {
            title: "New Scheme",
            description: "Create a fresh scheme entry with custom interest and dues.",
            icon: <PlusCircle className="w-6 h-6 text-blue-600" />,
            bgColor: "bg-blue-50",
            borderColor: "hover:border-blue-400",
            action: () => router.push("/dashboard/scheme/new"),
        },
        {
            title: "Manage/View Scheme",
            description: "Modify or view existing scheme configurations and rates.",
            icon: <EyeIcon className="w-6 h-6 text-amber-600" />,
            bgColor: "bg-amber-50",
            borderColor: "hover:border-amber-400",
            action: () => router.push("/dashboard/scheme/manage"),
        },
        {
            title: "GRT Form",
            description: "Generate or view Group Recognition Test (GRT) forms.",
            icon: <FileText className="w-6 h-6 text-purple-600" />,
            bgColor: "bg-purple-50",
            borderColor: "hover:border-purple-400",
            action: () => router.push("/dashboard/scheme/grt"),
        },
    ];

    return (
        <section className="space-y-10 max-w-6xl mx-auto p-6">
            <PageHeader />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Scheme Management
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Configure loan products, interest rates, and collection schedules.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                                <Sparkles className="w-3 h-3" />
                            </div>
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-600 pr-2">System Optimized</span>
                </div>
            </div>

            {/* Quick Stats/Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200">
                    <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
                        <Coins className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider">Active Products</h3>
                    <p className="text-3xl font-bold mt-1">12 Schemes</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit mb-4">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Avg. Interest</h3>
                    <p className="text-3xl font-bold mt-1 text-gray-900">14.5%</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Forms Generated</h3>
                    <p className="text-3xl font-bold mt-1 text-gray-900">1.2k</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {actions.map((item, i) => (
                    <Card
                        key={i}
                        className={`
                            group relative p-8 cursor-pointer overflow-hidden
                            transition-all duration-300 border-none shadow-md
                            hover:shadow-2xl hover:-translate-y-2 bg-white rounded-[2rem]
                        `}
                        onClick={item.action}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${item.bgColor} opacity-20 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110`} />
                        
                        <CardContent className="relative flex flex-col items-start space-y-6 p-0">
                            <div className={`p-4 ${item.bgColor} rounded-2xl shadow-inner`}>
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
                                <span className="text-sm font-bold text-gray-400 group-hover:text-blue-600 transition-colors">View Details</span>
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Tip */}
            <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-xl font-bold">Need a custom scheme template?</h4>
                    <p className="text-gray-400">Our system supports dynamic formula calculation for any loan type.</p>
                </div>
                <Button className="bg-white text-gray-900 hover:bg-blue-50 px-8 py-6 rounded-2xl font-bold transition-all shadow-lg">
                    Contact Support
                </Button>
            </div>
        </section>
    );
}

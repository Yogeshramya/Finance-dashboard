"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    CheckCircle, 
    CreditCard, 
    PenBox, 
    User, 
    Wallet, 
    ShieldAlert, 
    ArrowRight, 
    Zap,
    Clock,
    FileText,
    Badge
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Approval() {
    const router = useRouter();

    const actions = [
        {
            title: "Loan Approval",
            description: "Finalize and disburse pending loan applications.",
            icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
            bgColor: "bg-emerald-50",
            action: () => router.push("/dashboard/approval/fund"),
        },
        {
            title: "Bill Approval",
            description: "Verify daily collection logs and member payments.",
            icon: <FileText className="w-6 h-6 text-orange-600" />,
            bgColor: "bg-orange-50",
            action: () => router.push("/dashboard/approval/bill"),
        },
        {
            title: "Credit Approval",
            description: "Analyze and approve client credit limit increases.",
            icon: <CreditCard className="w-6 h-6 text-blue-600" />,
            bgColor: "bg-blue-50",
            action: () => router.push("/dashboard/approval/credit"),
        },
        {
            title: "Debit Approval",
            description: "Review withdrawal and debit-related client requests.",
            icon: <Wallet className="w-6 h-6 text-purple-600" />,
            bgColor: "bg-purple-50",
            action: () => router.push("/dashboard/approval/debit"),
        },
        {
            title: "Savings Approval",
            description: "Manage and authorize savings-linked transactions.",
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            bgColor: "bg-blue-50/50",
            action: () => router.push("/dashboard/approval/savings"),
        },
        {
            title: "Client Approval",
            description: "Onboard and verify new client documentation.",
            icon: <User className="w-6 h-6 text-indigo-600" />,
            bgColor: "bg-indigo-50",
            action: () => router.push("/dashboard/approval/client"),
        },
        {
            title: "Preclose Approval",
            description: "Approve early loan closures and settlement discounts.",
            icon: <PenBox className="w-6 h-6 text-amber-500" />,
            bgColor: "bg-amber-50",
            action: () => router.push("/dashboard/approval/preclose"),
        },
        {
            title: "DaySheet Approval",
            description: "Validate the branch final daily balance sheet.",
            icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            bgColor: "bg-green-50",
            action: () => router.push("/dashboard/approval/day-sheet"),
        },
    ];

    return (
        <section className="space-y-12 max-w-7xl mx-auto p-6">
            <PageHeader />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                        <div className="p-3 bg-red-600 text-white rounded-3xl shadow-xl shadow-red-200">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        Approval Hub
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Central control for all pending administrative authorizations.</p>
                </div>
                
                <div className="flex gap-4">
                    <Card className="bg-white border-none shadow-sm px-6 py-4 rounded-3xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</p>
                            <h4 className="text-lg font-bold">24 Items</h4>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {actions.map((item, i) => (
                    <Card
                        key={i}
                        className="
                            group relative p-8 cursor-pointer overflow-hidden
                            transition-all duration-500 border-none shadow-sm
                            hover:shadow-2xl hover:-translate-y-2 bg-white rounded-[2.5rem]
                        "
                        onClick={item.action}
                    >
                        {/* Decorative background element */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${item.bgColor} opacity-40 rounded-bl-[4rem] -mr-12 -mt-12 transition-all group-hover:scale-125 group-hover:-rotate-12`} />
                        
                        <CardContent className="relative flex flex-col items-start space-y-6 p-0 h-full">
                            <div className={`p-4 ${item.bgColor} rounded-2xl shadow-inner`}>
                                {item.icon}
                            </div>

                            <div className="flex-1 space-y-2">
                                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                    {item.title}
                                </h2>
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                    {item.description}
                                </p>
                            </div>

                            <div className="w-full pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-300 group-hover:text-blue-600 transition-colors uppercase tracking-widest">Authorize</span>
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Manager Info Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-blue-900 rounded-[3rem] p-10 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl text-center md:text-left">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 font-bold tracking-widest">ADMINISTRATOR NOTICE</Badge>
                        <h3 className="text-3xl font-black">Secure Verification Required</h3>
                        <p className="text-blue-100/70 text-lg">All approvals are digitally signed and recorded in the audit logs. Ensure you have reviewed all member KYC documents before finalizing fund disbursements.</p>
                    </div>
                    <Button className="h-16 px-10 rounded-[1.5rem] bg-white text-gray-900 hover:bg-blue-50 font-black text-lg shadow-lg group">
                        Review Audit Logs
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Save, X, Users, Calendar, Clock, UserCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Employee {
    _id: string;
    name: string;
}

export default function AddCenterPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [formData, setFormData] = useState({
        groupId: "",
        groupName: "",
        totalMembers: "0",
        dueOn: "MONTHLY",
        collectionDay: "Monday",
        collectionTime: "",
        employee: "",
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch("/api/employees/list");
                const data = await res.json();
                if (res.ok) {
                    setEmployees(data.employees || []);
                }
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!session?.user?.id) {
            return toast.error("User session not found");
        }

        if (!formData.employee) {
            return toast.error("Please select a collection employee");
        }

        setLoading(true);
        try {
            const res = await fetch("/api/group", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    createdBy: session.user.id,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Center created successfully");
                router.push("/dashboard/centers");
            } else {
                toast.error(data.error || "Failed to create center");
            }
        } catch (error) {
            console.error("Create error:", error);
            toast.error("An error occurred during creation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-4xl mx-auto space-y-8 p-6">
            <PageHeader />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Center</h1>
                    <p className="text-gray-500 mt-1">Register a new collection center and assign staff.</p>
                </div>
                <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Center Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Group ID */}
                            <div className="space-y-2">
                                <Label htmlFor="groupId" className="text-sm font-semibold">Center ID / Code</Label>
                                <div className="relative">
                                    <Input
                                        id="groupId"
                                        placeholder="e.g. CN-001"
                                        value={formData.groupId}
                                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                        className="h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Group Name */}
                            <div className="space-y-2">
                                <Label htmlFor="groupName" className="text-sm font-semibold">Center Name</Label>
                                <Input
                                    id="groupName"
                                    placeholder="e.g. North Branch Center"
                                    value={formData.groupName}
                                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                    className="h-11 rounded-xl"
                                    required
                                />
                            </div>

                            {/* Total Members */}
                            <div className="space-y-2">
                                <Label htmlFor="totalMembers" className="text-sm font-semibold flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    Estimated Members
                                </Label>
                                <Input
                                    id="totalMembers"
                                    type="number"
                                    value={formData.totalMembers}
                                    onChange={(e) => setFormData({ ...formData, totalMembers: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            {/* Due On */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Collection Frequency
                                </Label>
                                <Select 
                                    value={formData.dueOn} 
                                    onValueChange={(val) => setFormData({ ...formData, dueOn: val })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Select Frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Collection Day */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Collection Day
                                </Label>
                                <Select 
                                    value={formData.collectionDay} 
                                    onValueChange={(val) => setFormData({ ...formData, collectionDay: val })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Select Day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Collection Time */}
                            <div className="space-y-2">
                                <Label htmlFor="collectionTime" className="text-sm font-semibold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    Collection Time
                                </Label>
                                <Input
                                    id="collectionTime"
                                    placeholder="e.g. 10:30 AM"
                                    value={formData.collectionTime}
                                    onChange={(e) => setFormData({ ...formData, collectionTime: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            {/* Collector / Employee */}
                            <div className="space-y-2 col-span-full">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                    Assigned Collector
                                </Label>
                                <Select 
                                    value={formData.employee} 
                                    onValueChange={(val) => setFormData({ ...formData, employee: val })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-blue-100 bg-blue-50/30">
                                        <SelectValue placeholder="Select an Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(emp => (
                                            <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="h-12 px-8 rounded-xl"
                    >
                        Discard
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    >
                        {loading ? "Creating..." : (
                            <span className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Center
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    );
}

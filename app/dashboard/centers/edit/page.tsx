"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
    Search, 
    Edit3, 
    Save, 
    X, 
    Building2, 
    Users, 
    Calendar, 
    Clock, 
    UserCheck,
    ArrowLeft
} from "lucide-react";
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

interface Center {
    _id: string;
    groupId: string;
    groupName: string;
    totalMembers: number;
    dueOn: string;
    collectionDay: string;
    collectionTime: string;
    employee: any;
}

export default function EditCenterPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Center[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch("/api/employees/list");
                const data = await res.json();
                if (res.ok) setEmployees(data.employees || []);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return toast.warning("Enter a search term");

        setLoading(true);
        try {
            const res = await fetch(`/api/group/search?query=${query}`);
            const data = await res.json();
            if (res.ok) {
                setResults(data);
                if (data.length === 0) toast.info("No centers found");
            } else {
                toast.error("Search failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCenter = (center: Center) => {
        // Flatten the employee object to ID for the select component
        const empId = typeof center.employee === 'object' ? center.employee._id : center.employee;
        setSelectedCenter({ ...center, employee: empId });
        setResults([]);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCenter) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/group/${selectedCenter._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedCenter),
            });

            if (res.ok) {
                toast.success("Center updated successfully");
                setSelectedCenter(null);
                setQuery("");
            } else {
                toast.error("Update failed");
            }
        } catch (error) {
            toast.error("An error occurred during update");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="max-w-4xl mx-auto space-y-8 p-6">
            <PageHeader />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Center</h1>
                    <p className="text-gray-500 mt-1">Modify configuration and staff assignments for existing centers.</p>
                </div>
                {selectedCenter && (
                    <Button variant="ghost" onClick={() => setSelectedCenter(null)} className="rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Search
                    </Button>
                )}
            </div>

            {!selectedCenter ? (
                <div className="space-y-6">
                    {/* Search Section */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search Center ID or Name to edit..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10 h-11 rounded-xl shadow-sm"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="h-11 px-8 rounded-xl bg-gray-900">
                            {loading ? "Searching..." : "Find Center"}
                        </Button>
                    </form>

                    {/* Results List */}
                    <div className="grid grid-cols-1 gap-4">
                        {results.map((center) => (
                            <Card key={center._id} className="hover:border-blue-300 transition-colors cursor-pointer" onClick={() => handleSelectCenter(center)}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{center.groupName}</h3>
                                            <p className="text-sm text-gray-500">{center.groupId} • {center.totalMembers} Members</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-lg">
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                /* Edit Form Section */
                <form onSubmit={handleUpdate} className="space-y-6">
                    <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-green-600" />
                                Update Center: {selectedCenter.groupName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Center ID (Read-only)</Label>
                                    <Input disabled value={selectedCenter.groupId} className="h-11 rounded-xl bg-gray-100" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="groupName" className="text-sm font-semibold">Center Name</Label>
                                    <Input
                                        id="groupName"
                                        value={selectedCenter.groupName}
                                        onChange={(e) => setSelectedCenter({ ...selectedCenter, groupName: e.target.value })}
                                        className="h-11 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="totalMembers" className="text-sm font-semibold flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        Total Members
                                    </Label>
                                    <Input
                                        id="totalMembers"
                                        type="number"
                                        value={selectedCenter.totalMembers}
                                        onChange={(e) => setSelectedCenter({ ...selectedCenter, totalMembers: Number(e.target.value) })}
                                        className="h-11 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Collection Frequency
                                    </Label>
                                    <Select 
                                        value={selectedCenter.dueOn} 
                                        onValueChange={(val) => setSelectedCenter({ ...selectedCenter, dueOn: val })}
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

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Collection Day
                                    </Label>
                                    <Select 
                                        value={selectedCenter.collectionDay} 
                                        onValueChange={(val) => setSelectedCenter({ ...selectedCenter, collectionDay: val })}
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

                                <div className="space-y-2">
                                    <Label htmlFor="collectionTime" className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        Collection Time
                                    </Label>
                                    <Input
                                        id="collectionTime"
                                        value={selectedCenter.collectionTime}
                                        onChange={(e) => setSelectedCenter({ ...selectedCenter, collectionTime: e.target.value })}
                                        className="h-11 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2 col-span-full">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-gray-400" />
                                        Assigned Collector
                                    </Label>
                                    <Select 
                                        value={selectedCenter.employee} 
                                        onValueChange={(val) => setSelectedCenter({ ...selectedCenter, employee: val })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-green-100 bg-green-50/30">
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
                        <Button type="button" variant="ghost" onClick={() => setSelectedCenter(null)} className="h-12 px-8 rounded-xl">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSaving}
                            className="h-12 px-10 rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                        >
                            {isSaving ? "Updating..." : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Update Center
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}

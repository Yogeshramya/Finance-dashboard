"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
    Search, 
    Building2, 
    Users, 
    Calendar, 
    Clock, 
    UserCheck,
    Filter,
    ArrowRight,
    MapPin,
    ShieldCheck
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Center {
    _id: string;
    groupId: string;
    groupName: string;
    totalMembers: number;
    dueOn: string;
    collectionDay: string;
    collectionTime: string;
    employee: { name: string } | string;
    status: string;
}

interface Employee {
    _id: string;
    name: string;
}

export default function SearchCenterPage() {
    const { data: session } = useSession();

    const [query, setQuery] = useState("");
    const [centers, setCenters] = useState<Center[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("all");
    const [loading, setLoading] = useState(false);

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
        fetchCenters();
    }, []);

    const fetchCenters = async (searchQuery = "", empId = "all") => {
        setLoading(true);
        try {
            let url = `/api/group?status=ACTIVE`;
            
            if (empId !== "all") {
                url = `/api/group?employeeId=${empId}`;
            } else if (searchQuery) {
                url = `/api/group/search?query=${searchQuery}`;
            }
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (res.ok) {
                const groupsList = Array.isArray(data) ? data : (data.groups || []);
                setCenters(groupsList);
            } else {
                toast.error("Failed to fetch centers");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCenters(query, selectedEmployee);
    };

    return (
        <section className="max-w-7xl mx-auto space-y-8 p-6">
            <PageHeader />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Center Directory
                    </h1>
                    <p className="text-gray-500 mt-1">Browse and filter all registered centers in your branch.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-600">{centers.length} Active Centers</span>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50/50 rounded-2xl">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by Name, ID or Location..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10 h-11 rounded-xl bg-white border-gray-200"
                            />
                        </div>
                        
                        <div className="md:col-span-4">
                            <Select 
                                value={selectedEmployee} 
                                onValueChange={(val) => {
                                    setSelectedEmployee(val);
                                    fetchCenters(query, val);
                                }}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-white">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        <SelectValue placeholder="All Collectors" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Collectors</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="md:col-span-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md">
                            {loading ? "Filtering..." : "Apply Filters"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Centers Table/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {centers.length > 0 ? (
                    centers.map((center) => (
                        <Card key={center._id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
                            <CardContent className="p-0">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 border-blue-100">
                                                {center.groupId}
                                            </Badge>
                                            <h3 className="font-bold text-xl text-gray-900 mt-2">{center.groupName}</h3>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{center.totalMembers} Members</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{center.collectionDay}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{center.collectionTime || "TBD"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{center.dueOn}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                {typeof center.employee === 'object' ? center.employee.name.charAt(0) : '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Collector</span>
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {typeof center.employee === 'object' ? center.employee.name : 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all group-hover:translate-x-1">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-inner border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No centers matched your criteria</h3>
                        <p className="text-gray-500 mt-2">Try clearing your filters or searching for a different keyword.</p>
                        <Button variant="link" onClick={() => { setQuery(""); setSelectedEmployee("all"); fetchCenters(); }} className="mt-4 text-blue-600 font-bold">
                            Reset All Filters
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}

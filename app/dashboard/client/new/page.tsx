"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LoadingOverlay from "@/components/Loading";
import { Group } from "@/types/group";
import { Customer } from "@/types/customer";
import { FileUpload } from "@/components/Clients/FileUpload";

export default function NewClientPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    const defaultForm = {
        employee: "",
        group: "",
        joiningDate: "",
        customerCode: "",
        name: "",
        dob: "",
        age: "",
        gender: "Female",
        doorStreet: "",
        area: "",
        city: "",
        district: "",
        state: "",
        postalCode: "",
        aadhar: "",
        phone: "",
        voterId: "",
        rationCard: "",
        religion: "",
        houseType: "",
        panNo: "",
        occupation: "",
        savingsDue: "",
        loanType: "",
        loanAmount: "",
        nomineeName: "",
        nomineeDob: "",
        nomineeAge: "",
        nomineeGender: "",
        nomineeAadhar: "",
        nomineePhone: "",
        nomineeRelation: "",
        nomineeOccupation: "",
    };

    const [form, setForm] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("newClientForm");
            if (saved) return { ...defaultForm, ...JSON.parse(saved) };
        }
        return defaultForm;
    });

    const [urls, setUrls] = useState({
        memberPhoto: "",
        memberAadhaarFront: "",
        memberAadhaarBack: "",
        nomineePhoto: "",
        nomineeAadhaarFront: "",
        nomineeAadhaarBack: "",
        documentFile: ""
    });

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        const t = setTimeout(() => {
            localStorage.setItem("newClientForm", JSON.stringify(form));
        }, 500);

        return () => clearTimeout(t);
    }, [form]);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    /* ------------------ Load Employees ------------------ */
    useEffect(() => {
        async function loadEmployees() {
            const res = await fetch("/api/employees/list");
            const data = await res.json();
            if (data.success) setEmployees(data.employees);
        }
        loadEmployees();
    }, []);

    /* ------------------ Auto Generate Customer Code ------------------ */
    useEffect(() => {
        async function loadNextCode() {
            const res = await fetch("/api/clients/next-code");
            const data = await res.json();
            if (data.success) {
                setForm((prev: Customer) => ({ ...prev, customerCode: data.nextCode }));
            }
        }
        loadNextCode();
    }, []);

    /* ------------------ Load Groups when Employee Changes ------------------ */
    useEffect(() => {
        async function loadGroups() {
            if (!form.employee) {
                setGroups([]);
                return;
            }
            const res = await fetch(`/api/group/list?employee=${form.employee}&status=ACTIVE`);
            const data = await res.json();
            if (data.success) setGroups(data.groups);
        }
        loadGroups();
    }, [form.employee]);

    /* ------------------ Generic Input Handler ------------------ */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev: Customer) => ({ ...prev, [name]: value }));
    };

    const handleResetDraft = () => {
        localStorage.removeItem("newClientForm");
        setForm(defaultForm);
        setUrls({
            memberPhoto: "",
            memberAadhaarFront: "",
            memberAadhaarBack: "",
            nomineePhoto: "",
            nomineeAadhaarFront: "",
            nomineeAadhaarBack: "",
            documentFile: ""
        });
        toast.success("Form and uploads cleared");
    };

    const calculateAge = (dob: string) => {
        if (!dob) return "";
        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age.toString();
    };

    const requiredFields: { key: keyof typeof form; label: string }[] = [
        { key: "employee", label: "Employee" },
        { key: "group", label: "Group" },
        { key: "joiningDate", label: "Joining Date" },
        { key: "name", label: "Customer Name" },
        { key: "dob", label: "DOB" },
        { key: "age", label: "Age" },
        { key: "occupation", label: "Occupation" },
        { key: "doorStreet", label: "Door / Street" },
        { key: "area", label: "Area" },
        { key: "city", label: "City" },
        { key: "district", label: "District" },
        { key: "state", label: "State" },
        { key: "postalCode", label: "Postal Code" },
        { key: "aadhar", label: "Aadhaar" },
        { key: "phone", label: "Phone" },

        // Nominee
        { key: "nomineeName", label: "Nominee Name" },
        { key: "nomineeDob", label: "Nominee DOB" },
        { key: "nomineeAge", label: "Nominee Age" },
        { key: "nomineeGender", label: "Nominee Gender" },
        { key: "nomineeAadhar", label: "Nominee Aadhaar" },
        { key: "nomineePhone", label: "Nominee Phone" },
        { key: "nomineeRelation", label: "Nominee Relation" },
        { key: "nomineeOccupation", label: "Nominee Occupation" },
    ];

    /* ------------------ Submit Form ------------------ */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Required fields
        for (const f of requiredFields) {
            const v = form[f.key];
            if (!v || (typeof v === "string" && !v.trim())) {
                toast.error(`${f.label} is required`);
                return;
            }
        }
        // Format checks
        if (!/^\d{10}$/.test(form.phone)) return toast.error("Phone must be 10 digits");
        if (!/^\d{12}$/.test(form.aadhar)) return toast.error("Invalid Aadhaar");
        if (!/^\d{10}$/.test(form.nomineePhone)) return toast.error("Nominee phone invalid");
        if (!/^\d{12}$/.test(form.nomineeAadhar)) return toast.error("Nominee Aadhaar invalid");

        if (form.phone === form.nomineePhone)
            return toast.error("Nominee phone cannot be same as member phone");

        if (form.aadhar === form.nomineeAadhar)
            return toast.error("Nominee Aadhaar cannot be same as member Aadhaar");

        if (!urls.memberPhoto) return toast.error("Member photo required");
        if (!urls.memberAadhaarFront) return toast.error("Member Aadhaar front required");
        if (!urls.memberAadhaarBack) return toast.error("Member Aadhaar back required");
        if (!urls.nomineePhoto) return toast.error("Nominee photo required");
        if (!urls.nomineeAadhaarFront) return toast.error("Nominee Aadhaar front required");
        if (!urls.nomineeAadhaarBack) return toast.error("Nominee Aadhaar back required");

        // Age rules
        const memberAge = Number(form.age);
        const nomineeAge = Number(form.nomineeAge);
        if (memberAge < 18 || memberAge > 54)
            return toast.error("Member age must be 18–54");
        if (nomineeAge < 20 || nomineeAge > 58)
            return toast.error("Nominee age must be 20–58");

        if (memberAge < 18 || memberAge > 54) {
            return toast.error("Member age must be between 18 and 54 years!");
        }

        if (nomineeAge < 20 || nomineeAge > 58) {
            return toast.error("Nominee age must be between 20 and 58 years!");
        }
        setLoading(true);

        // Merge form text data with the uploaded URLs
        const finalPayload = {
            ...form,
            ...urls, // This adds memberPhoto, memberAadhaarFront, etc.
            nominee: {
                name: form.nomineeName,
                dob: form.nomineeDob,
                age: form.nomineeAge,
                gender: form.nomineeGender,
                aadhar: form.nomineeAadhar,
                phone: form.nomineePhone,
                relation: form.nomineeRelation,
                occupation: form.nomineeOccupation,
                photo: urls.nomineePhoto,
                aadhaarFront: urls.nomineeAadhaarFront,
                aadhaarBack: urls.nomineeAadhaarBack,
            },
        };
        const res = await fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Sending JSON now
            body: JSON.stringify(finalPayload),
        });

        const out = await res.json();
        setLoading(false);

        if (out.exists) {
            toast.error(
                `Client already exists: ${out.conflictWith.name} (${out.conflictWith.customerCode})`
            );

            // Redirect to existing client page
            router.push(`/dashboard/client/${out.conflictWith.customerId}`);
            return;
        }

        if (out.success) {
            localStorage.removeItem("newClientForm");
            toast.success("Client Created Successfully!");
            router.push("/dashboard/client");
            return;
        }

        toast.error(out.error || "Failed to create client.");
    };

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-6">
            <LoadingOverlay show={loading} />

            <PageHeader />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Add New Client</h1>

                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleResetDraft}
                >
                    Reset Form
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* ---------------- BASIC DETAILS ---------------- */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Employee */}
                            <div>
                                <Label>Employee</Label>
                                <select
                                    name="employee"
                                    className="border p-2 rounded w-full"
                                    value={form.employee}
                                    onChange={(e) =>
                                        setForm((p: Customer) => ({ ...p, employee: e.target.value, group: "" }))
                                    }
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Group */}
                            <div>
                                <Label>Group</Label>
                                <select
                                    name="group"
                                    className="border p-2 rounded w-full"
                                    value={form.group}
                                    onChange={handleChange as React.ChangeEventHandler<HTMLSelectElement>}
                                    disabled={!mounted || !form.employee}
                                >
                                    <option value="">Select Group</option>
                                    {groups.map((g) => (
                                        <option key={g._id} value={g._id}>
                                            {g.groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Joining Date */}
                            <div>
                                <Label>Date of Joining</Label>
                                <Input type="date" name="joiningDate" value={form.date} onChange={handleChange} />
                            </div>

                            {/* Customer Code */}
                            <div>
                                <Label>Customer Code</Label>
                                <Input disabled name="customerCode" value={form.customerCode} />
                            </div>

                            {/* Name */}
                            <div>
                                <Label>Customer Name *</Label>
                                <Input required name="name" value={form.name} onChange={handleChange} />
                            </div>

                            {/* DOB */}
                            <div>
                                <Label>DOB</Label>
                                <Input
                                    type="date"
                                    name="dob"
                                    value={form.dob ?? ""}
                                    onChange={(e) => {
                                        const dob = e.target.value;
                                        setForm((prev: Customer) => ({
                                            ...prev,
                                            dob,
                                            age: calculateAge(dob), // auto age
                                        }));
                                    }}
                                />

                            </div>

                            {/* Age */}
                            <div>
                                <Label>Age</Label>
                                <Input
                                    name="age"
                                    value={form.age}
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Gender */}
                            {/*<div>
                                <Label>Gender</Label>
                                <div className="flex gap-4 mt-2">
                                    <label><input type="radio" name="gender" value="Male" onChange={handleChange} /> Male</label>
                                    <label><input type="radio" name="gender" value="Female" onChange={handleChange} /> Female</label>
                                </div>
                            </div>*/}

                            <div><Label>Occupation</Label><Input name="occupation" value={form.occupation} onChange={handleChange} /></div>

                            {/* Address Fields */}
                            <div><Label>Door / Street</Label><Input name="doorStreet" value={form.doorStreet} onChange={handleChange} /></div>
                            <div><Label>Area</Label><Input name="area" value={form.area} onChange={handleChange} /></div>
                            <div><Label>City</Label><Input name="city" value={form.city} onChange={handleChange} /></div>
                            <div><Label>District</Label><Input name="district" value={form.district} onChange={handleChange} /></div>
                            <div><Label>State</Label><Input name="state" value={form.state} onChange={handleChange} /></div>
                            <div><Label>Postal Code</Label><Input name="postalCode" value={form.postalCode} onChange={handleChange} /></div>

                            {/* Aadhaar */}
                            <div>
                                <Label>Aadhaar No</Label>
                                <Input
                                    name="aadhar"
                                    value={form.aadhar}
                                    maxLength={12}
                                    onChange={(e) =>
                                        setForm({ ...form, aadhar: e.target.value.replace(/\D/g, "") })
                                    }
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <Label>Phone *</Label>
                                <div className="flex items-center border rounded-md">
                                    <span className="px-3 border-r bg-gray-50">+91</span>
                                    <Input
                                        name="phone"
                                        required
                                        className="border-0"
                                        maxLength={10}
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Member Photos */}
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <h2 className="text-lg font-bold mb-4">Member Documentation</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FileUpload
                                        label="Member Photo *"
                                        value={urls.memberPhoto}
                                        onChange={(val) => setUrls(p => ({ ...p, memberPhoto: val }))}
                                        folder={`clients/${form.customerCode}/member`}
                                    />
                                    <FileUpload
                                        label="Aadhaar Front *"
                                        value={urls.memberAadhaarFront}
                                        onChange={(val) => setUrls(p => ({ ...p, memberAadhaarFront: val }))}
                                        folder={`clients/${form.customerCode}/member`}
                                    />
                                    <FileUpload
                                        label="Aadhaar Back"
                                        value={urls.memberAadhaarBack}
                                        onChange={(val) => setUrls(p => ({ ...p, memberAadhaarBack: val }))}
                                        folder={`clients/${form.customerCode}/member`}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Document Upload */}
                        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-xl font-semibold">Additional Document</h2>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
                            </div>

                            <FileUpload
                                label="General Document (KYC / Agreement)"
                                value={urls.documentFile}
                                onChange={(val) => setUrls(p => ({ ...p, documentFile: val }))}
                                folder={`clients/${form.customerCode}/documents`}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Upload any additional KYC document or the signed application form.
                            </p>
                        </section>

                        {/* Nominee Details */}
                        <section>
                            <h2 className="text-xl font-semibold mb-2">Nominee Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Name</Label><Input name="nomineeName" onChange={handleChange} /></div>
                                <div>
                                    <Label>DOB</Label>
                                    <Input
                                        type="date"
                                        name="nomineeDob"
                                        value={form.nomineeDob ?? ""}
                                        onChange={(e) => {
                                            const dob = e.target.value;
                                            setForm((prev: Customer) => ({
                                                ...prev,
                                                nomineeDob: dob,
                                                nomineeAge: calculateAge(dob), // auto age
                                            }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label>Age</Label>
                                    <Input
                                        name="nomineeAge"
                                        value={form.nomineeAge}
                                        disabled
                                        className="bg-gray-100 cursor-not-allowed"
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <Label>Gender</Label>
                                    <div className="flex gap-4 mt-2">
                                        <label><input type="radio" name="nomineeGender" value="Male" onChange={handleChange} /> Male</label>
                                        <label><input type="radio" name="nomineeGender" value="Female" onChange={handleChange} /> Female</label>
                                    </div>
                                </div>
                                <div><Label>Occupation</Label><Input name="nomineeOccupation" onChange={handleChange} /></div>

                                {/* Aadhaar */}
                                <div><Label>Aadhaar</Label><Input name="nomineeAadhar" onChange={handleChange} /></div>

                                {/* Phone */}
                                <div><Label>Phone</Label><Input name="nomineePhone" onChange={handleChange} /></div>

                                {/* Relation */}
                                <div><Label>Relation</Label><Input name="nomineeRelation" onChange={handleChange} /></div>

                                {/* Nominee Photos */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h2 className="text-lg font-bold mb-4">Nominee Documentation</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FileUpload
                                            label="Nominee Photo *"
                                            value={urls.nomineePhoto}
                                            onChange={(val) => setUrls(p => ({ ...p, nomineePhoto: val }))}
                                            folder={`clients/${form.customerCode}/nominee`}
                                        />
                                        <FileUpload
                                            label="Nominee Aadhaar Front"
                                            value={urls.nomineeAadhaarFront}
                                            onChange={(val) => setUrls(p => ({ ...p, nomineeAadhaarFront: val }))}
                                            folder={`clients/${form.customerCode}/nominee`}
                                        />
                                        <FileUpload
                                            label="Nominee Aadhaar Back"
                                            value={urls.nomineeAadhaarBack}
                                            onChange={(val) => setUrls(p => ({ ...p, nomineeAadhaarBack: val }))}
                                            folder={`clients/${form.customerCode}/nominee`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>Save Client</Button>
                        </div>

                    </form>
                </CardContent>
            </Card >
        </div >
    );
}

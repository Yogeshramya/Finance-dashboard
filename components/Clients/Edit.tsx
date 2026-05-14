"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "../PageHeader";
import LoadingOverlay from "../Loading";
import Image from "next/image";
import { Group } from "@/types/group";

interface Nominee {
    name: string;
    dob: string;
    age: string;
    gender: string;
    aadhar: string;
    phone: string;
    relation: string;
    occupation: string;
}

interface FormState {
    employee: string;
    group: string;
    joiningDate: string;
    customerCode: string;

    name: string;
    dob: string;
    age: string;
    gender: string;
    doorStreet: string;
    area: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    aadhar: string;
    phone: string;
    voterId: string;
    rationCard: string;
    religion: string;
    houseType: string;
    panNo: string;
    occupation: string;
    savingsDue: string;
    loanType: string;
    loanAmount: string;
    documentFile: string;

    nominee: Nominee;
}

/* --------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------- */

export default function EditClientPage({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);

    const [form, setForm] = useState<FormState>({
        employee: "",
        group: "",
        joiningDate: "",
        customerCode: "",
        name: "",
        dob: "",
        age: "",
        gender: "",
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
        documentFile: "",
        nominee: {
            name: "",
            dob: "",
            age: "",
            gender: "",
            aadhar: "",
            phone: "",
            relation: "",
            occupation: ""
        }
    });

    // FILE STATES
    const [memberPhoto, setMemberPhoto] = useState<File | null>(null);
    const [memberAadhaarFront, setMemberAadhaarFront] = useState<File | null>(null);
    const [memberAadhaarBack, setMemberAadhaarBack] = useState<File | null>(null);
    const [nomineePhoto, setNomineePhoto] = useState<File | null>(null);
    const [nomineeAadhaarFront, setNomineeAadhaarFront] = useState<File | null>(null);
    const [nomineeAadhaarBack, setNomineeAadhaarBack] = useState<File | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);

    /* --------------------------------------------------
       LOAD CLIENT DATA
    -------------------------------------------------- */
    useEffect(() => {
        async function loadClient() {
            const res = await fetch(`/api/clients/${id}`);
            const json = await res.json();
            if (!json.success) return toast.error("Client not found");

            const c = json.client;
            console.log(c.group)

            setForm({
                ...c,
                employee: c.employee?._id.toString() ?? "",
                group: c.group?._id.toString() ?? "",
                nominee: {
                    name: c.nominee?.name ?? "",
                    dob: c.nominee?.dob ?? "",
                    age: c.nominee?.age ?? "",
                    gender: c.nominee?.gender ?? "",
                    aadhar: c.nominee?.aadhar ?? "",
                    phone: c.nominee?.phone ?? "",
                    relation: c.nominee?.relation ?? "",
                    occupation: c.nominee?.occupation ?? ""
                }
            });

            setLoading(false);
        }
        loadClient();
    }, [id]);

    /* --------------------------------------------------
       LOAD EMPLOYEES
    -------------------------------------------------- */
    useEffect(() => {
        fetch("/api/employees/list")
            .then(res => res.json())
            .then(data => setEmployees(data.employees ?? []));
    }, []);

    /* --------------------------------------------------
       LOAD GROUPS WHEN EMPLOYEE CHANGES
    -------------------------------------------------- */
    useEffect(() => {
        if (!form.employee) return;

        fetch(`/api/group/list?employee=${form.employee}&status=ACTIVE`)
            .then(res => res.json())
            .then(data => setGroups(data.groups ?? []));
    }, [form.employee]);

    /* --------------------------------------------------
       HANDLERS
    -------------------------------------------------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleNomineeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({
            ...prev,
            nominee: { ...prev.nominee, [e.target.name]: e.target.value }
        }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const fd = new FormData();
        fd.append("data", JSON.stringify(form));

        // Files
        if (memberPhoto) fd.append("memberPhoto", memberPhoto);
        if (memberAadhaarFront) fd.append("memberAadhaarFront", memberAadhaarFront);
        if (memberAadhaarBack) fd.append("memberAadhaarBack", memberAadhaarBack);
        if (documentFile) fd.append("documentFile", documentFile);

        if (nomineePhoto) fd.append("nomineePhoto", nomineePhoto);
        if (nomineeAadhaarFront) fd.append("nomineeAadhaarFront", nomineeAadhaarFront);
        if (nomineeAadhaarBack) fd.append("nomineeAadhaarBack", nomineeAadhaarBack);

        const res = await fetch(`/api/clients/${id}`, { method: "PUT", body: fd });
        const out = await res.json();
        setLoading(false);

        if (!out.success) return toast.error(out.error || "Failed to update client");

        toast.success("Client Updated Successfully!");
        router.push(`/dashboard/client/${id}`);
    };

    /* --------------------------------------------------
       UI
    -------------------------------------------------- */

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <LoadingOverlay show={loading} />
            <PageHeader />
            <h1 className="text-2xl font-bold">Edit Client</h1>

            <Card>
                <CardContent className="p-6 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* BASIC DETAILS */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField label="Employee" name="employee" values={employees} form={form} setForm={setForm} />
                            <SelectField label="Group" name="group" values={groups} form={form} setForm={setForm} />

                            <InputField label="Joining Date" name="joiningDate" value={form.joiningDate} type="date" onChange={handleChange} />

                            <InputField label="Customer Code" name="customerCode" value={form.customerCode} onChange={handleChange} required disabled />

                            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} required />

                            <InputField label="DOB" name="dob" type="date" value={form.dob} onChange={handleChange} />
                            <InputField label="Age" name="age" value={form.age} onChange={handleChange} />

                            <RadioGroupField label="Gender" name="gender" current={form.gender} onChange={handleChange} />

                            <InputField label="Door/Street" name="doorStreet" value={form.doorStreet} onChange={handleChange} />
                            <InputField label="Area" name="area" value={form.area} onChange={handleChange} />
                            <InputField label="City" name="city" value={form.city} onChange={handleChange} />
                            <InputField label="District" name="district" value={form.district} onChange={handleChange} />
                            <InputField label="State" name="state" value={form.state} onChange={handleChange} />
                            <InputField label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} />
                            <InputField label="Aadhar No" name="aadhar" value={form.aadhar} onChange={handleChange} />
                            <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
                            <InputField
                                label="Occupation"
                                name="occupation"
                                value={form.occupation}
                                onChange={handleChange}
                            />

                            <FileField label="Member Photo" onChange={setMemberPhoto} />
                            <FileField label="Aadhaar Front" onChange={setMemberAadhaarFront} />
                            <FileField label="Aadhaar Back" onChange={setMemberAadhaarBack} />
                        </section>

                        {/* DOCUMENT */}
                        <section>
                            <h2 className="text-xl font-semibold mb-3">Document</h2>

                            {form.documentFile && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600">Current Document:</p>
                                    <Image
                                        src={form.documentFile}
                                        alt="Document"
                                        className="w-32 h-32 object-cover rounded border"
                                        width={128}
                                        height={128}
                                    />
                                </div>
                            )}

                            <FileField label="Replace Document" onChange={setDocumentFile} />
                        </section>

                        {/* NOMINEE */}
                        <section>
                            <h2 className="text-xl font-semibold mb-3">Nominee Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Nominee Name" name="name" value={form.nominee.name} onChange={handleNomineeChange} />
                                <InputField label="Nominee DOB" name="dob" type="date" value={form.nominee.dob} onChange={handleNomineeChange} />
                                <InputField label="Nominee Age" name="age" value={form.nominee.age} onChange={handleNomineeChange} />

                                <RadioGroupField label="Nominee Gender" name="gender" current={form.nominee.gender} onChange={handleNomineeChange} />

                                <InputField label="Nominee Aadhaar" name="aadhar" value={form.nominee.aadhar} onChange={handleNomineeChange} />
                                <InputField label="Nominee Phone" name="phone" value={form.nominee.phone} onChange={handleNomineeChange} />
                                <InputField label="Relation" name="relation" value={form.nominee.relation} onChange={handleNomineeChange} />
                                <InputField
                                    label="Nominee Occupation"
                                    name="occupation"
                                    value={form.nominee.occupation}
                                    onChange={handleNomineeChange}
                                />

                                <FileField label="Nominee Photo" onChange={setNomineePhoto} />
                                <FileField label="Aadhaar Front" onChange={setNomineeAadhaarFront} />
                                <FileField label="Aadhaar Back" onChange={setNomineeAadhaarBack} />
                            </div>
                        </section>

                        <div className="flex justify-end">
                            <Button type="submit" className="px-8">Update Client</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

/* --------------------------------------------------
   REUSABLE COMPONENTS — FULLY TYPED
-------------------------------------------------- */

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
}

function InputField({ label, ...props }: InputFieldProps) {
    return (
        <div>
            <Label>{label}</Label>
            <Input className="mt-1" {...props} />
        </div>
    );
}

interface FileFieldProps {
    label: string;
    onChange: (file: File | null) => void;
}

function FileField({ label, onChange }: FileFieldProps) {
    return (
        <div>
            <Label>{label}</Label>
            <Input
                className="mt-1"
                type="file"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
        </div>
    );
}

interface RadioFieldProps {
    label: string;
    name: string;
    current: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function RadioGroupField({ label, name, current, onChange }: RadioFieldProps) {
    return (
        <div>
            <Label>{label}</Label>
            <div className="flex gap-4 mt-2">
                {["Male", "Female"].map((g) => (
                    <label key={g}>
                        <input
                            type="radio"
                            name={name}
                            value={g}
                            checked={current === g}
                            onChange={onChange}
                        />{" "}
                        {g}
                    </label>
                ))}
            </div>
        </div>
    );
}

interface SelectFieldProps<T> {
    label: string;
    name: string;
    values: T[];
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

function SelectField<T extends { _id: string; name?: string; groupName?: string }>({
    label,
    name,
    values,
    form,
    setForm
}: SelectFieldProps<T>) {
    return (
        <div>
            <Label>{label}</Label>
            <select
                name={name}
                className="border p-2 rounded w-full"
                value={form[name as keyof FormState] as string}
                onChange={(e) => setForm(prev => ({ ...prev, [name]: e.target.value }))}
            >
                <option value="">Select {label}</option>
                {values.map((item) => (
                    <option key={item._id} value={item._id}>
                        {item.name || item.groupName}
                    </option>
                ))}
            </select>
        </div>
    );
}

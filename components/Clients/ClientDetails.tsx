"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Customer } from "@/types/customer";
import { getOptimizedImageUrl } from "@/lib/cloudinary-utils";

export default function ClientDetails({ client }: { client: Customer }) {
    return (
        <>
            <h1 className="text-2xl font-bold text-gray-800">
                Client Details — {client.name}
            </h1>

            {/* ========================== */}
            {/* BASIC INFO */}
            {/* ========================== */}
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
                        <div className="space-y-1 text-sm">
                            <p><strong>Customer Code:</strong> {client.customerCode}</p>
                            <p><strong>Name:</strong> {client.name}</p>
                            <p><strong>Phone:</strong> {client.phone}</p>
                            <p><strong>DOB:</strong> {client.dob}</p>
                            <p><strong>Age:</strong> {client.age}</p>
                            <p><strong>Gender:</strong> {client.gender}</p>
                            <p><strong>Aadhaar:</strong> {client.aadhar}</p>
                            <p><strong>Employee:</strong> {client.employee?.name ?? "—"}</p>
                            <p><strong>Group:</strong> {client.group?.groupName ?? "—"}</p>
                            <p><strong>Joining Date:</strong> {client.joiningDate}</p>
                            <p><strong>Occupation:</strong> {client.occupation ?? "—"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <h2 className="text-lg font-semibold">Member Photo</h2>
                        {client.memberPhoto ? (
                            <Image
                                src={getOptimizedImageUrl(client.memberPhoto)}
                                alt="Member Photo"
                                loading="eager"
                                width={200}
                                height={200}
                                className="rounded-lg border"
                            />
                        ) : (
                            <p className="text-gray-500">No photo uploaded</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ========================== */}
            {/* ADDRESS */}
            {/* ========================== */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-2">Address</h2>
                    <div className="space-y-1 text-sm">
                        <p><strong>Street:</strong> {client.doorStreet}</p>
                        <p><strong>Area:</strong> {client.area}</p>
                        <p><strong>City:</strong> {client.city}</p>
                        <p><strong>District:</strong> {client.district}</p>
                        <p><strong>State:</strong> {client.state}</p>
                        <p><strong>Pincode:</strong> {client.postalCode}</p>
                    </div>
                </CardContent>
            </Card>

            {/* ========================== */}
            {/* MEMBER DOCUMENTS */}
            {/* ========================== */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Member Documents</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Doc image={client.memberAadhaarFront} label="Aadhaar Front" />
                        <Doc image={client.memberAadhaarBack} label="Aadhaar Back" />
                        <Doc image={client.documentFile} label="Document" />
                    </div>
                </CardContent>
            </Card>

            {/* ========================== */}
            {/* NOMINEE */}
            {/* ========================== */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Nominee Information</h2>
                    <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {client.nominee?.name}</p>
                        <p><strong>DOB:</strong> {client.nominee?.dob}</p>
                        <p><strong>Age:</strong> {client.nominee?.age}</p>
                        <p><strong>Gender:</strong> {client.nominee?.gender}</p>
                        <p><strong>Aadhaar:</strong> {client.nominee?.aadhar}</p>
                        <p><strong>Phone:</strong> {client.nominee?.phone}</p>
                        <p><strong>Relation:</strong> {client.nominee?.relation}</p>
                        <p><strong>Occupation:</strong> {client.nominee?.occupation ?? "—"}</p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Doc image={client.nominee?.photo} label="Nominee Photo" />
                        <Doc image={client.nominee?.aadhaarFront} label="Aadhaar Front" />
                        <Doc image={client.nominee?.aadhaarBack} label="Aadhaar Back" />
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

interface DocProps {
    image?: string;
    label: string;
}

function Doc({ image, label }: DocProps) {
    return (
        <div>
            <h3 className="font-medium mb-1">{label}</h3>
            {image ? (
                <Image
                    src={getOptimizedImageUrl(image)}
                    alt={label}
                    loading="eager"
                    width={300}
                    height={200}
                    className="rounded-lg border"
                />
            ) : (
                <p className="text-gray-500">Not uploaded</p>
            )}
        </div>
    );
}

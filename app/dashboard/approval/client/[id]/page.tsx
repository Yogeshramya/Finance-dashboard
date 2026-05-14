import ClientApprovalActions from "@/components/Clients/ClientActions";
import ClientDetails from "@/components/Clients/ClientDetails";
import PageHeader from "@/components/PageHeader";
import React from "react";

export default async function ClientApprovalView({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/clients/${id}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return (
            <main className="p-6 space-y-6">
                <PageHeader />
                <p className="p-6 text-center text-red-600">
                    Client not found or access denied
                </p>
            </main>
        );
    }

    const data = await res.json();

    return (
        <main className="p-6 space-y-6">
            <PageHeader />
            <ClientDetails client={data.client} />
            {data.client.status === "PENDING" && (
                <ClientApprovalActions clientId={data.client._id} />
            )}
        </main>
    );
}

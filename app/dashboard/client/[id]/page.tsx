import ClientDetails from "@/components/Clients/ClientDetails";
import PageHeader from "@/components/PageHeader";
async function getClient(id: string) {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clients/${id}`, {
            cache: "no-store",
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.client || data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export default async function ClientViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClient(id);

    if (!client) {
        return (
            <div className="p-6 text-center text-xl text-red-600">
                Client not found
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader />
            <ClientDetails client={client} />
        </div>
    )
}

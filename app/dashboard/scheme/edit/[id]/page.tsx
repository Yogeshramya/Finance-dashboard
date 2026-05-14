import PageHeader from "@/components/PageHeader";
import EditSchemeForm from "@/components/Scheme/EditSchemaForm";
import { connectDB } from "@/lib/db";
import Scheme from "@/models/Scheme";

export default async function EditSchemePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await connectDB();
    const scheme = await Scheme.findOne({ schemeId: id }).lean();

    if (!scheme) {
        return <p className="text-center mt-10">Scheme not found</p>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <PageHeader />
            <EditSchemeForm scheme={JSON.parse(JSON.stringify(scheme))} />
        </div>
    );
}

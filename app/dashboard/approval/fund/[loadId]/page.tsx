import ApprovalForm from "@/components/Funds/ApprovalForm";
import PageHeader from "@/components/PageHeader";

type ApprovalPageProps = {
    params: Promise<{
        loadId: string;
    }>;
}

export default async function ApprovalPage({ params }: ApprovalPageProps) {
    const { loadId } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/fund/${loadId}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return (
            <p className="text-center text-red-500 mt-20">
                Loan Not Found
            </p>
        );
    }

    const data = await res.json();

    if (!data?.loan) {
        return (
            <p className="text-center text-red-500 mt-20">
                Loan Not Found
            </p>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10">
            <PageHeader />
            <ApprovalForm loan={data.loan} />
        </div>
    );
}

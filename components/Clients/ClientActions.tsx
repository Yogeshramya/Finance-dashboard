// app/dashboard/approval/client/[id]/ClientApprovalActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ClientApprovalActions({
    clientId,
}: {
    clientId: string;
}) {
    const handleApprove = async () => {
        if (!confirm("Approve this client?")) return;

        const res = await fetch(`/api/clients/${clientId}/approve`, {
            method: "PUT",
        });

        const json = await res.json();

        if (json.success) {
            toast.success("Client approved successfully");
            location.href = "/dashboard/approval/client";
        } else {
            toast.error(json.error || "Approval failed");
        }
    };

    const handleReject = async () => {
        if (!confirm("Reject this client?")) return;

        const res = await fetch(`/api/clients/${clientId}/reject`, {
            method: "DELETE",
        });

        const json = await res.json();

        if (json.success) {
            toast.success("Client rejected successfully");
            location.href = "/dashboard/approval/client";
        } else {
            toast.error(json.error || "Rejection failed");
        }
    };

    return (
        <div className="flex justify-end gap-3">
            <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
            >
                Approve Client
            </Button>

            <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleReject}
            >
                Reject Client
            </Button>
        </div>
    );
}

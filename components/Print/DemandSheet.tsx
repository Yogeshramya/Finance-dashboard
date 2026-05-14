"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Customer } from "@/types/customer";
import { Loan, Dues } from "@/types/fund";

/* ================= TYPES ================= */

interface RowData {
    client: Customer;
    loan: Loan | null;
    due?: Dues | null;
    nextDueNo: number | null;
    paidDues: number;
    totalDues: number;
    totalSavings: number;
}

interface Group {
    groupName: string;
    collectionDay: string;
    collectionTime: string;
}

interface Employee {
    name: string;
    branch?: {
        _id: string;
        name: string;
    };
}

/* ================= HELPERS ================= */

function getNextDueInfo(dues: Dues[]) {
    const paidCount = dues.filter((d) => d.paid).length;
    const nextDue = dues[paidCount];
    if (!nextDue) return { dueNo: null, due: null };
    return { dueNo: paidCount + 1, due: nextDue };
}

function formatManualDate(date: string) {
    if (!date) return "";
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
}

/* ================= PAGE ================= */

export default function DemandSheetPrintPage() {
    const params = useSearchParams();

    const groupId = params.get("groupId");
    const employeeId = params.get("employee");
    const date = params.get("date");

    const [rows, setRows] = useState<RowData[]>([]);
    const [group, setGroup] = useState<Group | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);

    const sheetDate = formatManualDate(date || "");

    /* ================= LOAD DATA ================= */

    useEffect(() => {
        async function loadData() {
            /* GROUP INFO */
            const groupRes = await fetch(`/api/group/${groupId}`);
            const groupData = await groupRes.json();
            setGroup(groupData);

            /* EMPLOYEE */
            const empRes = await fetch(`/api/employees/${employeeId}`);
            const empData = await empRes.json();
            setEmployee(empData);

            /* CLIENTS */
            const clientRes = await fetch(`/api/clients?groupId=${groupId}`);
            const clientData = await clientRes.json();

            const clients = clientData.clients || [];
            const finalRows: RowData[] = [];

            for (const client of clients) {
                const loanRes = await fetch(
                    `/api/fund/customer?customerId=${client._id}`
                );
                const loanData = await loanRes.json();

                const loan =
                    loanData?.loan?.status === "APPROVED" ? loanData.loan : null;

                const savRes = await fetch(
                    `/api/fund/total-savings?clientId=${client._id}`
                );
                const savData = await savRes.json();

                const totalSavings = Number(savData.totalSavings || 0);

                if (!loan && totalSavings === 0) continue;

                let due = null;
                let nextDueNo = null;
                let paidDues = 0;
                let totalDues = 0;

                if (loan) {
                    const next = getNextDueInfo(loan.dues);
                    due = next.due;
                    nextDueNo = next.dueNo;
                    paidDues = loan.dues.filter((d: Dues) => d.present).length;
                    totalDues = loan.dues.length;
                }

                finalRows.push({
                    client,
                    loan,
                    due,
                    nextDueNo,
                    paidDues,
                    totalDues,
                    totalSavings,
                });
            }

            setRows(finalRows);
        }

        if (groupId) loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    /* ================= TOTALS ================= */

    const totals = rows.reduce(
        (acc, r) => {
            let outstanding = 0;
            let principal = 0;
            let interest = 0;
            let savings = 0;
            let total = 0;

            if (r.loan) {
                const totalPrincipalInterest = r.loan.dues.reduce(
                    (sum, d) =>
                        sum + Number(d.principal || 0) + Number(d.interest || 0),
                    0
                );

                const paidPrincipalInterest = r.loan.dues
                    .filter((d) => d.paid)
                    .reduce(
                        (sum, d) =>
                            sum + Number(d.principal || 0) + Number(d.interest || 0),
                        0
                    );

                outstanding = totalPrincipalInterest - paidPrincipalInterest;

                principal = Number(r.due?.principal || 0);
                interest = Number(r.due?.interest || 0);
                savings = Number(r.due?.savings || 0);
                total = Number(r.due?.total || 0);
            }

            acc.outstanding += outstanding;
            acc.totalSavings += r.totalSavings;
            acc.principal += principal;
            acc.interest += interest;
            acc.savings += savings;
            acc.total += total;

            return acc;
        },
        {
            outstanding: 0,
            totalSavings: 0,
            principal: 0,
            interest: 0,
            savings: 0,
            total: 0,
        }
    );

    return (
        <div className="max-w-[1000px] mx-auto p-6 print:p-0">

            {/* ================= PRINT STYLES ================= */}

            <style jsx global>{`
        @media print {

          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            margin: 0;
          }

          button {
            display: none !important;
          }

          table {
            font-size: 10px;
          }
        }
      `}</style>

            {/* ================= PRINT BUTTON ================= */}

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 border border-black text-black"
                >
                    Print
                </button>
            </div>

            {/* ================= HEADER IMAGE ================= */}

            <Image
                src="/finance_header.png"
                alt="Header"
                width={1400}
                height={300}
                className="w-full"
            />
            <p className="font-bold">BRANCH: {employee?.branch?.name}</p>
            {/* ================= HEADER INFO ================= */}

            <div className="grid grid-cols-5 gap-2 text-sm font-semibold mt-2 mb-3">
                <p>AREA : {group?.groupName}</p>
                <p>S.M : {employee?.name}</p>
                <p>DAY : {group?.collectionDay}</p>
                <p>TIME : {group?.collectionTime}</p>
                <p>DATE : {sheetDate}</p>

            </div>

            {/* ================= TABLE ================= */}

            <table className="w-full border border-black border-collapse text-center">

                <thead className="bg-white font-bold">
                    <tr>
                        <th className="border border-black p-1">CUS.ID</th>
                        <th className="border border-black p-1">LOAN</th>
                        <th className="border border-black p-1">NAME</th>
                        <th className="border border-black p-1">PHONE</th>
                        <th className="border border-black p-1">PRESENT</th>
                        <th className="border border-black p-1">DUE</th>
                        <th className="border border-black p-1">OUTSTANDING</th>
                        <th className="border border-black p-1">TOTAL SAV</th>
                        <th className="border border-black p-1">PRINCIPAL</th>
                        <th className="border border-black p-1">INTEREST</th>
                        <th className="border border-black p-1">SAVINGS</th>
                        <th className="border border-black p-1">TOTAL</th>
                        <th className="border border-black p-1">SIGN</th>
                    </tr>
                </thead>

                <tbody>

                    {rows.map((r) => {

                        let outstanding = 0;
                        let principal = 0;
                        let interest = 0;
                        let savings = 0;
                        let total = 0;

                        if (r.loan) {

                            const totalPrincipalInterest = r.loan.dues.reduce(
                                (sum, d) =>
                                    sum +
                                    Number(d.principal || 0) +
                                    Number(d.interest || 0),
                                0
                            );

                            const paidPrincipalInterest = r.loan.dues
                                .filter((d) => d.paid)
                                .reduce(
                                    (sum, d) =>
                                        sum +
                                        Number(d.principal || 0) +
                                        Number(d.interest || 0),
                                    0
                                );

                            outstanding = totalPrincipalInterest - paidPrincipalInterest;

                            principal = Number(r.due?.principal || 0);
                            interest = Number(r.due?.interest || 0);
                            savings = Number(r.due?.savings || 0);
                            total = Number(r.due?.total || 0);
                        }

                        return (
                            <tr key={r.client._id}>

                                <td className="border border-black p-1 font-bold">
                                    {r.client.customerCode}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    <div>{r.loan?.loanAmount || 0}</div>

                                    {r.loan && (
                                        <div className="text-[9px]">
                                            {new Date(r.loan.loanDate).toLocaleDateString("en-GB")}
                                        </div>
                                    )}
                                </td>

                                <td className="border border-black p-1 text-left font-bold">
                                    <div>{r.client.name}</div>

                                    {r.client.nominee?.name && (
                                        <div className="text-[9px]">
                                            {r.client.nominee.name}
                                        </div>
                                    )}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    <div>{r.client.phone}</div>

                                    {r.client.nominee?.phone && (
                                        <div className="text-[9px]">
                                            {r.client.nominee.phone}
                                        </div>
                                    )}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {r.paidDues}/{r.totalDues}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {r.nextDueNo ? r.nextDueNo - 1 : "-"}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {outstanding}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {r.totalSavings}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {principal}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {interest}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {savings}
                                </td>

                                <td className="border border-black p-1 font-bold">
                                    {total}
                                </td>

                                <td className="border border-black p-1 font-bold"></td>

                            </tr>
                        );
                    })}

                </tbody>

                <tfoot className="font-bold">

                    <tr>
                        <td colSpan={6} className="border border-black p-1 text-right">
                            TOTAL
                        </td>

                        <td className="border border-black p-1">
                            {totals.outstanding}
                        </td>

                        <td className="border border-black p-1">
                            {totals.totalSavings}
                        </td>

                        <td className="border border-black p-1">
                            {totals.principal}
                        </td>

                        <td className="border border-black p-1">
                            {totals.interest}
                        </td>

                        <td className="border border-black p-1">
                            {totals.savings}
                        </td>

                        <td className="border border-black p-1">
                            {totals.total}
                        </td>

                        <td className="border border-black"></td>
                    </tr>

                </tfoot>

            </table>

            {/* ================= FOOTER IMAGE ================= */}

            <Image
                src="/finance_footer.png"
                alt="Footer"
                width={1400}
                height={200}
                className="w-full mt-4"
            />

        </div>
    );
}
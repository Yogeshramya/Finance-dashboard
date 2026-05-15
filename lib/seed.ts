import { connectDB } from "./db";
import Branch from "@/models/Branch";
import Client from "@/models/Client";
import Group from "@/models/Group";
import Scheme from "@/models/Scheme";
import Credit from "@/models/Credit";
import Debit from "@/models/Debit";
import Loan from "@/models/Loan";
import Savings from "@/models/Savings";
import CreditTitle from "@/models/CreditTitle";
import DebitTitle from "@/models/DebitTitle";

// Demo data for FinoraX
const demoBranches = [
    {
        name: "Chennai Central",
        code: "CHN001",
        address: "123 Anna Salai, Chennai",
        phone: "044-12345678",
        manager: "Rajesh Kumar",
    },
    {
        name: "Bengaluru South",
        code: "BNG001",
        address: "456 MG Road, Bengaluru",
        phone: "080-87654321",
        manager: "Priya Sharma",
    },
];

const demoClients = [
    "Zenith Holdings", "Vertex Retail", "Nova Capital", "GreenField Logistics", "Orbit Enterprises",
    "Apex Solutions", "Summit Ventures", "Pinnacle Corp", "Horizon Ltd", "Vanguard Inc",
    "Elite Partners", "Prime Assets", "Nexus Group", "Titan Industries", "Crown Enterprises",
];

const demoSchemes = [
    {
        name: "Standard Loan",
        interestRate: 12,
        duration: 12,
        minAmount: 10000,
        maxAmount: 500000,
    },
    {
        name: "Premium Loan",
        interestRate: 10,
        duration: 24,
        minAmount: 50000,
        maxAmount: 1000000,
    },
];

export async function seedDemoData() {
    try {
        await connectDB();

        // Clear existing data
        await Promise.all([
            Branch.deleteMany({}),
            Client.deleteMany({}),
            Group.deleteMany({}),
            Scheme.deleteMany({}),
            Credit.deleteMany({}),
            Debit.deleteMany({}),
            Loan.deleteMany({}),
            Savings.deleteMany({}),
            CreditTitle.deleteMany({}),
            DebitTitle.deleteMany({}),
        ]);

        // Seed titles
        await CreditTitle.insertMany([
            { title: "Admission Fee" },
            { title: "Insurance Fee" },
            { title: "Application Fee" },
            { title: "Miscellaneous" },
        ]);

        await DebitTitle.insertMany([
            { title: "Office Rent" },
            { title: "Salary" },
            { title: "Electricity Bill" },
            { title: "Miscellaneous" },
        ]);

        // Seed branches
        const branches = await Branch.insertMany(demoBranches);

        // Seed schemes
        const schemes = await Scheme.insertMany(demoSchemes);

        // Seed clients and groups
        for (const branch of branches) {
            const branchClients = demoClients.map((name, index) => ({
                name,
                phone: `98765432${index.toString().padStart(2, '0')}`,
                address: `${name} Address`,
                branch: branch._id,
                group: null, // will set later
            }));

            const clients = await Client.insertMany(branchClients);

            // Create groups
            const groups = [];
            for (let i = 0; i < 3; i++) {
                const groupClients = clients.slice(i * 5, (i + 1) * 5);
                const group = await Group.create({
                    name: `Group ${i + 1} - ${branch.name}`,
                    branch: branch._id,
                    clients: groupClients.map(c => c._id),
                    collectionDay: ["Monday", "Wednesday", "Friday"][i],
                });
                groups.push(group);

                // Update clients with group
                await Client.updateMany(
                    { _id: { $in: groupClients.map(c => c._id) } },
                    { group: group._id }
                );
            }

            // Seed loans and transactions for last 3 months
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            for (const client of clients) {
                // Create loan
                const loan = await Loan.create({
                    client: client._id,
                    scheme: schemes[Math.floor(Math.random() * schemes.length)]._id,
                    amount: Math.floor(Math.random() * 200000) + 50000,
                    interestRate: 12,
                    duration: 12,
                    status: "active",
                    branch: branch._id,
                    createdAt: new Date(threeMonthsAgo.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000),
                });

                // Create credit transaction
                await Credit.create({
                    client: client._id,
                    amount: loan.amount,
                    title: "Application Fee",
                    details: "Loan disbursement entry",
                    branch: branch._id,
                    date: loan.createdAt,
                    status: "APPROVED"
                });

                // Create some debit transactions (repayments)
                const numPayments = Math.floor(Math.random() * 6) + 3;
                for (let p = 0; p < numPayments; p++) {
                    await Debit.create({
                        client: client._id,
                        amount: Math.floor(loan.amount / loan.duration) + Math.floor(Math.random() * 5000),
                        title: "Miscellaneous",
                        details: "Loan repayment entry",
                        branch: branch._id,
                        date: new Date(loan.createdAt.getTime() + (p + 1) * 30 * 24 * 60 * 60 * 1000),
                        status: "APPROVED"
                    });
                }

                // Create savings
                await Savings.create({
                    client: client._id,
                    amount: Math.floor(Math.random() * 50000) + 10000,
                    branch: branch._id,
                    date: new Date(),
                });
            }
        }

        console.log("Demo data seeded successfully");
    } catch (error) {
        console.error("Error seeding demo data:", error);
    }
}
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function Expense() {
    const [expenses, setExpenses] = useState<{ id: number; name: string; amount: number }[]>([]);

    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");

    const handleAddExpense = () => {
        if (expenseName && expenseAmount) {
            setExpenses([...expenses, { id: Date.now(), name: expenseName, amount: parseFloat(expenseAmount) }]);
            setExpenseName("");
            setExpenseAmount("");
        }
    };
    const handleDeleteExpense = (id: number) => setExpenses(expenses.filter((e) => e.id !== id));
    return (
        <section className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-semibold text-pink-600">Manage Expenses</h1>
            <div className="flex gap-3">
                <Input
                    className="bg-white border-gray-300 text-gray-800"
                    placeholder="Expense name"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                />
                <Input
                    className="bg-white border-gray-300 text-gray-800"
                    placeholder="Amount"
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                />
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90" onClick={handleAddExpense}>
                    Add Expense
                </Button>
            </div>

            <div className="space-y-3">
                {expenses.length === 0 ? (
                    <p className="text-gray-500">No expenses added yet.</p>
                ) : (
                    expenses.map((expense) => (
                        <div
                            key={expense.id}
                            className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-pink-500"
                        >
                            <span className="font-medium">{expense.name}</span>
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold text-pink-600">₹{expense.amount}</span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}
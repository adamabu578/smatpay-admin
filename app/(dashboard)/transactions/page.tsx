import { TransactionTable } from "@/components/transaction-table"

export default function TransactionsPage() {
  return (
    <>
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Manage and filter your entire enterprise transaction ledger.</p>
      </div>
      <TransactionTable />
    </>
  )
}

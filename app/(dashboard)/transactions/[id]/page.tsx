import { TransactionDetails } from "@/components/transaction-details"

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const transactionId = (await params).id;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-12 w-full">
      <div className="flex flex-col gap-1">
         <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
         <p className="text-muted-foreground">Comprehensive view of the transaction history, metrics, and raw metadata logs.</p>
      </div>

      <TransactionDetails transactionId={transactionId} />
    </div>
  )
}

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"

import { TransactionTable } from "@/components/transaction-table"

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <TransactionTable />
    </>
  )
}

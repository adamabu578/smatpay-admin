import { ServiceTable } from "@/components/service-table"

export default function ServicesPage() {
  return (
    <>
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">Manage service configurations, pricing, and commissions.</p>
      </div>
      <ServiceTable />
    </>
  )
}

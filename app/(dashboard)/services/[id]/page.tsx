import { ServiceForm } from "@/components/service-form"

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const serviceId = (await params).id;
  const isNew = serviceId === "new";

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-12 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{isNew ? "Create Service" : "Edit Service"}</h1>
        <p className="text-muted-foreground">Configure the core parameters and vendor routing for this service.</p>
      </div>

      <ServiceForm serviceId={serviceId} />
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { IconDeviceFloppy, IconArrowLeft } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"

const serviceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  code: z.string().min(2, "Code must be at least 2 characters."),
  parent: z.string().optional(),
  provider: z.string().min(2, "Provider is required."),
  commissionType: z.string(),
  unitPrice: z.coerce.number().optional(),
  unitCharge: z.coerce.number().min(0),
  unitCommission: z.coerce.number().min(0).default(0),
  unitBonus: z.coerce.number().min(0).default(0),
  vendorName: z.string().optional(),
  vendorCode: z.string().optional(),
  vendorUnitCommission: z.coerce.number().optional(),
  vendorVariationCode: z.string().optional(),
  vendorMin: z.coerce.number().optional(),
  storeMin: z.coerce.number().optional(),
  template: z.string().optional(),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

export function ServiceForm({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const isNew = serviceId === "new"
  const [loading, setLoading] = React.useState(!isNew)
  const [saving, setSaving] = React.useState(false)

  const form = useForm<ServiceFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      title: "",
      code: "",
      parent: "none",
      provider: "",
      commissionType: "percent",
      unitPrice: 0,
      unitCharge: 0,
      unitCommission: 0,
      unitBonus: 0,
      vendorName: "",
      vendorCode: "",
      vendorUnitCommission: 0,
      vendorVariationCode: "",
      vendorMin: 0,
      storeMin: 0,
      template: "",
    },
  })

  const [parentOptions, setParentOptions] = React.useState<{id: string, title: string}[]>([])

  useEffect(() => {
    loadParentOptions();
    if (!isNew) {
      loadService();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const loadParentOptions = async () => {
    try {
      const res = await httpClient.get(`${URLHelper.services}?perPage=500&order=asc`);
      if (res.status === 'success') {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         setParentOptions(res.data.filter((s: any) => s._id !== serviceId).map((s: any) => ({ id: s._id, title: s.title })));
      }
    } catch (err) {
      console.error("Failed to fetch parents", err);
    }
  }

  const loadService = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get(`${URLHelper.service}/${serviceId}`);
      if (res.status === "success") {
        form.reset({
          title: res.data.title || "",
          code: res.data.code || "",
          parent: res.data.parent || "none",
          provider: res.data.provider || "",
          commissionType: res.data.commissionType || "percent",
          unitPrice: res.data.unitPrice || 0,
          unitCharge: res.data.unitCharge || 0,
          unitCommission: res.data.unitCommission || 0,
          unitBonus: res.data.unitBonus || 0,
          vendorName: res.data.vendorName || "",
          vendorCode: res.data.vendorCode || "",
          vendorUnitCommission: res.data.vendorUnitCommission || 0,
          vendorVariationCode: res.data.vendorVariationCode || "",
          vendorMin: res.data.vendorMin || 0,
          storeMin: res.data.storeMin || 0,
          template: res.data.template || "",
        });
      }
    } catch (err) {
      toast.error("Failed to load service details");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: ServiceFormValues) {
    setSaving(true)
    try {
      const payload = { ...data };
      // @ts-expect-error - Handling 'none' vs null explicitly for mongoose
      if (payload.parent === "none") payload.parent = null;

      const endpoint = isNew ? URLHelper.service : `${URLHelper.service}/${serviceId}`;
      const method = isNew ? httpClient.post : httpClient.put;
      
      const response = await method(endpoint, payload);
      
      if (response.status === "success") {
        toast.success(isNew ? "Service created successfully" : "Service updated successfully")
        if (isNew) {
          router.push("/services")
        }
      } else {
        toast.error(response.msg || "Failed to save service")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading service data...</div>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl">
        <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={() => router.push('/services')}>
                <IconArrowLeft className="mr-2 size-4" /> Back to Services
            </Button>
            <Button type="submit" disabled={saving}>
               <IconDeviceFloppy className="mr-2 size-4" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General configuration</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Commissions</TabsTrigger>
            <TabsTrigger value="vendor">Vendor Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Core identifiers for the service.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. MTN Airtime" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Code</FormLabel>
                          <FormControl>
                            <Input placeholder="vtu-mtn" {...field} />
                          </FormControl>
                          <FormDescription>Unique identifier used by core systems.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Service (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a parent service..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">-- None (Top Level) --</SelectItem>
                              {parentOptions.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>If this is a sub-service, select its parent.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Code</FormLabel>
                          <FormControl>
                            <Input placeholder="mtn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>System Properties</CardTitle>
                      <CardDescription>Internal configuration metadata.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="storeMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Min (Auto Purchase Threshold)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Print Template JSON (Fallback)</FormLabel>
                          <FormControl>
                            <Input placeholder="Default template structure" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pricing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Costing</CardTitle>
                      <CardDescription>How the service is priced.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="commissionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percent">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price (Leave 0 if dynamic)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Charge</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
              </Card>
              
              <Card>
                  <CardHeader>
                      <CardTitle>Commissions</CardTitle>
                      <CardDescription>Discounts and earnings distribution.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <FormField
                      control={form.control}
                      name="unitCommission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Commission (Discount given on purchase)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitBonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referral Bonus (Given to upline)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vendor">
             <Card>
                  <CardHeader>
                      <CardTitle>Vendor Mapping</CardTitle>
                      <CardDescription>External API provider bindings.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="vendorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. v24u" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vendorCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Service Code</FormLabel>
                          <FormControl>
                            <Input placeholder="mtn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vendorVariationCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Variation Code</FormLabel>
                          <FormControl>
                            <Input placeholder="optional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vendorUnitCommission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Unit Commission (Margin)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vendorMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Minimum Purchase Qty</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}

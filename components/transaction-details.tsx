/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconCheck, IconX, IconClock, IconRotateClockwise, IconCopy } from "@tabler/icons-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"

type TransactionData = {
  _id: string
  transactionId: string
  title: string
  description?: string
  amount: number
  commission: number
  charge: number
  totalAmount: number
  previousBalance?: number
  newBalance?: number
  status: 'pending' | 'successful' | 'failed' | 'refunded'
  mode: string
  vendorReference?: string
  metaData?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  userId?: {
    _id: string
    name: string
    uid: string
    telegramNumber: string
    status: string
  }
  serviceId?: {
    _id: string
    title: string
    code: string
    provider: string
    commissionType: string
  }
}

export function TransactionDetails({ transactionId }: { transactionId: string }) {
  const router = useRouter()
  const [data, setData] = React.useState<TransactionData | null>(null)
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    loadTransaction()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId])

  const loadTransaction = async () => {
    try {
      setLoading(true)
      const res = await httpClient.get(`${URLHelper.transaction}/${transactionId}`)
      if (res.status === "success") {
        setData(res.data)
      } else {
        toast.error(res.msg || "Failed to load transaction")
        router.push("/transactions")
      }
    } catch (err) {
      toast.error("An error occurred while fetching the transaction")
      router.push("/transactions")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getStatusBadge = (status: TransactionData['status']) => {
    switch (status) {
      case 'successful':
        return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200"><IconCheck className="w-3 h-3 mr-1" /> Successful</Badge>
      case 'failed':
        return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200"><IconX className="w-3 h-3 mr-1" /> Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200"><IconClock className="w-3 h-3 mr-1" /> Pending</Badge>
      case 'refunded':
        return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200"><IconRotateClockwise className="w-3 h-3 mr-1" /> Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading transaction data...</div>
  if (!data) return <div className="p-8 text-center text-muted-foreground">Transaction not found.</div>

  const rawJson = data.metaData ? JSON.stringify(data.metaData, null, 2) : "No metadata available"

  return (
    <div className="space-y-6 max-w-6xl">
       <div className="flex items-center justify-between">
           <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
              <IconArrowLeft className="mr-2 size-4" /> Back to Transactions
           </Button>
           <div className="flex space-x-2">
               {getStatusBadge(data.status)}
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
               <Card>
                   <CardHeader>
                       <CardTitle>Transaction Summary</CardTitle>
                       <CardDescription>Core details of this transaction.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <p className="text-sm text-muted-foreground">Transaction ID</p>
                               <div className="flex items-center font-medium mt-1">
                                    {data.transactionId}
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => copyToClipboard(data.transactionId)}>
                                        <IconCopy className="h-3 w-3" />
                                    </Button>
                               </div>
                           </div>
                           <div>
                               <p className="text-sm text-muted-foreground">Date & Time</p>
                               <p className="font-medium mt-1">{format(new Date(data.createdAt), 'PPP p')}</p>
                           </div>
                           <div>
                               <p className="text-sm text-muted-foreground">Title</p>
                               <p className="font-medium mt-1">{data.title}</p>
                           </div>
                           <div>
                               <p className="text-sm text-muted-foreground">Payment Mode</p>
                               <p className="font-medium mt-1 capitalize">{data.mode}</p>
                           </div>
                           <div className="col-span-2">
                               <p className="text-sm text-muted-foreground">Description</p>
                               <p className="font-medium mt-1">{data.description || "N/A"}</p>
                           </div>
                       </div>
                   </CardContent>
               </Card>

               <Card>
                   <CardHeader>
                       <CardTitle>Financials</CardTitle>
                       <CardDescription>Monetary breakdown.</CardDescription>
                   </CardHeader>
                   <CardContent>
                       <div className="space-y-3">
                           <div className="flex justify-between items-center text-sm">
                               <span className="text-muted-foreground">Base Amount</span>
                               <span className="font-medium">₦{data.amount?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm text-emerald-600">
                               <span>Commission (Discount)</span>
                               <span>-₦{data.commission?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm text-rose-600">
                               <span>System Charge</span>
                               <span>+₦{data.charge?.toLocaleString()}</span>
                           </div>
                           <Separator />
                           <div className="flex justify-between items-center font-semibold text-lg">
                               <span>Total Amount</span>
                               <span>₦{data.totalAmount?.toLocaleString()}</span>
                           </div>
                       </div>
                       
                       {(data.previousBalance !== undefined && data.newBalance !== undefined) && (
                           <div className="mt-6 pt-6 border-t space-y-3">
                                <h4 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wider">Wallet Balances</h4>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Opening Balance</span>
                                    <span className="font-medium">₦{data.previousBalance?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Closing Balance</span>
                                    <span className="font-medium">₦{data.newBalance?.toLocaleString()}</span>
                                </div>
                           </div>
                       )}
                   </CardContent>
               </Card>

               <Card>
                   <CardHeader>
                       <CardTitle>Metadata & API Response</CardTitle>
                       <CardDescription>Raw logs and responses from providers.</CardDescription>
                   </CardHeader>
                   <CardContent>
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs font-mono">
                            <pre>{rawJson}</pre>
                        </div>
                   </CardContent>
               </Card>
           </div>
           
           <div className="space-y-6">
               <Card>
                   <CardHeader>
                       <CardTitle>User Details</CardTitle>
                       <CardDescription>Who performed this transaction.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       {data.userId ? (
                           <>
                               <div>
                                   <p className="text-sm text-muted-foreground">Name</p>
                                   <p className="font-medium mt-1">{data.userId.name}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">User ID (UID)</p>
                                   <div className="flex items-center font-medium mt-1">
                                        {data.userId.uid}
                                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => copyToClipboard(data.userId!.uid)}>
                                            <IconCopy className="h-3 w-3" />
                                        </Button>
                                   </div>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Telegram Number</p>
                                   <p className="font-medium mt-1">{data.userId.telegramNumber || "N/A"}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Account Status</p>
                                   <Badge variant="outline" className="mt-1 capitalize">{data.userId.status}</Badge>
                               </div>
                           </>
                       ) : (
                           <p className="text-sm text-muted-foreground italic">User information not available or deleted.</p>
                       )}
                   </CardContent>
               </Card>

               <Card>
                   <CardHeader>
                       <CardTitle>Service Details</CardTitle>
                       <CardDescription>The product purchased.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       {data.serviceId ? (
                           <>
                               <div>
                                   <p className="text-sm text-muted-foreground">Service Title</p>
                                   <p className="font-medium mt-1">{data.serviceId.title}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Service Code</p>
                                   <p className="font-medium mt-1 uppercase">{data.serviceId.code}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Provider</p>
                                   <p className="font-medium mt-1">{data.serviceId.provider}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Vendor Reference</p>
                                    <div className="flex items-center font-medium mt-1 break-all">
                                        {data.vendorReference || "N/A"}
                                        {data.vendorReference && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 shrink-0" onClick={() => copyToClipboard(data.vendorReference!)}>
                                                <IconCopy className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                               </div>
                           </>
                       ) : (
                           <p className="text-sm text-muted-foreground italic">Service information not available or deleted.</p>
                       )}
                   </CardContent>
               </Card>
           </div>
       </div>

    </div>
  )
}

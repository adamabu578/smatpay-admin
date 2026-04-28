"use client"

import * as React from "react"
import { IconTrendingDown, IconTrendingUp, IconLoader } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"
import { formatCurrency } from "@/lib/utils"

export function SectionCards() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await httpClient.get(URLHelper.dashboardMetrics);
      if (response.status === 'success') {
        setMetrics(response.data);
      }
    } catch (e) {
      console.error("Error fetching dashboard metrics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8 w-full"><IconLoader className="animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue (30d)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(metrics?.thirtyDayRevenue || 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics?.revenueGrowth >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {metrics?.revenueGrowth >= 0 ? '+' : ''}{metrics?.revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {metrics?.thirtyDayVolume || 0} Successful Transactions
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Customer Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(metrics?.totalCustomerBalance || 0)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Global user wallet aggregation
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Store Pin Value</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(metrics?.totalInventoryValue || 0)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Available store inventory equivalent
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics?.totalUsers?.toLocaleString() || 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {metrics?.activeServices || 0} services actively provisioned
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

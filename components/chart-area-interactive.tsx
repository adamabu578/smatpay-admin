"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"
import { Button } from "./ui/button"
import { cn, formatCurrency } from "@/lib/utils"
import { CalendarIcon, LucideFilter } from "lucide-react"
import { Calendar } from "./ui/calendar";
import { format } from "date-fns"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  earning: {
    label: "Earning",
    color: "var(--primary)",
  },
  transaction: {
    label: "Transaction",
    color: "var(--primary)",
  },
  count: {
    label: "Count",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [data, setData] = React.useState({ chartData: [], totalTransaction: 0, totalEarning: 0, totalCount: 0 });
  const [chartDate, setChartDate] = React.useState<{ start?: Date | undefined, end?: Date | undefined }>({ start: undefined, end: undefined });

  // React.useEffect(() => {
  //   if (!chartDate?.start) {
  //     const start = new Date(), end = new Date();
  //     if (isMobile) {
  //       start.setDate(start.getDay() - 7);
  //     } else {
  //       start.setDate(start.getDay() - 30);
  //     }
  //     setChartDate({ start, end })
  //     getData(format(start, "MM/dd/yyyy"), format(end, "MM/dd/yyyy"));/
  //   }
  // }, [isMobile]);

  React.useEffect(() => {
    getData();
  }, []);

  const getData = async (start?: string, end?: string) => {
    try {
      let url = `${URLHelper.analytics}?data=transactions,earnings`;
      url = start ? `${url}&start=${start}` : url;
      url = end ? `${url}&end=${end}` : url;
      const response = await httpClient.get(url);
      if (response.status == 'success') {
        console.log('response.data :::', response.data);
        setData(response.data);
        setChartDate({ start: new Date(response.data.meta.start), end: new Date(response.data.meta.end) });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
      }
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader className="flex justify-center md:justify-between flex-wrap px-2 pt-0 sm:px-6">
        <CardDescription className="order-2 md:order-1">
          <span className="">
            Total: {formatCurrency(data.totalTransaction)}
          </span>
          {' | '}
          <span className="">
            Earning: {formatCurrency(data.totalEarning)}
          </span>
          {' | '}
          <span className="">
            Count: {data.totalCount}
          </span>
        </CardDescription>
        <CardAction className="order-1 md:order-2 flex">
          <Popover>
            <PopoverTrigger asChild className="mr-2">
              <Badge variant='outline' className={cn(
                "w-[130px] pl-3 text-left font-normal",
                // !field.value && "text-muted-foreground"
              )}>
                {chartDate?.start ? (
                  format(chartDate.start.toDateString(), "PPP")
                ) : (
                  <span>Start</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-80" />
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={chartDate?.start ?? new Date()}
                onSelect={(val) => setChartDate({ ...chartDate, start: val })}
                disabled={(date) =>
                  date > new Date() || date < new Date("2024-06-16")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Label className="mr-2 font-normal">to</Label>

          <Popover>
            <PopoverTrigger asChild className="mr-2">
              <Badge variant='outline' className={cn(
                "w-[130px] pl-3 text-left font-normal",
              )}>
                {chartDate?.end ? (
                  format(chartDate.end.toDateString(), "PPP")
                ) : (
                  <span>End</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-80" />
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={chartDate?.end ?? new Date()}
                onSelect={(val) => setChartDate({ ...chartDate, end: val })}
                disabled={(date) =>
                  date > new Date() || date < new Date("2024-06-16")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button className="h-5.5 w-8" variant='outline' onClick={() => getData(format(chartDate?.start ?? new Date(), "MM/dd/yyyy"), format(chartDate?.end ?? new Date(), "MM/dd/yyyy"))}>
            <LucideFilter />
          </Button>
        </CardAction>
      </CardHeader>
      {/* px-2 pt-4 sm:px-6 sm:pt-6 */}
      <CardContent className="px-2 pt-0 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data.chartData}>
            <defs>
              <linearGradient id="fillEarning" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-earning)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-earning)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTransaction" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-transaction)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-transaction)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="transaction"
              type="natural"
              fill="url(#fillTransaction)"
              stroke="var(--color-transaction)"
              stackId="a"
            />
            <Area
              dataKey="earning"
              type="natural"
              fill="url(#fillEarning)"
              stroke="var(--color-earning)"
              stackId="a"
            />
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillCount)"
              stroke="var(--color-count)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

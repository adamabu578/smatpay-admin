/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconCircleCheckFilled, IconDotsVertical, IconLayoutColumns, IconLoader, IconPlus, IconTrendingUp } from "@tabler/icons-react"
import { ColumnDef, ColumnFiltersState, Row, SortingState, VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { z } from "zod"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"
import { formatCurrency } from "@/lib/utils"

export const schema = z.object({
  id: z.string(),
  reference: z.string().optional(),
  service: z.object({ name: z.string() }),
  recipient: z.string(),
  quantity: z.number(),
  amount: z.object({ unit: z.number(), total: z.number() }),
  commission: z.object({ unit: z.number(), total: z.number() }),
  status: z.string(),
  balance: z.object({ before: z.number().optional(), after: z.number().optional() }).optional(),
  date: z.string(),
  time: z.string(),
  user: z.object({ firstName: z.string(), lastName: z.string() }),
  meta: z.any().optional(),
});

export type TrnxJSONObj = {
  id: string,
  reference?: string,
  service: { name: string },
  recipient: string,
  quantity: number,
  unitPrice: number,
  totalAmount: number,
  status: string,
  balanceBefore?: number,
  balanceAfter?: number,
  date: string,
  time: string,
  user: { firstName: string, lastName: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: any,
};

// Create a separate component for the drag handle
// function DragHandle({ id }: { id: number }) {
//   const { attributes, listeners } = useSortable({
//     id,
//   })

//   return (
//     <Button
//       {...attributes}
//       {...listeners}
//       variant="ghost"
//       size="icon"
//       className="text-muted-foreground size-7 hover:bg-transparent"
//     >
//       <IconGripVertical className="text-muted-foreground size-3" />
//       <span className="sr-only">Drag to reorder</span>
//     </Button>
//   )
// }

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  // {
  //   id: "drag",
  //   header: () => null,
  //   cell: ({ row }) => <DragHandle id={row.original.id} />,
  // },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <div className="">
        {row.original.quantity}
      </div>
    ),
  },
  {
    accessorKey: "commmission",
    header: "Commission",
    cell: ({ row }) => (
      <div className="flex flex-col">
        {formatCurrency(row.original.commission?.total)}
        {row.original.quantity != 1 && <span className="text-[11px]">{`${formatCurrency(row.original.commission?.unit)} x ${row.original.quantity}`}</span>}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="flex flex-col">
        {formatCurrency(row.original.amount?.total)}
        {row.original.quantity != 1 && <span className="text-[11px]">{`${formatCurrency(row.original.amount?.unit - row.original.commission?.unit)} x ${row.original.quantity}`}</span>}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "pending" && <IconLoader />}
        {row.original.status === "failed" && <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400" />}
        {row.original.status === "delivered" && <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "balance",
    header: () => <div className="w-full">Balance</div>,
    cell: ({ row }) => (
      <div>
        <div className="">
          {row.original.balance?.after !== undefined && !isNaN(row.original.balance.after) && (
             <span title="Balance after">{formatCurrency(row.original.balance.after)}</span>
          )}
        </div>
        <div>
          {row.original.balance?.before !== undefined && !isNaN(row.original.balance.before) && (
             <span className="text-[12px]" title="Balance before">{formatCurrency(row.original.balance.before)}</span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "time",
    header: () => <div className="w-full">Time</div>,
    cell: ({ row }) => (
      // <div>
      //   <div className="">
      <span className="text-[12px]">{`${row.original.date} ${row.original.time}`}</span>
      //   </div>
      //   <div>
      //     <span className="text-[12px]">{row.original.time}</span>
      //   </div>
      // </div>
    ),
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      // const isAssigned = row.original?.user?.firstName //!== "Assign reviewer"

      // if (isAssigned) {
      //   return row.original.user?.firstName
      // }

      return (
        <span className="text-[13px]">{`${row.original.user?.firstName} ${row.original.user?.lastName}`}</span>
        // <>
        //   <Label htmlFor={`${row.original.id}-user`} className="sr-only">
        //     Customer
        //   </Label>
        //   <Select>
        //     <SelectTrigger
        //       className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
        //       size="sm"
        //       id={`${row.original.id}-user`}
        //     >
        //       <SelectValue placeholder="Assign reviewer" />
        //     </SelectTrigger>
        //     <SelectContent align="end">
        //       <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
        //       <SelectItem value="Jamik Tashpulatov">
        //         Jamik Tashpulatov
        //       </SelectItem>
        //     </SelectContent>
        //   </Select>
        // </>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {row.original.status === 'delivered' && (
             <>
               <DropdownMenuItem 
                 onClick={() => {
                   const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE}${URLHelper.transactions}`);
                   url.searchParams.append('id', row.original.reference || row.original.id);
                   url.searchParams.append('field', 'pin');
                   url.searchParams.append('nameOnCard', row.original.meta?.name || row.original.service?.name || 'Smatpay');
                   url.searchParams.append('format', 'pdf');
                   url.searchParams.append('resend', 'true');
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   httpClient.get(url.toString()).then((res: any) => {
                       if (res.status === 'success') {
                           toast.success(res.msg || "Successfully resent to Telegram");
                       } else {
                           toast.error(res.msg || "Failed to resend");
                       }
                   }).catch(() => toast.error("Network or server error"));
                 }}
               >
                 Resend to Telegram
               </DropdownMenuItem>
               <DropdownMenuItem 
                 onClick={() => {
                   const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE}${URLHelper.transactions}`);
                   url.searchParams.append('id', row.original.reference || row.original.id);
                   url.searchParams.append('field', 'pin');
                   url.searchParams.append('nameOnCard', row.original.meta?.name || row.original.service?.name || 'Smatpay');
                   url.searchParams.append('format', 'pdf');
                   window.open(url.toString(), '_blank');
                 }}
               >
                 Download PIN
               </DropdownMenuItem>
             </>
          )}
          <DropdownMenuItem onClick={() => window.location.href = `/transactions/${row.original.id}`}>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function TransactionTable() {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [tab, setTab] = React.useState("all");
  const [metadata, setMetadata] = React.useState<{ nextPage?: number, page: number, perPage: number, total: number, totalPage: number }>({ page: 1, perPage: 10, total: 0, totalPage: 0 });
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [search, setSearch] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination,] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  React.useEffect(() => {
    const handler = setTimeout(() => {
      getTransactions();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata?.page, metadata?.perPage, tab, search, startDate, endDate]);

  const getTransactions = async () => {
    try {
      let url = `${URLHelper.transactions}?page=${metadata?.page}&perPage=${metadata?.perPage}&order=desc`;
      if (tab != 'all') {
        url += `&status=${tab}`
      }
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      const response = await httpClient.get(url);
      if (response.status == 'success') {
        // console.log('response.data :::', response.data);
        // setUsers(response.data);
        setMetadata(response.metadata);
        setData(response.data.map((i: TrnxJSONObj) => ({
          id: i.id,
          reference: i.reference,
          service: i.service,
          recipient: i.recipient,
          quantity: i.quantity,
          amount: { unit: i.unitPrice, total: i.totalAmount },
          commission: { unit: i.unitPrice - (i.totalAmount / i.quantity), total: (i.unitPrice - (i.totalAmount / i.quantity)) * i.quantity },
          status: i.status,
          balance: { before: i.balanceBefore, after: i.balanceAfter },
          date: i.date,
          time: i.time,
          user: { firstName: i.user?.firstName, lastName: i.user?.lastName },
          meta: i.meta,
        })));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
      }
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      // defaultValue="all"
      value={tab}
      className="w-full flex-col justify-start gap-6"
      onValueChange={setTab}
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="all">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="delivered">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="delivered">
            Success
            {/* <Badge variant="secondary">3</Badge> */}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {/* <Badge variant="secondary">2</Badge> */}
          </TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Input 
            placeholder="Search reference or recipient..." 
            value={search} 
            onChange={(e) => {
               setSearch(e.target.value);
               setMetadata(prev => ({ ...prev, page: 1 }));
            }} 
            className="h-9 w-40 lg:w-56 bg-background" 
          />
          <div className="hidden sm:flex items-center gap-1">
            <Input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setMetadata(prev => ({ ...prev, page: 1 })); }} className="h-9 w-fit bg-background text-muted-foreground" />
            <span className="text-muted-foreground">-</span>
            <Input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setMetadata(prev => ({ ...prev, page: 1 })); }} className="h-9 w-fit bg-background text-muted-foreground" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value={tab}
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
            {/* {metadata?.perPage} row(s) selected. */}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            {/* <div className="hidden items-center gap-2 lg:flex"> */}
            <div className="items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                // value={`${table.getState().pagination.pageSize}`}
                value={`${metadata.perPage}`}
                onValueChange={(value) => {
                  // table.setPageSize(Number(value))
                  setMetadata({ ...metadata, page: 1, perPage: Number(value) });
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    // placeholder={table.getState().pagination.pageSize}
                    placeholder={metadata?.perPage}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize}
                      value={`${pageSize}`}
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page{" "}
              {/* {table.getState().pagination.pageIndex + 1}  */}
              {metadata.page}
              {" "}of{" "}
              {/* {table.getPageCount()} */}
              {metadata.totalPage}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                // onClick={() => table.setPageIndex(0)}
                onClick={() => setMetadata({ ...metadata, page: 0 })}
                // disabled={!table.getCanPreviousPage()}
                disabled={metadata.page < 2}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                // onClick={() => table.previousPage()}
                onClick={() => setMetadata({ ...metadata, page: metadata.page - 1 })}
                // disabled={!table.getCanPreviousPage()}
                disabled={metadata.page < 2}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                // onClick={() => table.nextPage()}
                onClick={() => setMetadata({ ...metadata, page: metadata.page + 1 })}
                // disabled={!table.getCanNextPage()}
                disabled={!metadata.nextPage}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                // onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                onClick={() => setMetadata({ ...metadata, page: metadata.totalPage })}
                // disabled={!table.getCanNextPage()}
                disabled={!metadata.nextPage}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>

          </div>
        </div>
      </TabsContent>
      {/* <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent> */}
    </Tabs>
  )
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <div className="flex flex-col">
          {/* <Button variant="link" className="text-foreground w-fit m-0 p-0 text-left" style={{border:'1px solid red'}}>
            {item.service}
          </Button> */}
          <span className="text-foreground w-fit font-semibold text-left">
            {item.service?.name}
          </span>
          {item?.recipient != 'N/A' && item?.recipient != 'wallet' && <span className="text-[12px] m-0 p-0" title="Balance before">{item.recipient}</span>}
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.service?.name}</DrawerTitle>
          <DrawerDescription>
            Showing total visitors for the last 6 months
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              {/* <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer> */}
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="service">Service</Label>
              <Input id="service" defaultValue={item.service?.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                {/* <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Table of Contents">
                      Table of Contents
                    </SelectItem>
                    <SelectItem value="Executive Summary">
                      Executive Summary
                    </SelectItem>
                    <SelectItem value="Technical Approach">
                      Technical Approach
                    </SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Capabilities">Capabilities</SelectItem>
                    <SelectItem value="Focus Documents">
                      Focus Documents
                    </SelectItem>
                    <SelectItem value="Narrative">Narrative</SelectItem>
                    <SelectItem value="Cover Page">Cover Page</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Target</Label>
                <Input id="target" defaultValue={'item.target'} />
              </div>
              {/* <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Limit</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div> */}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="customer">Customer</Label>
              {/* <Select defaultValue={item.user}>
                <SelectTrigger id="user" className="w-full">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                  <SelectItem value="Jamik Tashpulatov">
                    Jamik Tashpulatov
                  </SelectItem>
                  <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

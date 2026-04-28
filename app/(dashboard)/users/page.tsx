/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconCircleCheckFilled, IconDotsVertical, IconLayoutColumns, IconLoader, IconPlus, IconTrendingUp, IconBrandTelegram } from "@tabler/icons-react"
import { ColumnDef, ColumnFiltersState, Row, SortingState, VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import Link from "next/link"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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

// export const userSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   type: z.string(),
//   status: z.string(),
//   target: z.string(),
//   balance: z.number(),
//   reviewer: z.string(),
// });
export type User = {
  id: string,
  name: string,
  phone: string,
  telegramNumber: string,
  email: string,
  isEmailVerified: string,
  status: string,
  balance: number,
  createdAt: string,
};

export type UserJSONObj = {
  id?: string,
  _id?: string,
  firstName: string,
  lastName: string,
  phone: string,
  telegramNumber: string,
  email: string,
  isEmailVerified: string,
  status: string,
  balance: number,
  createdAt: string,
};

// Create a separate component for the drag handle
// function DragHandle({ id }: { id: string }) {
//   const { attributes, listeners } = useSortable({ id });

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

function DraggableRow({ row }: { row: Row<User> }) {
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

// function UserTable({ data: initialData }: { data: z.infer<typeof userSchema>[] }) {
function UserTable() {
  const [data, setData] = React.useState<User[]>([]);
  const [tab, setTab] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [metadata, setMetadata] = React.useState<{ nextPage?: number, page: number, perPage: number, total: number, totalPage: number }>({ page: 1, perPage: 10, total: 0, totalPage: 0 });
  const [rowSelection, setRowSelection] = React.useState({})
  const [userToTopup, setUserToTopup] = React.useState<{ id: string, name: string } | null>(null);
  const [isProgress, setIsProgress] = React.useState(false);
  const [amount, setAmount] = React.useState(0);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, ] = React.useState({ pageIndex: 0, pageSize: 10 });
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  React.useEffect(() => {
    const handler = setTimeout(() => {
      getUsers();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata?.page, metadata?.perPage, tab, search]);

  const getUsers = async () => {
    try {
      let url = `${URLHelper.users}?page=${metadata?.page}&perPage=${metadata?.perPage}&order=desc`;
      if (tab != 'all') {
        url += `&status=${tab}`
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await httpClient.get(url);
      if (response.status == 'success') {
        console.log('response.data :::', response);
        // setUsers(response.data);
        // setMeta(response.metadata);
        setMetadata(response.metadata);
        setData(response.data.map((i: UserJSONObj) => ({
          id: i.id || i._id || "",
          name: `${i.firstName} ${i.lastName}`,
          phone: i.phone,
          telegramNumber: i.telegramNumber,
          email: i.email,
          isEmailVerified: i.isEmailVerified,
          status: i.status || 'active',
          balance: i.balance,
          createdAt: i.createdAt,
        })));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
      }
    }
  };

  const onTopup = async () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: `Processing...`,
      success: "Done",
      error: "Error",
    });
    if (amount.toString() == '') return;

    try {
      setIsProgress(true);
      const response = await httpClient.post(`${URLHelper.topup}`, {
        id: userToTopup?.id,
        amount,
      });
      console.log(response);
      if (response.status == 'success') {
        getUsers();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching users:", error.message);
      }
    }
    setIsProgress(false);
    setUserToTopup(null);
    setAmount(0);
  }

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link 
           href={`/users/${row.original.id}`}
           className="text-foreground w-fit text-left hover:underline cursor-pointer font-medium"
        >
          {row.original.name}
        </Link>
      ),enableHiding: false,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex">
          {row.original?.telegramNumber ? row.original.telegramNumber : row.original.phone}
          {row.original?.telegramNumber && <Badge variant="outline" className="p-1 ml-1">
            <IconBrandTelegram />
          </Badge>}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex">
          {row.original.email}
          {row.original?.isEmailVerified == '1' && <IconCircleCheckFilled title="Verified" className="fill-gray-300 dark:fill-gray-300" size={15} />}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5 capitalize">
          {row.original.status === "active" ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
          ) : (
            <IconLoader />
          )}
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "balance",
      header: () => <div className="w-full">Balance</div>, //text-right
      cell: ({ row }) => (
        <div>{formatCurrency(row.original.balance)}</div>
        // <form
        //   onSubmit={(e) => {
        //     e.preventDefault()
        //     toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
        //       loading: `Saving ${row.original.name}`,
        //       success: "Done",
        //       error: "Error",
        //     })
        //   }}
        // >
        //   <Label htmlFor={`${row.original.id}-balance`} className="sr-only">
        //     Balance
        //   </Label>
        //   {/* <Input
        //     className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 border-transparent bg-transparent shadow-none focus-visible:border dark:bg-transparent"
        //     defaultValue={row.original.balance}
        //     id={`${row.original.id}-balance`}
        //   /> */}
        //   {/* <div className="flex items-center"> */}
        //     <Input
        //       className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 border-transparent bg-transparent shadow-none focus-visible:border dark:bg-transparent"
        //       defaultValue={row.original.balance}
        //       id={`${row.original.id}-balance`}
        //     />
        //     {/* <svg className="h-4 w-4" aria-hidden="true" fill="currentColor">
        //       <path fillRule="evenodd" d="M0 0 h24 v24 H0 z" clipRule="evenodd" />
        //     </svg>
        //   </div> */}
        // </form>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <span className="text-[12px]">{row.original.createdAt}</span>,
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
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onSelect={() => setUserToTopup({ id: row.original.id, name: row.original.name })}>Topup</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/users/${row.original.id}`} className="cursor-pointer">View / Edit Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuItem>Favorite</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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
  });

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
    <>
      <Dialog open={!!userToTopup} onOpenChange={() => setUserToTopup(null)}>
        <DialogContent className="max-w-xs sm:max-w-xs" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="mb-2">Topup</DialogTitle>
            <DialogDescription>
              Enter the amount
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            {/* <Label htmlFor="link" className="sr-only">
              Link
            </Label> */}
            <Input
              id="amount"
              placeholder="0.00"
              type="number"
              onChange={i => setAmount(parseFloat(i.target.value))}
            />
          </div>

          <DialogFooter className="flex flex-row sm:justify-start items-center space-x-2">
            <Button disabled={isProgress} onClick={onTopup}>
              {isProgress ? 'Wait...' : 'Topup'}
              {/* {isProgress ? <CircularProgress size={20} thickness={6} className="mt-0.5 mb-0.5" /> : <span className="block p-0.5">Topup</span>} */}
            </Button>
            <div className="text-sm">{userToTopup?.name}</div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="virtual-account">Virtual Account</SelectItem>
              {/* <SelectItem value="focus-documents">Focus Documents</SelectItem> */}
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="telegram">
              Telegram
              {/* <Badge variant="secondary">3</Badge> */}
            </TabsTrigger>
            <TabsTrigger value="virtual-account">
              Virtual Account
              {/* <Badge variant="secondary">2</Badge> */}
            </TabsTrigger>
            {/* <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger> */}
          </TabsList>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search users by name, email, or phone..." 
              value={search} 
              onChange={(e) => {
                 setSearch(e.target.value);
                 setMetadata(prev => ({ ...prev, page: 1 }));
              }} 
              className="h-9 w-40 lg:w-64 bg-background" 
            />
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
          {/* <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div> */}
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
    </>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig



export default function Page() {
  return (
    <UserTable />
  )
}

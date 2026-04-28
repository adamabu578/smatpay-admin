/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDotsVertical, IconLayoutColumns, IconLoader, IconPlus } from "@tabler/icons-react"
import { ColumnDef, ColumnFiltersState, Row, SortingState, VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { z } from "zod"
import { toast } from "sonner"
import Link from "next/link"

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
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"
import { formatCurrency } from "@/lib/utils"

export const schema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string(),
  provider: z.string().optional(),
  unitPrice: z.number().optional(),
  unitCharge: z.number().optional(),
  commissionType: z.string().optional(),
  unitCommission: z.number().optional(),
  unitBonus: z.number().optional(),
  vendorName: z.string().optional(),
  vendorUnitCommission: z.number().optional(),
  parent: z.string().optional(),
});

export type ServiceJSONObj = {
  _id: string,
  title: string,
  code: string,
  provider?: string,
  unitPrice?: number,
  unitCharge?: number,
  commissionType?: string,
  unitCommission?: number,
  unitBonus?: number,
  vendorName?: string,
  vendorUnitCommission?: number,
  parent?: string,
};

const columns: ColumnDef<z.infer<typeof schema>>[] = [
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link href={`/services/${row.original.id}`} className="text-foreground font-semibold hover:underline">
              {row.original.title}
            </Link>
            <Badge variant={row.original.parent ? 'secondary' : 'default'} className="text-[10px] px-1.5 py-0 h-4">
              {row.original.parent ? 'Child' : 'Parent'}
            </Badge>
          </div>
          <span className="text-muted-foreground text-xs">{row.original.code}</span>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => (
      <div>
        <Badge variant="outline">{row.original.provider || 'N/A'}</Badge>
      </div>
    ),
  },
  {
    accessorKey: "pricing",
    header: "Base Pricing",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm">
          Price: <span className="font-medium">{row.original.unitPrice ? formatCurrency(row.original.unitPrice) : 'Dynamic'}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Charge: {row.original.unitCharge != null && !isNaN(row.original.unitCharge) ? formatCurrency(row.original.unitCharge) : 'N/A'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "commissions",
    header: "User Commissions",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm">
          Discount: <span className="font-medium text-emerald-600">{row.original.unitCommission != null ? formatCurrency(row.original.unitCommission) : 'N/A'}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Bonus: {row.original.unitBonus != null ? formatCurrency(row.original.unitBonus) : 'N/A'}
        </span>
        <span className="text-[10px] uppercase text-slate-500 tracking-wider">
           Type: {row.original.commissionType || 'N/A'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Vendor & Margin",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          {row.original.vendorName || <span className="italic text-muted-foreground font-normal">No Vendor</span>}
        </span>
        {row.original.vendorName && row.original.vendorUnitCommission != null && (
          <span className="text-xs text-emerald-600">
            Margin: {formatCurrency(row.original.vendorUnitCommission)}
          </span>
        )}
      </div>
    ),
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
          <DropdownMenuItem asChild>
            <Link href={`/services/${row.original.id}`}>Manage configuration</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Disable</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function ServiceTable() {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [metadata, setMetadata] = React.useState<{ nextPage?: number, page: number, perPage: number, total: number, totalPage: number }>({ page: 1, perPage: 10, total: 0, totalPage: 0 });
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [search, setSearch] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  React.useEffect(() => {
    const handler = setTimeout(() => {
      getServices();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata?.page, metadata?.perPage, search]);

  const getServices = async () => {
    try {
      let url = `${URLHelper.services}?page=${metadata?.page}&perPage=${metadata?.perPage}&order=asc`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await httpClient.get(url);
      if (response.status == 'success') {
        setMetadata(response.meta || { page: 1, perPage: 10, total: 0, totalPage: 1 });
        setData(response.data.map((i: ServiceJSONObj) => ({
          id: i._id,
          title: i.title,
          code: i.code,
          provider: i.provider,
          unitPrice: i.unitPrice,
          unitCharge: i.unitCharge,
          commissionType: i.commissionType,
          unitCommission: i.unitCommission,
          unitBonus: i.unitBonus,
          vendorName: i.vendorName,
          vendorUnitCommission: i.vendorUnitCommission,
          parent: i.parent,
        })));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
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
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="w-full flex-col justify-start gap-6 relative flex gap-4 overflow-auto px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <Input 
          placeholder="Search title, code or provider..." 
          value={search} 
          onChange={(e) => {
             setSearch(e.target.value);
             setMetadata(prev => ({ ...prev, page: 1 }));
          }} 
          className="h-9 w-40 lg:w-64 bg-background" 
        />
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
          <Button variant="default" size="sm" asChild>
            <Link href="/services/new">
                <IconPlus className="size-4" />
                <span className="hidden lg:inline ml-1">Create Service</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border">
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
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No services found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between pb-8">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${metadata.perPage}`}
              onValueChange={(value) => {
                setMetadata({ ...metadata, page: 1, perPage: Number(value) });
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={metadata?.perPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {metadata.page} of {metadata.totalPage || 1}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setMetadata({ ...metadata, page: 1 })}
              disabled={metadata.page < 2}
            >
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setMetadata({ ...metadata, page: metadata.page - 1 })}
              disabled={metadata.page < 2}
            >
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setMetadata({ ...metadata, page: metadata.page + 1 })}
              disabled={!metadata.nextPage}
            >
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => setMetadata({ ...metadata, page: metadata.totalPage })}
              disabled={!metadata.nextPage}
            >
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

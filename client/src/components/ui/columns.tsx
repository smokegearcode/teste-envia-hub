import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Product, Shipment } from "@shared/schema";
import { format } from "date-fns";

export const columns: ColumnDef<Shipment>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={
            status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : status === "IN_PROGRESS"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "trackingCode",
    header: "Tracking Code",
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => {
      const amount = row.getValue("totalCost") as number;
      return `$${amount.toFixed(2)}`;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return format(new Date(date), "PPp");
    },
  },
];

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "ncm",
    header: "NCM",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const amount = row.getValue("value") as number;
      return `$${amount.toFixed(2)}`;
    },
  },
];

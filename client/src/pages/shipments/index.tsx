import DashboardLayout from "@/components/layouts/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/ui/columns";
import { useQuery } from "@tanstack/react-query";
import { Shipment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function ShipmentsPage() {
  const { data: shipments, isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
            <p className="text-muted-foreground">
              View and manage your shipments
            </p>
          </div>
          <Link href="/shipments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </Link>
        </div>

        {shipments && <DataTable columns={columns} data={shipments} />}
      </div>
    </DashboardLayout>
  );
}

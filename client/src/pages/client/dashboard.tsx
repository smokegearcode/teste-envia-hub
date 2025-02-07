import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Product, Shipment, Client } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { DataTable } from "@/components/ui/data-table";
import { columns, productColumns } from "@/components/ui/columns";
import { Button } from "@/components/ui/button";
import { Plus, Package, Wallet2, Box } from "lucide-react";
import { Link } from "wouter";

export default function ClientDashboard() {
  const { user } = useAuth();

  const { data: client } = useQuery<Client>({
    queryKey: ["/api/clients", user?.id],
    enabled: !!user,
  });

  const { data: shipments } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
    enabled: !!user,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/suite-products"],
    enabled: !!user,
  });

  const stats = [
    {
      title: "Suite ID",
      value: client?.suiteId || "-",
      icon: Box,
      description: "Your personal suite identifier",
    },
    {
      title: "Active Shipments",
      value: shipments?.filter(s => s.status !== "COMPLETED").length || 0,
      icon: Package,
      description: "Currently processing shipments",
    },
    {
      title: "Wallet Balance",
      value: client?.walletBalance ? `$${Number(client.walletBalance).toFixed(2)}` : "$0.00",
      icon: Wallet2,
      description: "Available funds for shipping",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {client?.firstName} {client?.lastName}
            </p>
          </div>
          <Link href="/shipments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {shipments && shipments.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={shipments.slice(0, 5)}
                />
              ) : (
                <p className="text-muted-foreground">No shipments found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products in Suite</CardTitle>
            </CardHeader>
            <CardContent>
              {products && products.length > 0 ? (
                <DataTable
                  columns={productColumns}
                  data={products.slice(0, 5)}
                />
              ) : (
                <p className="text-muted-foreground">No products in suite</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
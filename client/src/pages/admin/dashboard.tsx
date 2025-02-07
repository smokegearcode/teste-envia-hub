import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Product, Client, Shipment } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/ui/columns";
import { Loader2, Users, Package, ShoppingBag } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: shipments, isLoading: shipmentsLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  });

  const isLoading = clientsLoading || productsLoading || shipmentsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Total Clients",
      value: clients?.length || 0,
      icon: Users,
    },
    {
      title: "Active Shipments",
      value: shipments?.filter(s => s.status !== "COMPLETED").length || 0,
      icon: Package,
    },
    {
      title: "Products",
      value: products?.length || 0,
      icon: ShoppingBag,
    },
  ];

  const chartData = {
    labels: ['Open', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Shipments by Status',
        data: [
          shipments?.filter(s => s.status === "OPEN").length || 0,
          shipments?.filter(s => s.status === "IN_PROGRESS").length || 0,
          shipments?.filter(s => s.status === "COMPLETED").length || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your package forwarding operations
          </p>
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
              <CardTitle>Shipment Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
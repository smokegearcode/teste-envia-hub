import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertShipmentSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function NewShipmentPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: carriers } = useQuery({
    queryKey: ["/api/carriers"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/suite-products"],
  });

  const { data: client } = useQuery({
    queryKey: ["/api/clients", user?.id],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(insertShipmentSchema),
    defaultValues: {
      clientId: client?.id,
      carrierId: undefined,
      status: "OPEN",
      totalCost: 0,
    },
  });

  const createShipmentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/shipments", {
        ...data,
        products: selectedProducts,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Shipment created",
        description: "Your shipment has been created successfully.",
      });
      setLocation("/shipments");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Shipment</h1>
          <p className="text-muted-foreground">
            Create a new shipment with your selected products
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>
                Choose your carrier and select products for shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createShipmentMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="carrierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carrier</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a carrier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {carriers?.map((carrier) => (
                              <SelectItem
                                key={carrier.id}
                                value={carrier.id.toString()}
                              >
                                {carrier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Products</FormLabel>
                    <div className="grid gap-2">
                      {products?.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            value={product.id}
                            checked={selectedProducts.includes(
                              product.id.toString()
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([
                                  ...selectedProducts,
                                  e.target.value,
                                ]);
                              } else {
                                setSelectedProducts(
                                  selectedProducts.filter(
                                    (id) => id !== e.target.value
                                  )
                                );
                              }
                            }}
                          />
                          <span>
                            {product.name} - ${product.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createShipmentMutation.isPending}
                  >
                    {createShipmentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Shipment
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

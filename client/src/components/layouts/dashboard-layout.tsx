import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingBag,
  User,
  Wallet,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      admin: false,
    },
    {
      name: "Products",
      href: "/products",
      icon: ShoppingBag,
      admin: true,
    },
    {
      name: "Shipments",
      href: "/shipments",
      icon: Package,
      admin: false,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      admin: false,
    },
    {
      name: "Wallet",
      href: "/wallet",
      icon: Wallet,
      admin: false,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      admin: true,
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.admin || user?.role === "ADMIN"
  );

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-sidebar border-r">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold">Package Manager</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md
                        ${
                          location === item.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }
                      `}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-sidebar-border p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {user?.username}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    {user?.role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

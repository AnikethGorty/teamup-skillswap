import { Outlet } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  User,
  Target,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Friends", href: "/friends", icon: Users },
  { title: "Teams", href: "/teams", icon: Target },
  { title: "Events", href: "/events", icon: Calendar },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Profile", href: "/profile", icon: User },
];

export function Layout() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar className="border-r border-border">
            <SidebarHeader className="border-b border-border p-6">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SkillSwap
              </h1>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          location.pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              <SidebarSeparator className="my-4" />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={signOut}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="flex-1 flex flex-col">
            <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center px-6 gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.email}
                  </span>
                  <Button variant="ghost" size="sm">
                    Settings
                  </Button>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
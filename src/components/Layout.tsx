import * as React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  CreditCard,
  FileText,
  Package,
  Tag,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Receipt,
} from "lucide-react";
import { useUiStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { useToastStore } from "../api/toastStore";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import StatusBar from "./StatusBar";
import LoginModal from "./LoginModal";

const navItems = [
  { to: "/pos", label: "Caisse", icon: CreditCard },
  { to: "/sales", label: "Ventes", icon: FileText },
  { to: "/stock", label: "Stock", icon: Package },
  { to: "/articles", label: "Articles", icon: Tag },
  { to: "/partners", label: "Tiers", icon: Users },
  { to: "/reports", label: "États", icon: BarChart3 },
  { to: "/settings", label: "Config", icon: SettingsIcon },
];

function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shrink-0">
          FM
        </div>
        {!isCollapsed && (
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-semibold text-sm truncate">FIRST MAG</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">POS</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <NavLink to={item.to} end>
                  {({ isActive }) => (
                    <>
                      <item.icon />
                      <span>{item.label}</span>
                      {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

function UserMenu() {
  const darkMode = useUiStore((s) => s.darkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);
  const setLoginOpen = useUiStore((s) => s.setLoginOpen);
  const setUser = useSessionStore((s) => s.setUser);
  const userName = useSessionStore((s) => s.currentUserName);
  const addToast = useToastStore((s) => s.addToast);
  const initials = (userName || "?").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 h-10 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left min-w-0 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <span className="text-sm font-medium truncate w-full">{userName}</span>
            <span className="text-[10px] text-muted-foreground">Caissier</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLoginOpen(true)}>
          <UserIcon className="size-4" />
          Changer d'utilisateur
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleDarkMode}>
          {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {darkMode ? "Mode clair" : "Mode sombre"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setUser("", "Invité");
            setLoginOpen(true);
            addToast("Déconnecté", "info");
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderBar() {
  const registerOpen = useSessionStore((s) => s.registerOpen);
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-2">
        <Receipt className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Caisse</span>
        {registerOpen ? (
          <Badge variant="success" className="h-5">Ouverte</Badge>
        ) : (
          <Badge variant="destructive" className="h-5">Fermée</Badge>
        )}
      </div>
      <div className="flex-1" />
      <DateDisplay />
    </header>
  );
}

function DateDisplay() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-xs text-muted-foreground font-mono hidden sm:block">
      {now.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
    </div>
  );
}

export default function Layout() {
  const darkMode = useUiStore((s) => s.darkMode);
  return (
    <div className={cn("flex h-full w-full overflow-hidden", darkMode && "dark")}>
      <SidebarProvider>
        <LoginModal />
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 h-full">
          <HeaderBar />
          <main className="flex-1 overflow-auto bg-muted/30 animate-fade-in p-4 md:p-6">
            <Outlet />
          </main>
          <StatusBar />
        </div>
      </SidebarProvider>
    </div>
  );
}

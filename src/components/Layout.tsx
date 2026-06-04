import * as React from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Receipt,
  PanelTop,
  PanelLeft,
  Loader2,
} from "lucide-react";
import { useUiStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { useToastStore } from "../api/toastStore";
import {
  getDashboardStats,
  getOpenSession,
  listArticleFamilies,
  listCashiers,
  listDepots,
  listDocumentSeries,
  listRegisters,
} from "../api";
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
import { keyboardRouteMap, legacyNavigationMap } from "@/config/legacyNavigation";

const flatNavItems = legacyNavigationMap.flatMap((group) => group.items);

function settleWithTimeout<T>(promise: Promise<T>, timeoutMs = 6000): Promise<void> {
  return Promise.race<void>([
    promise.then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

function AppSidebar() {
  const { state } = useSidebar();
  const permissions = useSessionStore((s) => s.currentUserPermissions);
  const isCollapsed = state === "collapsed";
  const visibleGroups = React.useMemo(
    () =>
      legacyNavigationMap
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            permissions.includes("*") || permissions.includes(item.permission),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [permissions],
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          FM
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold">FIRST MAG</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarMenu key={group.id}>
            {!isCollapsed && (
              <li className="px-2 pb-1 pt-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                {group.label}
              </li>
            )}
            {group.items.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <NavLink to={item.to} end>
                    {({ isActive }) => (
                      <>
                        <item.icon />
                        <span className="truncate">{item.label}</span>
                        {!isCollapsed && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {item.shortcuts[0]}
                          </span>
                        )}
                        {isActive && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />}
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ))}
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
  const userRole = useSessionStore((s) => s.currentUserRole);
  const addToast = useToastStore((s) => s.addToast);
  const initials = (userName || "?").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-full justify-start gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-left group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <span className="block w-full truncate text-sm font-medium">{userName}</span>
            <span className="text-[10px] capitalize text-muted-foreground">{userRole}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLoginOpen(true)}>
          <UserIcon className="size-4" />
          Changer d utilisateur
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleDarkMode}>
          {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {darkMode ? "Mode clair" : "Mode sombre"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setUser("", "Invite", "guest", []);
            setLoginOpen(true);
            addToast("Deconnecte", "info");
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Deconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderBar() {
  const registerOpen = useSessionStore((s) => s.registerOpen);
  const navigationMode = useUiStore((s) => s.navigationMode);
  const toggleNavigationMode = useUiStore((s) => s.toggleNavigationMode);
  const permissions = useSessionStore((s) => s.currentUserPermissions);
  const location = useLocation();
  const activeItem = React.useMemo(
    () =>
      flatNavItems
        .filter((item) => permissions.includes("*") || permissions.includes(item.permission))
        .find((item) => item.to === location.pathname),
    [location.pathname, permissions],
  );

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
      {navigationMode === "side" && (
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
        </>
      )}
      <div className="flex min-w-0 items-center gap-2">
        <Receipt className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{activeItem?.label ?? "FIRST MAG"}</span>
        {registerOpen ? (
          <Badge variant="success" className="h-5">
            Ouverte
          </Badge>
        ) : (
          <Badge variant="destructive" className="h-5">
            Fermee
          </Badge>
        )}
      </div>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleNavigationMode}
        className="shrink-0"
        aria-label={navigationMode === "side" ? "Passer au menu haut" : "Passer au menu lateral"}
        title={navigationMode === "side" ? "Menu haut" : "Menu lateral"}
      >
        {navigationMode === "side" ? <PanelTop className="size-4" /> : <PanelLeft className="size-4" />}
      </Button>
      <DateDisplay />
    </header>
  );
}

function TopNavigationBar() {
  const permissions = useSessionStore((s) => s.currentUserPermissions);
  const visibleItems = React.useMemo(
    () =>
      flatNavItems.filter(
        (item) => permissions.includes("*") || permissions.includes(item.permission),
      ),
    [permissions],
  );
  return (
    <nav className="border-b bg-background px-3 py-2">
      <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto">
        {visibleItems.map((item) => (
          <NavLink key={item.to} to={item.to} end>
            {({ isActive }) => (
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="h-8 min-w-[170px] shrink-0 justify-start gap-2"
              >
                <item.icon className="size-4" />
                <span className="truncate">{item.label}</span>
              </Button>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function DateDisplay() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden font-mono text-xs text-muted-foreground sm:block">
      {now.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
    </div>
  );
}

export default function Layout() {
  const darkMode = useUiStore((s) => s.darkMode);
  const density = useUiStore((s) => s.density);
  const keyboardProfile = useUiStore((s) => s.keyboardProfile);
  const scannerFirstFocus = useUiStore((s) => s.scannerFirstFocus);
  const navigationMode = useUiStore((s) => s.navigationMode);
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const permissions = useSessionStore((s) => s.currentUserPermissions);
  const appHydrating = useSessionStore((s) => s.appHydrating);
  const setAppHydrating = useSessionStore((s) => s.setAppHydrating);
  const navigate = useNavigate();
  const hydratedForUserRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!keyboardProfile) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      const targetTag = target?.tagName?.toLowerCase();
      const isTypingField = targetTag === "input" || targetTag === "textarea";
      const key = event.key.toUpperCase();

      if (!isTypingField && keyboardRouteMap[key]) {
        const targetRoute = keyboardRouteMap[key];
        const targetItem = flatNavItems.find((item) => item.to === targetRoute);
        if (
          targetItem &&
          (permissions.includes("*") || permissions.includes(targetItem.permission))
        ) {
          event.preventDefault();
          navigate(targetRoute);
        }
        return;
      }

      if (event.key === "Escape") {
        if (target instanceof HTMLElement) target.blur();
        window.dispatchEvent(new CustomEvent("firstmag:escape"));
      }

      if (
        scannerFirstFocus &&
        event.key === "Enter" &&
        document.activeElement === document.body
      ) {
        const scannerInput = document.querySelector<HTMLElement>("[data-scanner-focus='true']");
        if (scannerInput) {
          event.preventDefault();
          scannerInput.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [permissions, keyboardProfile, navigate, scannerFirstFocus]);

  React.useEffect(() => {
    if (!currentUserId) {
      hydratedForUserRef.current = null;
      setAppHydrating(false);
      return;
    }
    if (hydratedForUserRef.current === currentUserId) return;

    let cancelled = false;
    setAppHydrating(true);

    const warmupTasks: Array<Promise<unknown>> = [
      getDashboardStats(),
      getOpenSession(),
      listCashiers(),
      listRegisters(),
      listDepots(),
      listDocumentSeries(),
      listArticleFamilies(),
    ];

    void Promise.all(warmupTasks.map((task) => settleWithTimeout(task)))
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) return;
        hydratedForUserRef.current = currentUserId;
        setAppHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, setAppHydrating]);

  return (
    <div
      className={cn(
        "relative flex h-full w-full overflow-hidden",
        darkMode && "dark",
        density === "classic" && "density-classic",
      )}
    >
      <SidebarProvider>
        <LoginModal />
        {navigationMode === "side" && <AppSidebar />}
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <HeaderBar />
          {navigationMode === "top" && <TopNavigationBar />}
          <main className="flex-1 overflow-auto bg-muted/30 p-4 animate-fade-in md:p-6">
            <Outlet />
          </main>
          <StatusBar />
        </div>
      </SidebarProvider>
      {appHydrating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg border bg-card px-5 py-4 shadow">
            <Loader2 className="size-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium">Chargement en cours</p>
              <p className="text-xs text-muted-foreground">Initialisation des pages principales...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

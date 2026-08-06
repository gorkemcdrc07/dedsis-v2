import {
  Bell,
  Boxes,
  ChevronDown,
  ContactRound,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sofa,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useOutletContext,
} from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Toaster } from "sonner";
import {
  getCurrentSession,
  hasPermission,
  hasRole,
  isAuthenticated,
  logout,
  type CurrentSession,
} from "../features/auth/auth";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { OperationsPage } from "../pages/OperationsPage";
import { EmployeeProjectsPage } from "../pages/EmployeeProjectsPage";
import EvideaPage from "../pages/EvideaPage";
import BasbugPage from "../pages/BasbugPage";
import MuhasebePage from "../pages/MuhasebePage";
import InsanKaynaklariPage from "../pages/InsanKaynaklariPage";
import { UserManagementPage } from "../pages/UserManagementPage";

const navigation = [
  { path: "ana-panel", title: "Ana Panel", permission: "screen.dashboard", icon: House },
  { path: "muhasebe", title: "Muhasebe", permission: "screen.accounting", icon: LayoutDashboard },
  { path: "insan-kaynaklari", title: "İnsan Kaynakları", permission: "screen.hr", icon: ContactRound },
  { path: "kullanici-yetkileri", title: "Proje Yetkileri", superAdminOnly: true, icon: Boxes },
  { path: "evidea", title: "Evidea", permission: "screen.evidea", icon: Sofa },
  { path: "basbug", title: "Başbuğ", permission: "screen.basbug", icon: Truck },
];
const managementItem = { path: "yonetim-paneli", title: "Yönetim" };

function canSeeNavigation(session: CurrentSession, item: (typeof navigation)[number]) {
  if (item.superAdminOnly) return hasRole(session, ["super_admin"]);
  const configured = session.permissions.some((permission) => permission.startsWith("screen."));
  return !configured || !item.permission || hasPermission(session, item.permission);
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        Oturum doğrulanıyor…
      </div>
    </div>
  );
}

function Guard() {
  const location = useLocation();
  const [session, setSession] = useState<CurrentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const currentSession = await getCurrentSession();

        if (active) {
          setSession(currentSession);
        }
      } catch {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet context={session} />;
}

function Layout() {
  const session = useOutletContext<CurrentSession>();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const visibleNavigation = useMemo(
    () => navigation.filter((item) => canSeeNavigation(session, item)),
    [session],
  );

  const activePage = useMemo(
    () =>
      visibleNavigation.find((item) =>
        location.pathname.includes(item.path),
      ) ?? (location.pathname.includes(managementItem.path) ? managementItem : navigation[0]),
    [location.pathname, visibleNavigation],
  );

  const displayName =
    session.user.full_name ||
    session.user.email?.split("@")[0] ||
    "Kullanıcı";

  const initials = displayName
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 shadow-sm shadow-slate-200/40 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-5 px-5 lg:px-8">
          <NavLink
            to="/ana-panel"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-black text-white shadow-lg shadow-blue-200">
              D
            </span>

            <div className="hidden sm:block">
              <div className="text-sm font-extrabold tracking-[0.12em] text-slate-950">
                DEDSİS
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                Yönetim Platformu
              </div>
            </div>
          </NavLink>

          <nav className="mx-auto hidden min-w-0 items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 xl:flex">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              return (
              <NavLink
                key={item.path}
                to={`/${item.path}`}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                    isActive
                      ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" />{item.title}
              </NavLink>
            )})}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {hasRole(session, ["super_admin"]) ? (
              <NavLink to="/yonetim-paneli" title="Yönetim" aria-label="Yönetim" className={({isActive}) => `grid h-10 w-10 place-items-center rounded-xl border transition ${isActive ? "border-blue-200 bg-blue-50 text-blue-700 ring-4 ring-blue-100" : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}>
                <ShieldCheck className="h-[18px] w-[18px]" />
              </NavLink>
            ) : null}

            <button
              type="button"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              aria-label="Bildirimler"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 pr-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
                    {initials}
                  </span>

                  <span className="hidden min-w-0 md:block">
                    <span className="block max-w-32 truncate text-xs font-bold text-slate-900">
                      {displayName}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {session.roles[0]?.name || "Kullanıcı"}
                    </span>
                  </span>

                  <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-[100] min-w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-950/10"
                >
                  <div className="px-3 py-2">
                    <div className="truncate text-sm font-bold text-slate-950">
                      {displayName}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {session.user.email}
                    </div>
                  </div>

                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />

                  <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50">
                    <Users className="h-4 w-4" />
                    Profil
                  </DropdownMenu.Item>

                  <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50">
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />

                  <DropdownMenu.Item
                    onSelect={() => void logout()}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış yap
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 xl:hidden"
              aria-label="Menüyü aç"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-5 py-3 xl:hidden">
            <nav className="mx-auto grid max-w-[1600px] gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {visibleNavigation.map((item) => { const Icon = item.icon; return (
                <NavLink
                  key={item.path}
                  to={`/${item.path}`}
                  className={({ isActive }) =>
                    [
                      "rounded-lg px-3 py-2 text-sm font-semibold",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50",
                    ].join(" ")
                  }
                >
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{item.title}</span>
                </NavLink>
              )})}
            </nav>
          </div>
        ) : null}
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              DEDSİS / {activePage.title}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {activePage.title}
            </h1>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Sistem çevrimiçi
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1600px] px-5 py-6 lg:px-8 lg:py-8">
        <Outlet context={session} />
      </main>
    </div>
  );
}

export function App() {
  return (
    <>
      <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<Guard />}>
        <Route element={<Layout />}>
          <Route
            index
            element={<Navigate to="/ana-panel" replace />}
          />

          <Route
            path="ana-panel"
            element={<PermissionOnly permission="screen.dashboard"><DashboardPage /></PermissionOnly>}
          />
          <Route
            path="yonetim-paneli"
            element={
              <SuperAdminOnly>
                <UserManagementPage />
              </SuperAdminOnly>
            }
          />
<Route
  path="operasyon-kayitlari"
  element={<PermissionOnly permission="screen.operations"><OperationsPage /></PermissionOnly>}
/>
<Route
  path="kullanici-yetkileri"
  element={<EmployeeProjectsPage />}
/>

<Route
  path="evidea"
  element={<PermissionOnly permission="screen.evidea"><EvideaPage /></PermissionOnly>}
/>

<Route
  path="basbug"
  element={<PermissionOnly permission="screen.basbug"><BasbugPage /></PermissionOnly>}
/>

<Route
  path="muhasebe"
  element={<PermissionOnly permission="screen.accounting"><MuhasebePage /></PermissionOnly>}
/>

<Route
  path="insan-kaynaklari"
  element={<PermissionOnly permission="screen.hr"><InsanKaynaklariPage /></PermissionOnly>}
/>

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>


      <Toaster
      position="top-right"
        richColors
      />

    </>
  );
}

function SuperAdminOnly({ children }: { children: React.ReactNode }) {
  const session = useOutletContext<CurrentSession>();
  return hasRole(session, ["super_admin"]) ? children : <Navigate to="/ana-panel" replace />;
}

function PermissionOnly({ permission, children }: { permission?: string; children: React.ReactNode }) {
  const session = useOutletContext<CurrentSession>();
  const configured = session.permissions.some((item) => item.startsWith("screen."));
  return !permission || !configured || hasPermission(session, permission)
    ? children
    : <Navigate to="/ana-panel" replace />;
}



















































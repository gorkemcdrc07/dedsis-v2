import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
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
import {
  getCurrentSession,
  isAuthenticated,
  logout,
  type CurrentSession,
} from "../features/auth/auth";
import { LoginPage } from "../pages/LoginPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { DashboardPage } from "../pages/DashboardPage";
import { OperationsPage } from "../pages/OperationsPage";

const navigation = [
  { path: "ana-panel", title: "Ana Panel" },
{ path: "operasyon-kayitlari", title: "Operasyon Kayıtları" },
  { path: "yonetim-paneli", title: "Yönetim" },
  { path: "muhasebe-karlilik", title: "Muhasebe" },
  { path: "insan-kaynaklari", title: "İnsan Kaynakları" },
  { path: "proje-operasyon", title: "Operasyon" },
  { path: "kullanici-yetkileri", title: "Yetkilendirme" },
  { path: "evidea", title: "Evidea" },
  { path: "basbug", title: "Başbuğ" },
];

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

  const activePage = useMemo(
    () =>
      navigation.find((item) =>
        location.pathname.includes(item.path),
      ) ?? navigation[0],
    [location.pathname],
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
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-5 lg:px-8">
          <NavLink
            to="/ana-panel"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm shadow-blue-600/20">
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

          <nav className="hidden min-w-0 flex-1 items-center gap-1 xl:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={`/${item.path}`}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                  ].join(" ")
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                placeholder="Ara..."
                className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="button"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              aria-label="Bildirimler"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 pr-3 text-left transition hover:bg-slate-50"
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
              {navigation.map((item) => (
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
                  {item.title}
                </NavLink>
              ))}
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
            element={<DashboardPage />}
          />
<Route
  path="operasyon-kayitlari"
  element={<OperationsPage />}
/>

          {navigation
            .filter(
  (item) =>
    item.path !== "ana-panel" &&
    item.path !== "operasyon-kayitlari",
)
            .map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={
                  <PlaceholderPage
                    title={item.title}
                  />
                }
              />
            ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}




import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  isAuthenticated,
  login,
} from "../features/auth/auth";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "Giriş | DEDSİS V2";
  }, []);

  if (isAuthenticated()) {
    return <Navigate to="/ana-panel" replace />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      await login(email, password);

      const state =
        location.state as LoginLocationState | null;

      const target =
        state?.from?.pathname || "/ana-panel";

      navigate(target, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Giriş yapılamadı.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.32),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.18),transparent_26%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden px-12 py-10 text-white lg:flex xl:px-20 xl:py-14">
          <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -left-16 top-1/3 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-lg font-black shadow-lg shadow-blue-950/40">
              D
            </span>
            <div>
              <p className="text-xl font-extrabold tracking-[0.12em]">DEDSİS</p>
              <p className="text-xs font-medium text-blue-200">Yönetim Platformu</p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Odak Lojistik dijital yönetim sistemi
            </div>
            <h1 className="max-w-lg text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">
              Operasyonunuzun tamamı,
              <span className="block bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
                tek bir merkezde.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Operasyon, muhasebe ve insan kaynakları verilerinizi güvenle yönetin; kararlarınızı güncel bilgilerle alın.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <BarChart3 className="mb-4 h-6 w-6 text-blue-300" />
                <p className="font-bold">Anlık görünüm</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Tüm iş sonuçları tek panelde.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <ShieldCheck className="mb-4 h-6 w-6 text-emerald-300" />
                <p className="font-bold">Güvenli erişim</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Yetkilere göre kontrollü kullanım.</p>
              </div>
            </div>
          </div>

          <p className="relative text-sm text-slate-500">© 2026 DEDSİS V2 · Odak Lojistik</p>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-10 lg:rounded-l-[3rem] lg:px-16">
          <div className="w-full max-w-[460px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200">D</span>
              <div>
                <p className="text-xl font-extrabold tracking-[0.12em] text-slate-950">DEDSİS</p>
                <p className="text-xs font-medium text-slate-500">Yönetim Platformu</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Güvenli giriş
              </div>
              <h2 className="text-4xl font-black tracking-tight text-slate-950">Tekrar hoş geldiniz</h2>
              <p className="mt-3 text-base leading-7 text-slate-500">DEDSİS hesabınıza giriş yaparak devam edin.</p>
            </div>

            <form className="space-y-5" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">E-posta adresi</span>
                <span className="group relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ornek@odaklojistik.com.tr"
                    required
                    autoFocus
                    disabled={busy}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Şifre</span>
                <span className="group relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-14 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    minLength={6}
                    placeholder="Şifrenizi girin"
                    required
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </span>
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                  {error}
                </div>
              ) : null}

              <button
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                type="submit"
                disabled={busy}
              >
                {busy ? (
                  <><LoaderCircle className="h-5 w-5 animate-spin" /> Giriş yapılıyor…</>
                ) : (
                  <>Giriş yap <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              Bilgileriniz güvenli bağlantı üzerinden iletilir.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

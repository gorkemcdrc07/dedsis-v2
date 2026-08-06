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
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-badge">DEDSİS</div>

        <div>
          <p className="eyebrow">Odak Lojistik</p>
          <h1>Operasyonunuzu tek merkezden yönetin.</h1>

          <p className="brand-description">
            Evrak, operasyon, kullanıcı ve raporlama
            süreçleri için güvenli yönetim platformu.
          </p>
        </div>

        <p className="login-footer">
          DEDSİS V2 · Güvenli kurumsal platform
        </p>
      </section>

      <section className="login-form-area">
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-header">
            <span className="login-logo">D</span>

            <div>
              <h2>Hoş geldiniz</h2>
              <p>Hesabınızla giriş yapın.</p>
            </div>
          </div>

          <label className="field">
            <span>E-posta adresi</span>

            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@odaklojistik.com.tr"
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span>Şifre</span>

            <div className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                minLength={6}
                placeholder="Şifrenizi girin"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
              >
                {showPassword ? "Gizle" : "Göster"}
              </button>
            </div>
          </label>

          {error ? (
            <div className="login-error" role="alert">
              {error}
            </div>
          ) : null}

          <button
            className="primary-button"
            type="submit"
            disabled={busy}
          >
            {busy ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>
      </section>
    </main>
  );
}

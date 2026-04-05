import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Lock, Loader2, CheckCircle, Eye, EyeOff,
  Shield, KeyRound, Sparkles,
} from "lucide-react";
import logoFull from "@/assets/logo-full.png";
import logoIcon from "@/assets/logo-icon.png";

/* ── password strength ── */
function calcStrength(p: string) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const STRENGTH_COLOR = [
  "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-emerald-500",
];
const STRENGTH_LABEL = [
  "Muy débil", "Débil", "Regular", "Buena", "Muy fuerte",
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const [focused1, setFocused1] = useState(false);
  const [focused2, setFocused2] = useState(false);

  const strength = calcStrength(password);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setValidSession(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Error al actualizar la contraseña", { description: error.message });
    } else {
      setSuccess(true);
      toast.success("¡Contraseña actualizada exitosamente!");
      setTimeout(() => navigate("/"), 2500);
    }
    setLoading(false);
  };

  /* ── Loading state ── */
  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  /* ── Invalid / expired link ── */
  if (!validSession) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        {/* Left branding panel */}
        <ResetBrandingPanel />

        {/* Right content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background relative overflow-hidden">
          <div className="auth-right-decor" />
          <div className="w-full max-w-[420px] relative z-10 text-center">
            <div className="flex justify-center mb-8 lg:hidden">
              <img src={logoFull} alt="MiBolsillo" className="h-9" />
            </div>

            <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
              <KeyRound className="h-9 w-9 text-destructive" />
            </div>

            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Enlace inválido o expirado
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-[300px] mx-auto leading-relaxed">
              Este enlace de recuperación ya no es válido. Por favor solicita uno nuevo desde la página de inicio de sesión.
            </p>

            <button
              onClick={() => navigate("/auth")}
              className="auth-submit-btn mt-8"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success state ── */
  if (success) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        <ResetBrandingPanel />

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background relative overflow-hidden">
          <div className="auth-right-decor" />
          <div className="w-full max-w-[420px] relative z-10 text-center">
            <div className="flex justify-center mb-8 lg:hidden">
              <img src={logoFull} alt="MiBolsillo" className="h-9" />
            </div>

            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-50 duration-500">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Tu contraseña ha sido cambiada exitosamente. Redirigiendo...
            </p>

            <div className="mt-6 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main reset form ── */
  return (
    <div className="min-h-screen flex overflow-hidden">
      <ResetBrandingPanel />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background relative overflow-hidden">
        <div className="auth-right-decor" />

        <div className="w-full max-w-[420px] relative z-10">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src={logoFull} alt="MiBolsillo" className="h-9" />
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Crea tu nueva contraseña
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Elige una contraseña segura para proteger tu cuenta.
            </p>
          </div>

          <form onSubmit={handleReset} className="auth-form-animate space-y-4">
            {/* New password */}
            <div className="space-y-1.5">
              <label htmlFor="new-pass" className="text-[13px] font-medium text-foreground/75 block">
                Nueva contraseña
              </label>
              <div className={`auth-input-wrapper ${focused1 ? "focused" : ""}`}>
                <span className="auth-input-icon"><Lock className="h-4 w-4" /></span>
                <input
                  id="new-pass"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused1(true)}
                  onBlur={() => setFocused1(false)}
                  required
                  className="auth-input"
                />
                <span className="auth-input-suffix">
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <div className="space-y-1 px-0.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`auth-strength-seg ${
                          i <= strength ? STRENGTH_COLOR[strength - 1] : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {strength > 0 ? STRENGTH_LABEL[strength - 1] : "Ingresa una contraseña"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-pass" className="text-[13px] font-medium text-foreground/75 block">
                Confirmar contraseña
              </label>
              <div className={`auth-input-wrapper ${focused2 ? "focused" : ""}`}>
                <span className="auth-input-icon"><Lock className="h-4 w-4" /></span>
                <input
                  id="confirm-pass"
                  type={showCPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onFocus={() => setFocused2(true)}
                  onBlur={() => setFocused2(false)}
                  required
                  className="auth-input"
                />
                <span className="auth-input-suffix">
                  <button type="button" onClick={() => setShowCPwd(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                    {showCPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </div>
              {/* Match indicator */}
              {confirm.length > 0 && (
                <p className={`text-[11px] ${password === confirm ? "text-emerald-500" : "text-destructive"}`}>
                  {password === confirm ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                </p>
              )}
            </div>

            {/* Security tips */}
            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2">
              <p className="text-[12px] font-medium text-foreground/70 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Consejos de seguridad
              </p>
              <ul className="text-[11.5px] text-muted-foreground space-y-1 pl-5 list-disc">
                <li>Mínimo 6 caracteres</li>
                <li>Combina letras, números y símbolos</li>
                <li>Evita información personal</li>
              </ul>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Actualizando...</>
              ) : (
                "Actualizar contraseña"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Branding panel (reusable for reset page) ── */
function ResetBrandingPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[44%] xl:w-[40%] relative overflow-hidden flex-col"
      style={{ background: "linear-gradient(150deg,#061410 0%,#0b2018 40%,#0e2d20 70%,#071812 100%)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-grid-pattern" />
        <div className="auth-noise" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="" className="h-8 w-8 drop-shadow-lg" />
          <img src={logoFull} alt="MiBolsillo" className="h-6 opacity-85" />
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center mt-10">
          <span className="auth-badge">
            <Sparkles className="h-3.5 w-3.5" />
            Seguridad
          </span>

          <h1 className="mt-5 text-[2.65rem] xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
            Recupera el
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,#4ade80 0%,#34d399 50%,#6ee7b7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              acceso.
            </span>
          </h1>

          <p className="mt-4 text-white/45 text-[15px] leading-relaxed max-w-[280px]">
            Tu cuenta está protegida. Establece una nueva contraseña segura para continuar.
          </p>

          <div className="mt-10 space-y-3.5">
            {[
              { Icon: Shield, text: "Encriptación de nivel bancario" },
              { Icon: KeyRound, text: "Contraseña almacenada de forma segura" },
              { Icon: Lock, text: "Sesiones protegidas con tokens" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <div className="auth-feature-icon">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

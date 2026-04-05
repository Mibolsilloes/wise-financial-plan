import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Mail, Lock, User, Loader2, Eye, EyeOff,
  TrendingUp, Shield, Zap, ChevronRight,
  BarChart3, Sparkles,
} from "lucide-react";
import logoFull from "@/assets/logo-full.png";
import logoIcon from "@/assets/logo-icon.png";

/* ── password strength ── */
function calcStrength(p: string) {
  let s = 0;
  if (p.length >= 6)  s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s; // 0‥5
}
const STRENGTH_COLOR = [
  "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-emerald-500",
];
const STRENGTH_LABEL = [
  "Muy débil", "Débil", "Regular", "Buena", "Muy fuerte",
];

/* ────────────────────────────── MAIN COMPONENT ────────────────────────── */
export default function Auth() {
  const navigate     = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState<"login" | "register" | "forgot">("login");
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotSent,    setForgotSent]    = useState(false);

  const [regName,     setRegName]     = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm,  setRegConfirm]  = useState("");

  const strength = calcStrength(regPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) toast.error("Error al iniciar sesión", { description: error.message });
    else { toast.success("¡Bienvenido de vuelta!"); navigate("/"); }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) { toast.error("Las contraseñas no coinciden"); return; }
    if (regPassword.length < 6)    { toast.error("Mínimo 6 caracteres"); return; }
    setLoading(true);
    const { error } = await signUp(regEmail, regPassword, regName);
    if (error) {
      toast.error("Error al crear cuenta", { description: error.message });
    } else {
      toast.success("¡Revisa tu correo electrónico!", {
        description: "Te enviamos un enlace de verificación. Confirma tu email para poder iniciar sesión.",
        duration: 8000,
      });
      setTab("login");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("Error al enviar el correo", { description: error.message });
    } else {
      setForgotSent(true);
      toast.success("¡Correo enviado!", {
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
        duration: 8000,
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ════════════════ LEFT — BRANDING PANEL ════════════════ */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[40%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(150deg,#061410 0%,#0b2018 40%,#0e2d20 70%,#071812 100%)" }}
      >
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-grid-pattern" />
          <div className="auth-noise" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="" className="h-8 w-8 drop-shadow-lg" />
            <img src={logoFull} alt="MiBolsillo" className="h-6 opacity-85" />
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center mt-10">
            <span className="auth-badge">
              <Sparkles className="h-3.5 w-3.5" />
              Finanzas inteligentes
            </span>

            <h1 className="mt-5 text-[2.65rem] xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              Tu dinero,
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#4ade80 0%,#34d399 50%,#6ee7b7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                bajo control.
              </span>
            </h1>

            <p className="mt-4 text-white/45 text-[15px] leading-relaxed max-w-[280px]">
              Gestiona ingresos, gastos y metas en un solo lugar. Simple, seguro y poderoso.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-3.5">
              {[
                { Icon: TrendingUp, text: "Análisis financiero en tiempo real" },
                { Icon: Shield,     text: "Seguridad de nivel bancario" },
                { Icon: BarChart3,  text: "Reportes y gráficos automáticos" },
                { Icon: Zap,        text: "Alertas y metas personalizadas" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3.5">
                  <div className="auth-feature-icon">
                    <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-white/60 text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-2.5">
              {[
                { value: "10K+", label: "Usuarios" },
                { value: "4.9 ★", label: "Valoración" },
                { value: "100%", label: "Seguro" },
              ].map(({ value, label }) => (
                <div key={label} className="auth-stat-card">
                  <span className="text-white font-bold text-lg leading-none">{value}</span>
                  <span className="text-white/35 text-[11px] mt-1">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — live indicator + testimonial */}
          <div className="relative z-10 border-t border-white/8 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="auth-dot" />
              <div className="auth-dot" />
              <div className="auth-dot" />
              <span className="text-white/25 text-[11px] ml-1">En línea ahora</span>
            </div>
            <p className="text-white/30 text-[12.5px] leading-relaxed italic">
              "La mejor herramienta para mis finanzas. Nunca fue tan fácil ver a dónde va mi dinero."
            </p>
            <div className="flex items-center gap-2.5 mt-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-center text-xs text-emerald-400 font-bold">
                M
              </div>
              <span className="text-white/25 text-xs">María G. — Usuario verificado</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ RIGHT — FORM PANEL ════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background relative overflow-hidden">
        <div className="auth-right-decor" />

        <div className="w-full max-w-[400px] relative z-10">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src={logoFull} alt="MiBolsillo" className="h-9" />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {tab === "login" ? "Bienvenido de vuelta" : tab === "register" ? "Crea tu cuenta" : "Recuperar contraseña"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              {tab === "login"
                ? "Ingresa tus credenciales para continuar"
                : tab === "register"
                ? "Empieza a gestionar tus finanzas hoy"
                : "Te enviaremos un enlace para restablecer tu contraseña"}
            </p>
          </div>

          {/* Custom pill tab switcher — hide on forgot */}
          {tab !== "forgot" && (
            <div className="auth-tab-switcher">
              <button
                type="button"
                className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
                onClick={() => setTab("login")}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${tab === "register" ? "active" : ""}`}
                onClick={() => setTab("register")}
              >
                Crear cuenta
              </button>
              <div
                className="auth-tab-slider"
                style={{ transform: tab === "register" ? "translateX(100%)" : "translateX(0)" }}
              />
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form key="login" onSubmit={handleLogin} className="auth-form-animate mt-7 space-y-5">
              <AuthField
                id="l-email" type="email" label="Correo electrónico"
                placeholder="tu@email.com" value={loginEmail} onChange={setLoginEmail}
                icon={<Mail className="h-4 w-4" />}
              />
              <AuthField
                id="l-pass" type={showPwd ? "text" : "password"} label="Contraseña"
                placeholder="••••••••" value={loginPassword} onChange={setLoginPassword}
                icon={<Lock className="h-4 w-4" />}
                suffix={
                  <ToggleEye show={showPwd} onToggle={() => setShowPwd(v => !v)} />
                }
              />
              <div className="flex justify-end -mt-2">
                <button type="button" onClick={() => { setTab("forgot"); setForgotSent(false); setForgotEmail(loginEmail); }} className="text-xs text-primary/80 hover:text-primary transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <SubmitBtn loading={loading} idle="Iniciar sesión" busy="Iniciando sesión..." />
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form key="register" onSubmit={handleRegister} className="auth-form-animate mt-7 space-y-4">
              <AuthField
                id="r-name" type="text" label="Nombre completo"
                placeholder="Juan García" value={regName} onChange={setRegName}
                icon={<User className="h-4 w-4" />}
              />
              <AuthField
                id="r-email" type="email" label="Correo electrónico"
                placeholder="tu@email.com" value={regEmail} onChange={setRegEmail}
                icon={<Mail className="h-4 w-4" />}
              />
              <div className="space-y-2">
                <AuthField
                  id="r-pass" type={showPwd ? "text" : "password"} label="Contraseña"
                  placeholder="••••••••" value={regPassword} onChange={setRegPassword}
                  icon={<Lock className="h-4 w-4" />}
                  suffix={<ToggleEye show={showPwd} onToggle={() => setShowPwd(v => !v)} />}
                />
                {/* Strength meter */}
                {regPassword.length > 0 && (
                  <div className="space-y-1 px-0.5">
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
              <AuthField
                id="r-confirm" type={showCPwd ? "text" : "password"} label="Confirmar contraseña"
                placeholder="••••••••" value={regConfirm} onChange={setRegConfirm}
                icon={<Lock className="h-4 w-4" />}
                suffix={<ToggleEye show={showCPwd} onToggle={() => setShowCPwd(v => !v)} />}
              />
              <SubmitBtn loading={loading} idle="Crear cuenta gratis" busy="Creando cuenta..." />
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {tab === "forgot" && (
            <div className="auth-form-animate mt-7">
              {forgotSent ? (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">¡Correo enviado!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
                      Si existe una cuenta con <span className="font-medium text-foreground">{forgotEmail}</span>, recibirás un enlace para restablecer tu contraseña.
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 border border-border p-3.5 text-[12px] text-muted-foreground">
                    💡 Revisa también tu carpeta de spam si no lo encuentras en la bandeja de entrada.
                  </div>
                  <button
                    type="button"
                    onClick={() => { setTab("login"); setForgotSent(false); }}
                    className="auth-submit-btn"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <AuthField
                    id="f-email" type="email" label="Correo electrónico"
                    placeholder="tu@email.com" value={forgotEmail} onChange={setForgotEmail}
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <SubmitBtn loading={loading} idle="Enviar enlace de recuperación" busy="Enviando..." />
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
                  >
                    ← Volver al inicio de sesión
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Legal */}
          <p className="text-center text-[11.5px] text-muted-foreground mt-8 leading-relaxed">
            Al continuar aceptas nuestros{" "}
            <button type="button" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Términos de servicio
            </button>{" "}
            y{" "}
            <button type="button" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Política de privacidad
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── SUB-COMPONENTS ────────────────────────────────── */

function AuthField({
  id, type, label, placeholder, value, onChange, icon, suffix,
}: {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground/75 block">
        {label}
      </label>
      <div className={`auth-input-wrapper ${focused ? "focused" : ""}`}>
        <span className="auth-input-icon">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          className="auth-input"
          autoComplete={type === "password" ? "current-password" : undefined}
        />
        {suffix && <span className="auth-input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
      tabIndex={-1}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function SubmitBtn({ loading, idle, busy }: { loading: boolean; idle: string; busy: string }) {
  return (
    <button type="submit" disabled={loading} className="auth-submit-btn">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {busy}
        </>
      ) : (
        <>
          {idle}
          <ChevronRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import logoFull from "@/assets/logo-full.png";

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

  useEffect(() => {
    // Check if we have a recovery session from the URL hash
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setValidSession(true);
    }

    // Also listen for auth state changes (Supabase processes the hash automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
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
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-4">
          <img src={logoFull} alt="MiBolsillo" className="h-9 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-foreground">Enlace inválido o expirado</h2>
          <p className="text-muted-foreground text-sm">
            Este enlace de recuperación ya no es válido. Por favor solicita uno nuevo.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="auth-submit-btn mt-4"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-4">
          <CheckCircle className="h-16 w-16 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">¡Contraseña actualizada!</h2>
          <p className="text-muted-foreground text-sm">
            Redirigiendo al dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center mb-8">
          <img src={logoFull} alt="MiBolsillo" className="h-9" />
        </div>

        <div className="mb-7">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Nueva contraseña
          </h2>
          <p className="text-muted-foreground text-sm mt-1.5">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="new-pass" className="text-[13px] font-medium text-foreground/75 block">
              Nueva contraseña
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><Lock className="h-4 w-4" /></span>
              <input
                id="new-pass"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
              <span className="auth-input-suffix">
                <button type="button" onClick={() => setShowPwd(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-pass" className="text-[13px] font-medium text-foreground/75 block">
              Confirmar contraseña
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><Lock className="h-4 w-4" /></span>
              <input
                id="confirm-pass"
                type={showCPwd ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="auth-input"
              />
              <span className="auth-input-suffix">
                <button type="button" onClick={() => setShowCPwd(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                  {showCPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </div>
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
  );
}

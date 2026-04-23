import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, ThemeColor } from "@/contexts/ThemeContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { ResponsiblesManager } from "@/components/settings/ResponsiblesManager";
import {
  User,
  Share2,
  Globe,
  Bell,
  Palette,
  Database,
  CreditCard,
  Camera,
  Mail,
  Phone,
  Edit2,
  Crown,
  Download,
  Trash2,
  AlertTriangle,
  LogOut,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const themes: { id: ThemeColor; name: string; colors: string[] }[] = [
  { id: "green", name: "Verde (Predeterminado)", colors: ["hsl(157, 54%, 33%)", "hsl(157, 45%, 40%)"] },
  { id: "pink",  name: "Rosa",                  colors: ["hsl(340, 30%, 8%)",  "hsl(340, 82%, 52%)"] },
  { id: "blue",  name: "Azul",                  colors: ["hsl(199, 47%, 8%)",  "hsl(199, 89%, 48%)"] },
  { id: "black", name: "Negro",                 colors: ["hsl(0, 0%, 4%)",     "hsl(0, 0%, 50%)"]    },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { themeColor, setThemeColor } = useTheme();
  const { transactions } = useTransactions();

  // Profile tab
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone,    setPhone]    = useState(profile?.phone     || "");

  // Preferences tab
  const [language, setLanguage] = useState(profile?.language || "es-ES");
  const [currency, setCurrency] = useState(profile?.currency || "EUR");

  // Notifications tab
  const [notifications, setNotifications] = useState({
    enabled:   true,
    whatsapp:  true,
    email:     true,
    dayBefore: true,
    dueDate:   true,
  });

  // ── handlers ──────────────────────────────────────────────

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada correctamente");
    navigate("/auth");
  };

  const handleSaveProfile = async () => {
    const { error } = await updateProfile({ full_name: fullName, phone });
    if (error) toast.error("Error al guardar los cambios");
    else        toast.success("Perfil actualizado correctamente");
  };

  const handleSavePreferences = async () => {
    const { error } = await updateProfile({ language, currency });
    if (error) toast.error("Error al guardar las preferencias");
    else        toast.success("Preferencias guardadas correctamente");
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No hay transacciones para exportar");
      return;
    }
    const headers = ["Fecha vencimiento", "Descripción", "Tipo", "Categoría", "Importe", "Estado", "Cuenta"];
    const rows = transactions.map((t) => [
      format(t.dueDate, "dd/MM/yyyy"),
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === "ingreso" ? "Ingreso" : "Gasto",
      `"${t.category}"`,
      t.amount.toFixed(2).replace(".", ","),
      t.status,
      `"${t.account}"`,
    ]);
    const csv  = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `transacciones_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${transactions.length} transacciones exportadas`);
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.email || "U";
    return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ajustes</h1>
          <p className="text-muted-foreground text-sm mt-1">Personaliza tu experiencia en el sistema</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass border border-border/50 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="profile"       className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><User className="w-4 h-4" />Mi perfil</TabsTrigger>
            <TabsTrigger value="responsibles"  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="w-4 h-4" />Responsables</TabsTrigger>
            <TabsTrigger value="preferences"   className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Globe className="w-4 h-4" />Preferencias</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Bell className="w-4 h-4" />Notificaciones</TabsTrigger>
            <TabsTrigger value="appearance"    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Palette className="w-4 h-4" />Apariencia</TabsTrigger>
            <TabsTrigger value="data"          className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Database className="w-4 h-4" />Datos</TabsTrigger>
            <TabsTrigger value="plans"         className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard className="w-4 h-4" />Planes</TabsTrigger>
          </TabsList>

          {/* ── Profile ── */}
          <TabsContent value="profile" className="animate-fade-in">
            <div className="glass rounded-xl p-6 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Información personal</h2>
                <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </Button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-primary/30">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile?.full_name || user?.email || "Usuario"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Crown className="w-4 h-4 text-warning" />
                    <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                      Plan Premium
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user?.email || ""}
                        className="pl-10"
                        disabled
                        title="El correo no puede modificarse desde aquí"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">El correo no puede modificarse</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 612 345 678"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button className="gap-2" onClick={handleSaveProfile}>
                  <Edit2 className="w-4 h-4" />
                  Guardar cambios
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Responsibles ── */}
          <TabsContent value="responsibles" className="animate-fade-in">
            <ResponsiblesManager />
          </TabsContent>

          {/* ── Preferences ── */}
          <TabsContent value="preferences" className="animate-fade-in">
            <div className="glass rounded-xl p-6 max-w-2xl">
              <h2 className="text-lg font-semibold mb-6">Preferencias del sistema</h2>
              <div className="space-y-6">
                <div>
                  <Label>Idioma</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1.5 w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es-ES">Español (España)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1.5 w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="GBP">Libra (£)</SelectItem>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2" onClick={handleSavePreferences}>
                  <Check className="w-4 h-4" />
                  Guardar preferencias
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Notifications ── */}
          <TabsContent value="notifications" className="animate-fade-in">
            <div className="glass rounded-xl p-6 max-w-2xl">
              <h2 className="text-lg font-semibold mb-6">Configuración de notificaciones</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activar notificaciones</Label>
                    <p className="text-sm text-muted-foreground">Recibe alertas sobre tus pagos</p>
                  </div>
                  <Switch
                    checked={notifications.enabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, enabled: checked })}
                  />
                </div>

                <div className="space-y-4 pl-4 border-l-2 border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Correo electrónico</Label>
                      <p className="text-sm text-muted-foreground">Recibir por email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      disabled={!notifications.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">Recibir por WhatsApp</p>
                    </div>
                    <Switch
                      checked={notifications.whatsapp}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
                      disabled={!notifications.enabled}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                  <h3 className="font-medium">Recordatorios</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>1 día antes</Label>
                      <p className="text-sm text-muted-foreground">Recordar un día antes del vencimiento</p>
                    </div>
                    <Switch
                      checked={notifications.dayBefore}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, dayBefore: checked })}
                      disabled={!notifications.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>El día del vencimiento</Label>
                      <p className="text-sm text-muted-foreground">Recordar el día del vencimiento</p>
                    </div>
                    <Switch
                      checked={notifications.dueDate}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, dueDate: checked })}
                      disabled={!notifications.enabled}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Las notificaciones por WhatsApp y email requieren configuración adicional en el servidor.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── Appearance ── */}
          <TabsContent value="appearance" className="animate-fade-in">
            <div className="glass rounded-xl p-6 max-w-2xl">
              <h2 className="text-lg font-semibold mb-6">Tema del sistema</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setThemeColor(theme.id);
                      toast.success(`Tema cambiado a ${theme.name}`);
                    }}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all",
                      themeColor === theme.id
                        ? "border-primary shadow-glow-primary"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div
                      className="w-full h-16 rounded-lg mb-3"
                      style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})` }}
                    />
                    <p className="text-sm font-medium">{theme.name}</p>
                    {themeColor === theme.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── Data ── */}
          <TabsContent value="data" className="animate-fade-in">
            <div className="glass rounded-xl p-6 max-w-2xl">
              <h2 className="text-lg font-semibold mb-6">Gestión de datos</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm font-medium mb-1">Exportar transacciones</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Descarga todas tus transacciones en formato CSV compatible con Excel
                  </p>
                  <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                    <Download className="w-4 h-4" />
                    Exportar CSV ({transactions.length} transacciones)
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                  <p className="text-sm font-medium text-warning mb-1">Zona de peligro</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Estas acciones son irreversibles. Procede con cuidado.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60">
                          <AlertTriangle className="w-4 h-4" />
                          Eliminar cuenta
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar cuenta definitivamente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará tu cuenta y todos tus datos de forma permanente.
                            No podrás recuperarlos. ¿Estás seguro?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleSignOut}
                          >
                            Sí, eliminar mi cuenta
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Plans ── */}
          <TabsContent value="plans" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div className="glass rounded-xl p-6 border border-border/50">
                <h3 className="text-lg font-semibold mb-2">Plan Gratuito</h3>
                <p className="text-3xl font-bold mb-4">
                  0 €<span className="text-sm font-normal text-muted-foreground">/mes</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>• Hasta 50 transacciones/mes</li>
                  <li>• 2 cuentas bancarias</li>
                  <li>• 1 tarjeta de crédito</li>
                  <li>• Informes básicos</li>
                </ul>
                <Button variant="outline" className="w-full" disabled>
                  Plan actual
                </Button>
              </div>

              <div className="relative glass rounded-xl p-6 border-2 border-warning/50 bg-gradient-to-br from-warning/10 to-warning/5">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-warning-foreground">
                  Recomendado
                </Badge>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-warning" />
                  <h3 className="text-lg font-semibold">Plan Premium</h3>
                </div>
                <p className="text-3xl font-bold mb-4">
                  9,90 €<span className="text-sm font-normal text-muted-foreground">/mes</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="text-success">✓ Transacciones ilimitadas</li>
                  <li className="text-success">✓ Cuentas ilimitadas</li>
                  <li className="text-success">✓ Tarjetas ilimitadas</li>
                  <li className="text-success">✓ Informes avanzados</li>
                  <li className="text-success">✓ Gestión compartida</li>
                  <li className="text-success">✓ Soporte prioritario</li>
                </ul>
                <Button className="w-full bg-warning text-warning-foreground hover:bg-warning/90">
                  Mejorar plan
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

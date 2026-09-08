import {
  Landmark,
  Home,
  Car,
  CreditCard,
  GraduationCap,
  Users,
  ShoppingBag,
  Wallet,
  Building2,
  Banknote,
  Receipt,
  HandCoins,
  Briefcase,
  Smartphone,
  Plane,
  Heart,
  type LucideIcon,
} from "lucide-react";

export const DEBT_ICONS: Record<string, LucideIcon> = {
  Landmark, Home, Car, CreditCard, GraduationCap, Users, ShoppingBag, Wallet,
  Building2, Banknote, Receipt, HandCoins, Briefcase, Smartphone, Plane, Heart,
};

export const DEBT_ICON_NAMES = Object.keys(DEBT_ICONS);

export function getDebtIcon(name: string): LucideIcon {
  return DEBT_ICONS[name] ?? Landmark;
}

export interface DebtTypeOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const DEBT_TYPES: DebtTypeOption[] = [
  { id: "hipoteca", label: "Hipoteca", icon: "Home", color: "#0EA5E9" },
  { id: "personal", label: "Préstamo personal", icon: "HandCoins", color: "#26805D" },
  { id: "coche", label: "Préstamo de coche", icon: "Car", color: "#EF4444" },
  { id: "tarjeta", label: "Tarjeta de crédito", icon: "CreditCard", color: "#8B5CF6" },
  { id: "estudiantil", label: "Préstamo estudiantil", icon: "GraduationCap", color: "#F59E0B" },
  { id: "familiar", label: "Deuda con familiares/amigos", icon: "Users", color: "#EC4899" },
  { id: "financiada", label: "Compra financiada", icon: "ShoppingBag", color: "#14B8A6" },
  { id: "otra", label: "Otra", icon: "Landmark", color: "#64748B" },
];

export const debtTypeLabel = (id: string) =>
  DEBT_TYPES.find((t) => t.id === id)?.label ?? "Otra";

export const DEBT_COLORS = [
  "#26805D", "#10B981", "#22C55E", "#84CC16", "#EAB308", "#F59E0B",
  "#F97316", "#EF4444", "#EC4899", "#D946EF", "#8B5CF6", "#6366F1",
  "#3B82F6", "#0EA5E9", "#06B6D4", "#14B8A6", "#64748B", "#111827",
];

export const formatEUR = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const formatDebtDate = (date: string | null) =>
  date
    ? new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Sin fecha";

/** Cuota mensual por amortización francesa. */
export function frenchInstallment(principal: number, annualRate: number, installments: number) {
  if (principal <= 0 || installments <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i <= 0) return principal / installments;
  return (principal * i) / (1 - Math.pow(1 + i, -installments));
}

export function addMonths(date: string, months: number) {
  const d = new Date(date + "T12:00:00");
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d.toISOString().split("T")[0];
}

export function humanDuration(months: number) {
  if (months <= 0) return "—";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} ${y === 1 ? "año" : "años"}`);
  if (m) parts.push(`${m} ${m === 1 ? "mes" : "meses"}`);
  return parts.join(" y ");
}

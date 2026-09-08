import {
  Shield,
  Home,
  Plane,
  Car,
  GraduationCap,
  Heart,
  TrendingUp,
  Palmtree,
  Laptop,
  Smartphone,
  Target,
  Landmark,
  BookOpen,
  Star,
  Rocket,
  PiggyBank,
  Gift,
  Baby,
  Dog,
  Bike,
  Camera,
  Music,
  Dumbbell,
  Briefcase,
  Wrench,
  Sofa,
  Utensils,
  Ship,
  Mountain,
  Coins,
  Wallet,
  Umbrella,
  type LucideIcon,
} from "lucide-react";

export const GOAL_ICONS: Record<string, LucideIcon> = {
  Shield, Home, Plane, Car, GraduationCap, Heart, TrendingUp, Palmtree, Laptop,
  Smartphone, Target, Landmark, BookOpen, Star, Rocket, PiggyBank, Gift, Baby,
  Dog, Bike, Camera, Music, Dumbbell, Briefcase, Wrench, Sofa, Utensils, Ship,
  Mountain, Coins, Wallet, Umbrella,
};

export const GOAL_ICON_NAMES = Object.keys(GOAL_ICONS);

export function getGoalIcon(name: string): LucideIcon {
  return GOAL_ICONS[name] ?? Target;
}

export interface GoalTemplate {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { id: "emergencia", label: "Fondo de emergencia", icon: "Shield", color: "#26805D" },
  { id: "casa", label: "Nueva casa", icon: "Home", color: "#0EA5E9" },
  { id: "viaje", label: "Viaje", icon: "Plane", color: "#F59E0B" },
  { id: "coche", label: "Coche", icon: "Car", color: "#EF4444" },
  { id: "educacion", label: "Educación", icon: "GraduationCap", color: "#8B5CF6" },
  { id: "boda", label: "Boda", icon: "Heart", color: "#EC4899" },
  { id: "inversion", label: "Inversión", icon: "TrendingUp", color: "#10B981" },
  { id: "jubilacion", label: "Jubilación", icon: "Palmtree", color: "#14B8A6" },
  { id: "tecnologia", label: "Tecnología", icon: "Laptop", color: "#6366F1" },
  { id: "otro", label: "Otro", icon: "Target", color: "#64748B" },
];

export const GOAL_COLORS = [
  "#26805D", "#10B981", "#22C55E", "#84CC16", "#EAB308", "#F59E0B",
  "#F97316", "#EF4444", "#EC4899", "#D946EF", "#8B5CF6", "#6366F1",
  "#3B82F6", "#0EA5E9", "#06B6D4", "#14B8A6", "#64748B", "#111827",
  "#FCA5A5", "#FDBA74", "#FDE68A", "#BBF7D0", "#A5F3FC", "#C7D2FE",
];

export const formatEUR = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export const formatGoalDate = (date: string | null) =>
  date
    ? new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Sin fecha";

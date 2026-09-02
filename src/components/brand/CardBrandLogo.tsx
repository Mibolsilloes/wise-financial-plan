import { useState } from "react";
import { cn } from "@/lib/utils";

const BRAND_SLUGS: Record<string, string> = {
  visa: "visa",
  mastercard: "mastercard",
  americanexpress: "americanexpress",
  amex: "americanexpress",
  maestro: "maestro",
  discover: "discover",
  dinersclub: "dinersclub",
  diners: "dinersclub",
  jcb: "jcb",
  unionpay: "unionpay",
  elo: "elo",
  hipercard: "hipercard",
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

interface CardBrandLogoProps {
  brand?: string | null;
  color?: string;
  className?: string;
}

export function CardBrandLogo({ brand, color, className }: CardBrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const slug = brand ? BRAND_SLUGS[normalize(brand)] : undefined;

  if (!slug || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md text-[10px] font-bold text-white",
          className
        )}
        style={{ backgroundColor: color || "hsl(217, 91%, 60%)" }}
      >
        {(brand || "??").slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md bg-white overflow-hidden border border-border/50",
        className
      )}
    >
      <img
        src={`https://cdn.simpleicons.org/${slug}`}
        alt={`Logo ${brand}`}
        loading="lazy"
        className="w-4/5 h-4/5 object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

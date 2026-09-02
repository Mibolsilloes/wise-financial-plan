import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Dominios conocidos de bancos (España y LatAm) para obtener su logo
const BANK_DOMAINS: Record<string, string> = {
  santander: "santander.com",
  bbva: "bbva.com",
  caixabank: "caixabank.es",
  lacaixa: "caixabank.es",
  sabadell: "bancsabadell.com",
  bankinter: "bankinter.com",
  unicaja: "unicajabanco.es",
  ing: "ing.es",
  openbank: "openbank.es",
  abanca: "abanca.com",
  kutxabank: "kutxabank.es",
  ibercaja: "ibercaja.es",
  cajamar: "cajamar.es",
  imagin: "imagin.com",
  revolut: "revolut.com",
  n26: "n26.com",
  wise: "wise.com",
  paypal: "paypal.com",
  deutschebank: "deutsche-bank.es",
  // LatAm
  davivienda: "davivienda.com",
  bancolombia: "bancolombia.com",
  bancodebogota: "bancodebogota.com",
  bbvacolombia: "bbva.com.co",
  nequi: "nequi.com.co",
  nubank: "nubank.com.br",
  itau: "itau.com.br",
  bradesco: "bradesco.com.br",
  santanderbrasil: "santander.com.br",
  bancodobrasil: "bb.com.br",
  caixa: "caixa.gov.br",
  inter: "bancointer.com.br",
  c6: "c6bank.com.br",
  banorte: "banorte.com",
  bancoestado: "bancoestado.cl",
  bancochile: "bancochile.cl",
  galicia: "bancogalicia.com",
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/banco|bank|s\.a\.|sa\b/g, "")
    .replace(/[^a-z0-9]/g, "");

export function resolveBankDomain(bankName?: string | null): string | null {
  if (!bankName) return null;
  const key = normalize(bankName);
  if (!key) return null;
  if (BANK_DOMAINS[key]) return BANK_DOMAINS[key];
  const partial = Object.keys(BANK_DOMAINS).find(
    (k) => key.includes(k) || k.includes(key)
  );
  return partial ? BANK_DOMAINS[partial] : `${key}.com`;
}

interface BankLogoProps {
  bank?: string | null;
  color?: string;
  className?: string;
}

export function BankLogo({ bank, color, className }: BankLogoProps) {
  const [failed, setFailed] = useState(false);
  const domain = resolveBankDomain(bank);

  if (!domain || failed) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-xl", className)}
        style={{ backgroundColor: color ? `${color}20` : undefined }}
      >
        <Building2 className="w-5 h-5" style={{ color }} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl overflow-hidden bg-white/90",
        className
      )}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={`Logo de ${bank}`}
        loading="lazy"
        className="w-6 h-6 object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

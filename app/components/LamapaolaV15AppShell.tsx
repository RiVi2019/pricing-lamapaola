"use client";
import AnagraficheClienti from "./AnagraficheClienti";
import React from "react";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Package,
  Settings2,
} from "lucide-react";
import PricingApp from "./PricingApp";
import ReseLottoMasterDetail from "./ReseLottoMasterDetail";

type AppSection = "pricing" | "rese" | "listini" | "anagrafiche" | "statistiche";

const logoLamapaola = "/logo-lamapaola.jpg";

export default function LamapaolaV15AppShell(): React.JSX.Element {
  const [section, setSection] = React.useState<AppSection>("pricing");

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f0fbff_0%,_#f7feff_40%,_#ecfdf5_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col xl:flex-row">
        <aside className="w-full border-b border-sky-100 bg-white/95 shadow-[0_12px_30px_rgba(15,23,42,0.06)] xl:min-h-screen xl:w-[320px] xl:border-b-0 xl:border-r">
          <div className="border-b border-sky-100 px-5 py-5 sm:px-6">
            <div className="rounded-[24px] border border-slate-100 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
              <img
                src={logoLamapaola}
                alt="Lamapaola"
                className="h-auto w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Sistema gestionale ortofrutta
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Versione 15
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Menu unico per pricing, rese lotti e listini clienti.
            </div>
          </div>

          <nav className="grid grid-cols-1 gap-2 p-4 sm:p-5">
            <NavButton
              icon={Package}
              label="Pricing"
              active={section === "pricing"}
              onClick={() => setSection("pricing")}
            />
            <NavButton
              icon={LayoutDashboard}
              label="Rese Lotto"
              active={section === "rese"}
              onClick={() => setSection("rese")}
            />
            <NavButton
              icon={FileText}
              label="Listini PDF"
              active={section === "listini"}
              onClick={() => setSection("listini")}
            />
            <NavButton
              icon={Settings2}
              label="Anagrafiche"
              active={section === "anagrafiche"}
              onClick={() => setSection("anagrafiche")}
            />
            <NavButton
              icon={BarChart3}
              label="Statistiche"
              active={section === "statistiche"}
              onClick={() => setSection("statistiche")}
            />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-3 sm:p-4 xl:p-6">
          {section === "pricing" ? <PricingApp /> : null}
          {section === "rese" ? <ReseLottoMasterDetail /> : null}
          {section === "listini" ? (
            <SectionPlaceholder
              title="Listini PDF"
              description="Qui inseriremo il generatore del PDF listino clienti con logo Lamapaola, referenze, prezzi finali e validità offerta."
            />
          ) : null}
          {section === "anagrafiche" ? <AnagraficheClienti /> : null}
          {section === "statistiche" ? (
            <SectionPlaceholder
              title="Statistiche"
              description="Qui inseriremo dashboard margini, andamento lotti, resa media e confronto prezzi nel tempo."
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-emerald-800 shadow-sm"
          : "flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-left text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50"
      }
    >
      <Icon size={18} className="shrink-0" />
      <span className="font-semibold">{label}</span>
    </button>
  );
}

function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}): React.JSX.Element {
  return (
    <div className="rounded-[32px] border border-sky-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600">
        Modulo in preparazione
      </div>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

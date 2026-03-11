"use client";

import React from "react";
import { Building2, Save, Trash2 } from "lucide-react";

export interface ClienteAnagrafica {
  id: string;
  denominazione: string;
  sede: string;
  piva: string;
  cf: string;
  scontistica: string;
  piattaformaScarico: string;
  costoTrasporto: string;
}

const STORAGE_KEY = "lamapaola-anagrafiche-clienti-v1";

const inputClass =
  "w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

const emptyForm: ClienteAnagrafica = {
  id: "",
  denominazione: "",
  sede: "",
  piva: "",
  cf: "",
  scontistica: "",
  piattaformaScarico: "",
  costoTrasporto: "",
};

function makeId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now());
}

export default function AnagraficheClienti(): React.JSX.Element {
  const [form, setForm] = React.useState<ClienteAnagrafica>({ ...emptyForm });
  const [clienti, setClienti] = React.useState<ClienteAnagrafica[]>([]);
  const [notification, setNotification] = React.useState("");

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      setClienti(JSON.parse(stored) as ClienteAnagrafica[]);
    } catch {
      setClienti([]);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clienti));
  }, [clienti]);

  React.useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const update = <K extends keyof ClienteAnagrafica>(
    key: K,
    value: ClienteAnagrafica[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveCliente = (): void => {
    if (!form.denominazione.trim()) {
      setNotification("Inserisci la denominazione aziendale");
      return;
    }

    const newCliente: ClienteAnagrafica = {
      ...form,
      id: makeId(),
    };

    setClienti((prev) => [newCliente, ...prev]);
    setForm({ ...emptyForm });
    setNotification("Cliente salvato in anagrafica");
  };

  const deleteCliente = (id: string): void => {
    setClienti((prev) => prev.filter((item) => item.id !== id));
    setNotification("Cliente eliminato");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Building2 size={18} /> Anagrafica clienti
        </div>

        {notification ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notification}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={form.denominazione}
            onChange={(e) => update("denominazione", e.target.value)}
            className={inputClass}
            placeholder="Denominazione aziendale"
          />

          <input
            value={form.sede}
            onChange={(e) => update("sede", e.target.value)}
            className={inputClass}
            placeholder="Sede"
          />

          <input
            value={form.piva}
            onChange={(e) => update("piva", e.target.value)}
            className={inputClass}
            placeholder="P. IVA"
          />
<input
  value={form.scontistica}
  onChange={(e) => update("scontistica", e.target.value)}
  className={inputClass}
  placeholder="Scontistica %"
/>

<input
  value={form.piattaformaScarico}
  onChange={(e) => update("piattaformaScarico", e.target.value)}
  className={inputClass}
  placeholder="Piattaforma di scarico / Destinazione"
/>

<input
  value={form.costoTrasporto}
  onChange={(e) => update("costoTrasporto", e.target.value)}
  className={inputClass}
  placeholder="Costo trasporto €/pedana"
/>
          <input
            value={form.cf}
            onChange={(e) => update("cf", e.target.value)}
            className={inputClass}
            placeholder="C.F."
          />
        </div>

        <button
          type="button"
          onClick={saveCliente}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0284c7_0%,_#0369a1_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,132,199,0.28)]"
        >
          <Save size={18} /> Salva cliente
        </button>
      </div>

      <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="mb-5 text-lg font-semibold text-slate-900">
          Clienti salvati
        </div>

        <div className="space-y-4">
          {clienti.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-500">
              Nessun cliente salvato.
            </div>
          ) : (
            clienti.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {item.denominazione}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
  Sede: {item.sede || "—"} · P.IVA: {item.piva || "—"} · C.F.: {item.cf || "—"}
</div>

<div className="mt-2 text-sm text-slate-500">
  Sconto: {item.scontistica || "0"}% · Destinazione: {item.piattaformaScarico || "—"} · Trasporto: {item.costoTrasporto || "0"} €
</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteCliente(item.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm"
                  >
                    <Trash2 size={15} /> Elimina
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
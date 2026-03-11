"use client";

import React from "react";
import { Download, FileText, Search } from "lucide-react";

type UnitMode = "kg" | "pz";

interface FormState {
  cliente: string;
  clienteManuale: string;
  nomeProdotto: string;
  codiceLotto: string;
  destinazione: string;
  unitaMisura: UnitMode;
}

interface QuoteMetrics {
  prezzoFinaleScontato: number;
  prezzoFinaleScontatoKg: number;
  prezzoFinaleScontatoPezzo: number;
}

interface SavedQuote {
  id: string;
  createdAt: string;
  form: FormState;
  metrics: QuoteMetrics;
}

interface ClienteAnagraficaStored {
  id: string;
  denominazione: string;
  sede: string;
  piva: string;
  cf: string;
  scontistica: string;
  piattaformaScarico: string;
  costoTrasporto: string;
}

interface RigaListinoSelezionata {
  quoteId: string;
  selezionata: boolean;
}

const STORAGE_KEY_QUOTES = "pricing-app-ortofrutta-v12";
const STORAGE_KEY_CLIENTI = "lamapaola-anagrafiche-clienti-v1";
const logoLamapaola = "/logo-lamapaola.jpg";

const inputClass =
  "w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

function euro(n: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(n) ? n : 0);
}

export default function ListiniPdf(): React.JSX.Element {
  const [quotes, setQuotes] = React.useState<SavedQuote[]>([]);
  const [clienti, setClienti] = React.useState<ClienteAnagraficaStored[]>([]);
  const [clienteSelezionato, setClienteSelezionato] = React.useState("");
  const [validita, setValidita] = React.useState("");
  const [note, setNote] = React.useState(
    "Prezzi validi salvo variazioni di mercato e disponibilità merce."
  );
  const [ricerca, setRicerca] = React.useState("");
  const [righeSelezionate, setRigheSelezionate] = React.useState<
    RigaListinoSelezionata[]
  >([]);

  React.useEffect(() => {
    const storedQuotes = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (storedQuotes) {
      try {
        setQuotes(JSON.parse(storedQuotes) as SavedQuote[]);
      } catch {
        setQuotes([]);
      }
    }

    const storedClienti = localStorage.getItem(STORAGE_KEY_CLIENTI);
    if (storedClienti) {
      try {
        setClienti(JSON.parse(storedClienti) as ClienteAnagraficaStored[]);
      } catch {
        setClienti([]);
      }
    }
  }, []);

  const clienteAttivo = React.useMemo(
    () => clienti.find((item) => item.denominazione === clienteSelezionato) ?? null,
    [clienti, clienteSelezionato]
  );

  const quotesCliente = React.useMemo(() => {
    return quotes
      .filter((item) => {
        const clienteQuote = item.form.clienteManuale.trim() || item.form.cliente || "";
        return clienteQuote === clienteSelezionato;
      })
      .filter((item) => {
        const target =
          `${item.form.nomeProdotto} ${item.form.codiceLotto} ${item.form.destinazione}`.toLowerCase();
        return target.includes(ricerca.toLowerCase());
      });
  }, [quotes, clienteSelezionato, ricerca]);

  React.useEffect(() => {
    setRigheSelezionate(
      quotesCliente.map((item) => ({
        quoteId: item.id,
        selezionata: true,
      }))
    );
  }, [clienteSelezionato, quotesCliente.length]);

  const isSelected = (quoteId: string): boolean =>
    righeSelezionate.find((item) => item.quoteId === quoteId)?.selezionata ?? false;

  const toggleRiga = (quoteId: string): void => {
    setRigheSelezionate((prev) =>
      prev.map((item) =>
        item.quoteId === quoteId ? { ...item, selezionata: !item.selezionata } : item
      )
    );
  };

  const selectedQuotes = quotesCliente.filter((item) => isSelected(item.id));

  const exportPdf = (): void => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] print:hidden">
        <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText size={18} /> Listini PDF clienti
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <select
            value={clienteSelezionato}
            onChange={(e) => setClienteSelezionato(e.target.value)}
            className={`${inputClass} h-[52px]`}
          >
            <option value="">Seleziona cliente</option>
            {clienti
              .map((item) => item.denominazione)
              .sort((a, b) => a.localeCompare(b, "it"))
              .map((cliente) => (
                <option key={cliente} value={cliente}>
                  {cliente}
                </option>
              ))}
          </select>

          <input
            value={validita}
            onChange={(e) => setValidita(e.target.value)}
            className={inputClass}
            placeholder="Validità offerta"
          />
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputClass} mt-4 min-h-[100px] resize-none`}
          placeholder="Note commerciali"
        />

        <div className="mt-6 rounded-3xl border border-sky-100 bg-sky-50/40 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-700">
            Quotazioni salvate del cliente
          </div>

          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca referenza, lotto o destinazione"
              className="w-full rounded-2xl border border-sky-100 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="space-y-3">
            {!clienteSelezionato ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-4 text-sm text-slate-500">
                Seleziona un cliente per vedere le quotazioni disponibili.
              </div>
            ) : quotesCliente.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-4 text-sm text-slate-500">
                Nessuna quotazione salvata per questo cliente.
              </div>
            ) : (
              quotesCliente.map((item) => {
                const prezzo =
                  item.form.unitaMisura === "pz"
                    ? item.metrics.prezzoFinaleScontatoPezzo
                    : item.metrics.prezzoFinaleScontatoKg;

                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(item.id)}
                      onChange={() => toggleRiga(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {item.form.nomeProdotto}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Lotto: {item.form.codiceLotto || "—"} · Destinazione:{" "}
                        {item.form.destinazione || "—"} · Unità: {item.form.unitaMisura}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-800">
                        Prezzo finale: {euro(prezzo)}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportPdf}
            disabled={!clienteSelezionato || selectedQuotes.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0284c7_0%,_#0369a1_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,132,199,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} /> Scarica PDF
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-sky-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] print:rounded-none print:border-none print:p-0 print:shadow-none">
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[260px]">
              <img
                src={logoLamapaola}
                alt="Lamapaola"
                className="h-auto w-full object-contain"
              />
            </div>

            <div className="text-right text-sm leading-6 text-slate-700">
              <div className="text-lg font-bold text-slate-900">
                ORTOFRUTTICOLA LAMAPAOLA SRL
              </div>
              <div>S.P. ANDRIA - TRANI KM 2,800</div>
              <div>76123 ANDRIA (BT)</div>

              <div className="mt-2">P.IVA 08731690726</div>
              <div>CODICE SDI: 1N74KED</div>
              <div>PEC: ortofrutticolalamapaolasrl@pec.it</div>
              <div>www.ortofrutticolalamapaola.it</div>

              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                Listino prezzi clienti
              </div>
              <div className="text-xs text-slate-500">
                Data:{" "}
                {new Date().toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Cliente
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {clienteAttivo?.denominazione || "—"}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Sede: {clienteAttivo?.sede || "—"}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              P.IVA: {clienteAttivo?.piva || "—"} · C.F.: {clienteAttivo?.cf || "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Dettagli offerta
            </div>
            <div className="mt-2 text-sm text-slate-700">
              <strong>Validità:</strong> {validita || "—"}
            </div>
            <div className="mt-1 text-sm text-slate-700">
              <strong>Destinazione:</strong> {clienteAttivo?.piattaformaScarico || "—"}
            </div>
            <div className="mt-1 text-sm text-slate-700">
              <strong>Scontistica cliente:</strong> {clienteAttivo?.scontistica || "0"}%
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border-b border-slate-200 px-4 py-3">Referenza</th>
                <th className="border-b border-slate-200 px-4 py-3">Lotto</th>
                <th className="border-b border-slate-200 px-4 py-3">Unità</th>
                <th className="border-b border-slate-200 px-4 py-3">Prezzo</th>
              </tr>
            </thead>
            <tbody>
              {selectedQuotes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Nessuna referenza selezionata.
                  </td>
                </tr>
              ) : (
                selectedQuotes.map((item) => {
                  const prezzo =
                    item.form.unitaMisura === "pz"
                      ? item.metrics.prezzoFinaleScontatoPezzo
                      : item.metrics.prezzoFinaleScontatoKg;

                  return (
                    <tr key={item.id} className="odd:bg-white even:bg-slate-50/60">
                      <td className="border-b border-slate-200 px-4 py-3">
                        {item.form.nomeProdotto}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {item.form.codiceLotto || "—"}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        {item.form.unitaMisura}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 font-semibold">
                        {euro(prezzo)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <strong>Note:</strong> {note || "—"}
        </div>

        <div className="mt-8 text-xs leading-5 text-slate-500">
          Documento ad uso commerciale. Prezzi soggetti a disponibilità merce e conferma ordine.
        </div>
      </div>
    </div>
  );
}
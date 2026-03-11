"use client";

import React from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Factory,
  Package,
  Pencil,
  Plus,
  Save,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  XCircle,
} from "lucide-react";

type LottoStatus = "aperto" | "chiuso";
type EsitoLotto = "guadagno" | "perdita" | "pareggio";

type ViewMode = "lista" | "dettaglio";

interface LottoHeader {
  id: string;
  codice: string;
  produttore: string;
  referenza: string;
  dataApertura: string;
  stato: LottoStatus;
  noteGenerali: string;

  costoLotto: string;
  pianteIniziali: string;
  pesoGrezzoIniziale: string;

  pesoMedioPiantaGrezza: string;
  pesoMedioPiantaLavorata: string;
}

interface LottoDayEntry {
  id: string;
  lottoId: string;
  data: string;
  pianteRaccolte: string;
  pesoMerceGrezza: string;
  pesoMerceLavorata: string;
  pesoVenduto: string;
  pedaneCosto: string;
  imballiCosto: string;
  giornateCosto: string;
  trasportoCosto: string;
  altriCosti: string;
  ricavo: string;
  note: string;
}

interface LottoSummary {
  totalePedane: number;
  totaleImballi: number;
  totaleGiornate: number;
  totaleTrasporto: number;
  totaleAltriCosti: number;
  totaleCosti: number;
  totaleRicavo: number;
  totalePesoGrezzo: number;
  totalePesoLavorato: number;
  resaPercentuale: number;
  scartoKg: number;
  scartoPercentuale: number;
  risultato: number;
  ricavoKgLavorato: number;
  costoKgLavorato: number;
  utileKgLavorato: number;
  esito: EsitoLotto;
}

const STORAGE_KEY_LOTTI = "lamapaola-lotti-v2";
const STORAGE_KEY_LOTTO_ENTRIES = "lamapaola-lotti-registro-v2";

const inputClass =
  "w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

const emptyLottoHeader: LottoHeader = {
  id: "",
  codice: "",
  produttore: "",
  referenza: "finocchio",
  dataApertura: "",
  stato: "aperto",
  noteGenerali: "",

  costoLotto: "",
  pianteIniziali: "",
  pesoGrezzoIniziale: "",

  pesoMedioPiantaGrezza: "1.1",
  pesoMedioPiantaLavorata: "0.55",
};

const emptyEntry: LottoDayEntry = {
  id: "",
  lottoId: "",
  data: "",
  pianteRaccolte: "",
  pesoMerceGrezza: "",
  pesoMerceLavorata: "",
  pesoVenduto: "",
  pedaneCosto: "",
  imballiCosto: "",
  giornateCosto: "",
  trasportoCosto: "",
  altriCosti: "",
  ricavo: "",
  note: "",
};

function makeId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toNumber(value: string): number {
  const parsed = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function euro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatKg(value: number): string {
  return `${value.toLocaleString("it-IT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} kg`;
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("it-IT", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
function calculateLottoEstimate(lotto: LottoHeader | null) {
  if (!lotto) {
    return {
      pianteStimate: 0,
      pesoLavoratoTeorico: 0,
      resaTeoricaPercentuale: 0,
      costoPerPianta: 0,
      costoTeoricoKgLavorato: 0,
    };
  }

  const costoLotto = toNumber(lotto.costoLotto);
  const pianteIniziali = toNumber(lotto.pianteIniziali);
  const pesoGrezzoIniziale = toNumber(lotto.pesoGrezzoIniziale);
  const pesoMedioPiantaGrezza = toNumber(lotto.pesoMedioPiantaGrezza);
  const pesoMedioPiantaLavorata = toNumber(lotto.pesoMedioPiantaLavorata);

  const pianteStimate =
    pianteIniziali > 0
      ? pianteIniziali
      : pesoGrezzoIniziale > 0 && pesoMedioPiantaGrezza > 0
        ? pesoGrezzoIniziale / pesoMedioPiantaGrezza
        : 0;

  const pesoLavoratoTeorico =
    pianteStimate > 0 && pesoMedioPiantaLavorata > 0
      ? pianteStimate * pesoMedioPiantaLavorata
      : 0;

  const resaTeoricaPercentuale =
    pesoMedioPiantaGrezza > 0
      ? (pesoMedioPiantaLavorata / pesoMedioPiantaGrezza) * 100
      : 0;

  const costoPerPianta =
    pianteStimate > 0 ? costoLotto / pianteStimate : 0;

  const costoTeoricoKgLavorato =
    pesoLavoratoTeorico > 0 ? costoLotto / pesoLavoratoTeorico : 0;

  return {
    pianteStimate,
    pesoLavoratoTeorico,
    resaTeoricaPercentuale,
    costoPerPianta,
    costoTeoricoKgLavorato,
  };
}
function calculateLottoProgress(
  lotto: LottoHeader | null,
  entries: LottoDayEntry[]
) {
  if (!lotto) {
    return {
      pianteRaccolte: 0,
      pianteResidue: 0,
      pesoVenduto: 0,
      resaReale: 0,
      costoRealeKg: 0,
    };
  }

  const pesoMedioPiantaLavorata = toNumber(lotto.pesoMedioPiantaLavorata);
  const costoLotto = toNumber(lotto.costoLotto);

  const pianteRaccolte = entries.reduce(
    (acc, e) => acc + toNumber(e.pianteRaccolte),
    0
  );

  const pesoVenduto = entries.reduce(
    (acc, e) => acc + toNumber(e.pesoVenduto),
    0
  );

  const pianteTotali = toNumber(lotto.pianteIniziali);

  const pianteResidue =
    pianteTotali > 0 ? pianteTotali - pianteRaccolte : 0;

  const pesoTeorico =
    pianteRaccolte * pesoMedioPiantaLavorata;

  const resaReale =
    pesoTeorico > 0 ? (pesoVenduto / pesoTeorico) * 100 : 0;

  const costoRealeKg =
    pesoVenduto > 0 ? costoLotto / pesoVenduto : 0;

  return {
    pianteRaccolte,
    pianteResidue,
    pesoVenduto,
    resaReale,
    costoRealeKg,
  };
}
function summarizeLotto(entries: LottoDayEntry[]): LottoSummary {
  const totals = entries.reduce(
    (acc, entry) => {
      acc.totalePedane += toNumber(entry.pedaneCosto);
      acc.totaleImballi += toNumber(entry.imballiCosto);
      acc.totaleGiornate += toNumber(entry.giornateCosto);
      acc.totaleTrasporto += toNumber(entry.trasportoCosto);
      acc.totaleAltriCosti += toNumber(entry.altriCosti);
      acc.totaleRicavo += toNumber(entry.ricavo);
      acc.totalePesoGrezzo += toNumber(entry.pesoMerceGrezza);
      acc.totalePesoLavorato += toNumber(entry.pesoMerceLavorata);
      return acc;
    },
    {
      totalePedane: 0,
      totaleImballi: 0,
      totaleGiornate: 0,
      totaleTrasporto: 0,
      totaleAltriCosti: 0,
      totaleRicavo: 0,
      totalePesoGrezzo: 0,
      totalePesoLavorato: 0,
    }
  );

  const totaleCosti =
    totals.totalePedane +
    totals.totaleImballi +
    totals.totaleGiornate +
    totals.totaleTrasporto +
    totals.totaleAltriCosti;

  const risultato = totals.totaleRicavo - totaleCosti;
  const scartoKg = Math.max(totals.totalePesoGrezzo - totals.totalePesoLavorato, 0);
  const resaPercentuale =
    totals.totalePesoGrezzo > 0
      ? (totals.totalePesoLavorato / totals.totalePesoGrezzo) * 100
      : 0;
  const scartoPercentuale =
    totals.totalePesoGrezzo > 0
      ? (scartoKg / totals.totalePesoGrezzo) * 100
      : 0;
  const ricavoKgLavorato =
    totals.totalePesoLavorato > 0 ? totals.totaleRicavo / totals.totalePesoLavorato : 0;
  const costoKgLavorato =
    totals.totalePesoLavorato > 0 ? totaleCosti / totals.totalePesoLavorato : 0;
  const utileKgLavorato = ricavoKgLavorato - costoKgLavorato;

  const esito: EsitoLotto =
    risultato > 0 ? "guadagno" : risultato < 0 ? "perdita" : "pareggio";

  return {
    ...totals,
    totaleCosti,
    risultato,
    resaPercentuale,
    scartoKg,
    scartoPercentuale,
    ricavoKgLavorato,
    costoKgLavorato,
    utileKgLavorato,
    esito,
  };
}

export default function ReseLottoMasterDetail(): React.JSX.Element {
  const [view, setView] = React.useState<ViewMode>("lista");
  const [lotti, setLotti] = React.useState<LottoHeader[]>([]);
  const [entries, setEntries] = React.useState<LottoDayEntry[]>([]);
  const [notification, setNotification] = React.useState("");
  const [lottoForm, setLottoForm] = React.useState<LottoHeader>({ ...emptyLottoHeader });
  const [entryForm, setEntryForm] = React.useState<LottoDayEntry>({ ...emptyEntry });
  const [selectedLottoId, setSelectedLottoId] = React.useState<string>("");
  const [editingLottoId, setEditingLottoId] = React.useState<string>("");
  const [editingEntryId, setEditingEntryId] = React.useState<string>("");
  const firstEntryFieldRef = React.useRef<HTMLInputElement | null>(null);
  const entryFormRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const storedLotti = localStorage.getItem(STORAGE_KEY_LOTTI);
    const storedEntries = localStorage.getItem(STORAGE_KEY_LOTTO_ENTRIES);

    if (storedLotti) {
      try {
        setLotti(JSON.parse(storedLotti) as LottoHeader[]);
      } catch {
        setLotti([]);
      }
    }

    if (storedEntries) {
      try {
        setEntries(JSON.parse(storedEntries) as LottoDayEntry[]);
      } catch {
        setEntries([]);
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOTTI, JSON.stringify(lotti));
  }, [lotti]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOTTO_ENTRIES, JSON.stringify(entries));
  }, [entries]);

  React.useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const selectedLotto = React.useMemo(
    () => lotti.find((item) => item.id === selectedLottoId) ?? null,
    [lotti, selectedLottoId]
  );

  const selectedEntries = React.useMemo(
    () => entries.filter((item) => item.lottoId === selectedLottoId),
    [entries, selectedLottoId]
  );

  const selectedSummary = React.useMemo(
    () => summarizeLotto(selectedEntries),
    [selectedEntries]
  );
  const lottoEstimate = React.useMemo(
  () => calculateLottoEstimate(selectedLotto),
  [selectedLotto]
);
const lottoProgress = React.useMemo(
  () => calculateLottoProgress(selectedLotto, selectedEntries),
  [selectedLotto, selectedEntries]
);
  const lottoCards = React.useMemo(() => {
    return lotti
      .map((lotto) => ({
        lotto,
        summary: summarizeLotto(entries.filter((item) => item.lottoId === lotto.id)),
      }))
      .sort((a, b) => {
        const aDate = a.lotto.dataApertura || "";
        const bDate = b.lotto.dataApertura || "";
        return bDate.localeCompare(aDate);
      });
  }, [lotti, entries]);

  const updateLottoForm = <K extends keyof LottoHeader>(key: K, value: LottoHeader[K]) => {
    setLottoForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEntryForm = <K extends keyof LottoDayEntry>(key: K, value: LottoDayEntry[K]) => {
    setEntryForm((prev) => ({ ...prev, [key]: value }));
  };
const handleEntryKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  field: keyof LottoDayEntry
): void => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  if (field === "note") {
    saveEntry();
    return;
  }

  const container = entryFormRef.current;
  if (!container) return;

  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
    )
  );

  const currentIndex = focusable.indexOf(e.currentTarget as HTMLElement);

  if (currentIndex >= 0 && currentIndex < focusable.length - 1) {
    focusable[currentIndex + 1]?.focus();
  } else {
    saveEntry();
  }
};
  const resetLottoForm = () => {
    setLottoForm({ ...emptyLottoHeader });
    setEditingLottoId("");
  };

  const resetEntryForm = () => {
  setEntryForm({ ...emptyEntry, lottoId: selectedLottoId });
  setEditingEntryId("");

  window.setTimeout(() => {
    firstEntryFieldRef.current?.focus();
  }, 0);
};

  const saveLotto = (): void => {
    if (!lottoForm.codice.trim()) {
      setNotification("Inserisci il codice lotto");
      return;
    }

    if (editingLottoId) {
      setLotti((prev) =>
        prev.map((item) =>
          item.id === editingLottoId
            ? { ...lottoForm, id: editingLottoId }
            : item
        )
      );
      setNotification("Lotto aggiornato");
    } else {
      const id = makeId();
      const newLotto: LottoHeader = {
        ...lottoForm,
        id,
        stato: "aperto",
      };
      setLotti((prev) => [newLotto, ...prev]);
      setSelectedLottoId(id);
      setView("dettaglio");
      setNotification("Lotto creato");
    }

    resetLottoForm();
  };

  const editLotto = (lotto: LottoHeader): void => {
    setLottoForm(lotto);
    setEditingLottoId(lotto.id);
    setView("lista");
  };

  const openLotto = (lottoId: string): void => {
    setSelectedLottoId(lottoId);
    setEntryForm({ ...emptyEntry, lottoId });
    setEditingEntryId("");
    setView("dettaglio");
  };

  const closeLotto = (): void => {
    if (!selectedLotto) return;
    setLotti((prev) =>
      prev.map((item) =>
        item.id === selectedLotto.id ? { ...item, stato: "chiuso" } : item
      )
    );
    setNotification("Lotto chiuso con risultato finale");
  };

  const reopenLotto = (): void => {
    if (!selectedLotto) return;
    setLotti((prev) =>
      prev.map((item) =>
        item.id === selectedLotto.id ? { ...item, stato: "aperto" } : item
      )
    );
    setNotification("Lotto riaperto");
  };

  const deleteLotto = (lottoId: string): void => {
    setLotti((prev) => prev.filter((item) => item.id !== lottoId));
    setEntries((prev) => prev.filter((item) => item.lottoId !== lottoId));
    if (selectedLottoId === lottoId) {
      setSelectedLottoId("");
      setView("lista");
    }
    setNotification("Lotto eliminato");
  };

  const saveEntry = (): void => {
    if (!selectedLotto) return;
    if (selectedLotto.stato === "chiuso") {
      setNotification("Il lotto è chiuso: riaprilo per aggiungere registrazioni");
      return;
    }

    if (!entryForm.data) {
      setNotification("Inserisci la data della registrazione");
      return;
    }

    if (editingEntryId) {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === editingEntryId
            ? { ...entryForm, id: editingEntryId, lottoId: selectedLotto.id }
            : item
        )
      );
      setNotification("Registrazione aggiornata");
    } else {
      const item: LottoDayEntry = {
        ...entryForm,
        id: makeId(),
        lottoId: selectedLotto.id,
      };
      setEntries((prev) => [item, ...prev]);
      setNotification("Registrazione giornaliera salvata");
    }

    resetEntryForm();
  };

  const editEntry = (entry: LottoDayEntry): void => {
    setEntryForm(entry);
    setEditingEntryId(entry.id);
  };

  const deleteEntry = (entryId: string): void => {
    setEntries((prev) => prev.filter((item) => item.id !== entryId));
    if (editingEntryId === entryId) resetEntryForm();
    setNotification("Registrazione eliminata");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f0fbff_0%,_#f7feff_45%,_#ecfdf5_100%)] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-700">
                Registro giornaliero lotti
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Rese Lotto · Master/Detail
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Apri un lotto, inserisci registrazioni giornaliere e chiudilo quando hai il risultato finale.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {view === "dettaglio" ? (
                <button
                  type="button"
                  onClick={() => setView("lista")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  <ArrowLeft size={18} /> Torna ai lotti
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setView("lista");
                  resetLottoForm();
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0284c7_0%,_#0369a1_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,132,199,0.28)]"
              >
                <Plus size={18} /> Nuovo lotto
              </button>
            </div>
          </div>
        </div>

        {notification ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notification}
          </div>
        ) : null}

        {view === "lista" ? (
          <>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-1 rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <ClipboardList size={18} /> Scheda lotto
                </div>

                <div className="space-y-4">
                  <Field label="Codice lotto" icon={Factory}>
                    <input
                      value={lottoForm.codice}
                      onChange={(e) => updateLottoForm("codice", e.target.value)}
                      className={inputClass}
                      placeholder="Es. LOTTO-SED-25"
                    />
                  </Field>
                  <Field label="Produttore" icon={Factory}>
                    <input
                      value={lottoForm.produttore}
                      onChange={(e) => updateLottoForm("produttore", e.target.value)}
                      className={inputClass}
                      placeholder="Nome produttore"
                    />
                  </Field>
                  <Field label="Referenza" icon={Package}>
                    <input
                      value={lottoForm.referenza}
                      onChange={(e) => updateLottoForm("referenza", e.target.value)}
                      className={inputClass}
                      placeholder="Es. sedano"
                    />
                  </Field>
                  <Field label="Data apertura" icon={Calendar}>
                    <input
                      type="date"
                      value={lottoForm.dataApertura}
                      onChange={(e) => updateLottoForm("dataApertura", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Costo lotto (€)" icon={Factory}>
  <input
    type="number"
    step="0.01"
    value={lottoForm.costoLotto}
    onChange={(e) => updateLottoForm("costoLotto", e.target.value)}
    className={inputClass}
    placeholder="Es. 10000"
  />
</Field>

<Field label="Piante iniziali (se note)" icon={Package}>
  <input
    type="number"
    step="1"
    value={lottoForm.pianteIniziali}
    onChange={(e) => updateLottoForm("pianteIniziali", e.target.value)}
    className={inputClass}
    placeholder="Es. 100000"
  />
</Field>

<Field label="Peso grezzo iniziale lotto (kg)" icon={Scale}>
  <input
    type="number"
    step="0.01"
    value={lottoForm.pesoGrezzoIniziale}
    onChange={(e) => updateLottoForm("pesoGrezzoIniziale", e.target.value)}
    className={inputClass}
    placeholder="Es. 22000"
  />
</Field>

<Field label="Peso medio pianta grezza (kg)" icon={Scale}>
  <input
    type="number"
    step="0.01"
    value={lottoForm.pesoMedioPiantaGrezza}
    onChange={(e) => updateLottoForm("pesoMedioPiantaGrezza", e.target.value)}
    className={inputClass}
    placeholder="Es. 1.1"
  />
</Field>

<Field label="Peso medio pianta lavorata (kg)" icon={Scale}>
  <input
    type="number"
    step="0.01"
    value={lottoForm.pesoMedioPiantaLavorata}
    onChange={(e) => updateLottoForm("pesoMedioPiantaLavorata", e.target.value)}
    className={inputClass}
    placeholder="Es. 0.55"
  />
</Field>
                  <Field label="Note generali" icon={ClipboardList}>
                    <textarea
                      value={lottoForm.noteGenerali}
                      onChange={(e) => updateLottoForm("noteGenerali", e.target.value)}
                      className={`${inputClass} min-h-[110px] resize-none`}
                      placeholder="Annotazioni lotto"
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveLotto}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0284c7_0%,_#0369a1_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,132,199,0.28)]"
                    >
                      <Save size={18} /> {editingLottoId ? "Aggiorna lotto" : "Crea lotto"}
                    </button>
                    <button
                      type="button"
                      onClick={resetLottoForm}
                      className="inline-flex items-center justify-center rounded-2xl border border-sky-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="mb-5 text-lg font-semibold text-slate-900">Elenco lotti</div>
                <div className="space-y-4">
                  {lottoCards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-500">
                      Nessun lotto creato.
                    </div>
                  ) : (
                    lottoCards.map(({ lotto, summary }) => (
                      <div
                        key={lotto.id}
                        className="rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">
                              {lotto.codice} · {lotto.referenza || "Referenza"}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              Produttore: {lotto.produttore || "—"} · Apertura: {lotto.dataApertura || "—"}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-sm">
                              <Tag>{lotto.stato === "chiuso" ? "Lotto chiuso" : "Lotto aperto"}</Tag>
                              <Tag>{`Ricavo ${euro(summary.totaleRicavo)}`}</Tag>
                              <Tag>{`Costi ${euro(summary.totaleCosti)}`}</Tag>
                              <Tag>{`Risultato ${euro(summary.risultato)}`}</Tag>
                              <Tag>{`Resa ${formatPercent(summary.resaPercentuale)}`}</Tag>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openLotto(lotto.id)}
                              className="rounded-2xl border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                            >
                              Apri
                            </button>
                            <button
                              type="button"
                              onClick={() => editLotto(lotto)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                            >
                              <Pencil size={15} /> Modifica
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteLotto(lotto.id)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm"
                            >
                              <Trash2 size={15} /> Elimina
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : selectedLotto ? (
          <>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      Lotto {selectedLotto.codice} · {selectedLotto.referenza || "Referenza"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Produttore: {selectedLotto.produttore || "—"} · Apertura: {selectedLotto.dataApertura || "—"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLotto.stato === "aperto" ? (
                      <button
                        type="button"
                        onClick={closeLotto}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                      >
                        <CheckCircle2 size={16} /> Chiudi lotto
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={reopenLotto}
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
                      >
                        <XCircle size={16} /> Riapri lotto
                      </button>
                    )}
                  </div>
                </div>
                <div className="mb-6 rounded-[28px] border border-sky-100 bg-sky-50/50 p-4">
  <div className="mb-3 text-sm font-semibold text-sky-800">
    Avanzamento lotto in tempo reale
  </div>

  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">

    <MiniStat
      title="Piante raccolte"
      value={lottoProgress.pianteRaccolte.toLocaleString("it-IT")}
    />

    <MiniStat
      title="Piante residue"
      value={lottoProgress.pianteResidue.toLocaleString("it-IT")}
    />

    <MiniStat
      title="Kg venduti"
      value={formatKg(lottoProgress.pesoVenduto)}
    />

    <MiniStat
      title="Resa reale"
      value={formatPercent(lottoProgress.resaReale)}
    />

    <MiniStat
      title="Costo reale €/kg"
      value={euro(lottoProgress.costoRealeKg)}
    />

  </div>
</div>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <MiniStat title="Totale costi" value={euro(selectedSummary.totaleCosti)} />
                  <MiniStat title="Totale ricavi" value={euro(selectedSummary.totaleRicavo)} />
                  <MiniStat title="Risultato lotto" value={euro(selectedSummary.risultato)} />
                  <MiniStat title="Peso grezzo totale" value={formatKg(selectedSummary.totalePesoGrezzo)} />
                  <MiniStat title="Peso lavorato totale" value={formatKg(selectedSummary.totalePesoLavorato)} />
                  <MiniStat title="Resa totale" value={formatPercent(selectedSummary.resaPercentuale)} />
                </div>
                <div className="mb-6 rounded-[28px] border border-emerald-100 bg-emerald-50/60 p-4">
  <div className="mb-3 text-sm font-semibold text-emerald-800">
    Stima tecnica lotto finocchio
  </div>

  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
    <MiniStat
      title="Piante stimate"
      value={lottoEstimate.pianteStimate.toLocaleString("it-IT", {
        maximumFractionDigits: 0,
      })}
    />
    <MiniStat
      title="Peso lavorato teorico"
      value={formatKg(lottoEstimate.pesoLavoratoTeorico)}
    />
    <MiniStat
      title="Resa teorica"
      value={formatPercent(lottoEstimate.resaTeoricaPercentuale)}
    />
    <MiniStat
      title="Costo per pianta"
      value={euro(lottoEstimate.costoPerPianta)}
    />
    <MiniStat
      title="Costo teorico €/kg"
      value={euro(lottoEstimate.costoTeoricoKgLavorato)}
    />
  </div>
</div>
              <div
  ref={entryFormRef}
  className="rounded-[28px] border border-sky-100 bg-sky-50/50 p-4"
>
  <div className="mb-3 text-sm font-semibold text-slate-700">
    Registrazione giornaliera · compilazione rapida da tastiera
  </div>

  <div className="mb-4 text-xs text-slate-500">
    Usa <strong>Tab</strong> per passare al campo successivo, <strong>Shift+Tab</strong> per tornare indietro e <strong>Invio</strong> per avanzare o salvare.
  </div>

  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Data
      </label>
      <input
        ref={firstEntryFieldRef}
        type="date"
        value={entryForm.data}
        onChange={(e) => updateEntryForm("data", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "data")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Piante raccolte
      </label>
      <input
        type="number"
        step="1"
        min="0"
        value={entryForm.pedaneCosto}
        onChange={(e) => updateEntryForm("pedaneCosto", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "pedaneCosto")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
        placeholder="Valore"
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Peso grezzo (kg)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.pesoMerceGrezza}
        onChange={(e) => updateEntryForm("pesoMerceGrezza", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "pesoMerceGrezza")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Peso lavorato (kg)
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.pesoMerceLavorata}
        onChange={(e) => updateEntryForm("pesoMerceLavorata", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "pesoMerceLavorata")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Pedane €
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.pedaneCosto}
        onChange={(e) => updateEntryForm("pedaneCosto", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "pedaneCosto")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Imballi €
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.imballiCosto}
        onChange={(e) => updateEntryForm("imballiCosto", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "imballiCosto")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Giornate €
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.giornateCosto}
        onChange={(e) => updateEntryForm("giornateCosto", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "giornateCosto")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Trasporto €
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.trasportoCosto}
        onChange={(e) => updateEntryForm("trasportoCosto", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "trasportoCosto")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Altri costi €
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.altriCosti}
        onChange={(e) => updateEntryForm("altriCosti", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "altriCosti")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Ricavo €
      </label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={entryForm.ricavo}
        onChange={(e) => updateEntryForm("ricavo", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "ricavo")}
        className={`${inputClass} h-[46px]`}
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>

    <div className="md:col-span-3 xl:col-span-4">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Note
      </label>
      <textarea
        value={entryForm.note}
        onChange={(e) => updateEntryForm("note", e.target.value)}
        onKeyDown={(e) => handleEntryKeyDown(e, "note")}
        className={`${inputClass} min-h-[70px] resize-none`}
        placeholder="Premi Invio qui per salvare la registrazione"
        disabled={selectedLotto.stato === "chiuso"}
      />
    </div>
  </div>

  <div className="mt-4 flex flex-wrap gap-2">
    <button
      type="button"
      onClick={saveEntry}
      disabled={selectedLotto.stato === "chiuso"}
      className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0284c7_0%,_#0369a1_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,132,199,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Save size={18} /> {editingEntryId ? "Aggiorna registrazione" : "Salva registrazione"}
    </button>

    <button
      type="button"
      onClick={resetEntryForm}
      className="inline-flex items-center rounded-2xl border border-sky-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
    >
      Reset
    </button>
  </div>
</div>
              </div>

              <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="mb-5 text-lg font-semibold text-slate-900">Risultato finale lotto</div>
                <ResultBanner risultato={selectedSummary.risultato} esito={selectedSummary.esito} />
                <div className="mt-5 space-y-3">
                  <InfoRow label="Totale pedane" value={euro(selectedSummary.totalePedane)} />
                  <InfoRow label="Totale imballi" value={euro(selectedSummary.totaleImballi)} />
                  <InfoRow label="Totale giornate" value={euro(selectedSummary.totaleGiornate)} />
                  <InfoRow label="Totale trasporto" value={euro(selectedSummary.totaleTrasporto)} />
                  <InfoRow label="Totale altri costi" value={euro(selectedSummary.totaleAltriCosti)} />
                  <InfoRow label="Scarto kg" value={formatKg(selectedSummary.scartoKg)} />
                  <InfoRow label="Scarto %" value={formatPercent(selectedSummary.scartoPercentuale)} />
                  <InfoRow label="Ricavo €/kg lavorato" value={euro(selectedSummary.ricavoKgLavorato)} />
                  <InfoRow label="Costo €/kg lavorato" value={euro(selectedSummary.costoKgLavorato)} />
                  <InfoRow label="Utile €/kg lavorato" value={euro(selectedSummary.utileKgLavorato)} />
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="mb-5 text-lg font-semibold text-slate-900">Registro giornaliero del lotto</div>
              <div className="space-y-4">
                {selectedEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-500">
                    Nessuna registrazione giornaliera inserita.
                  </div>
                ) : (
                  selectedEntries
                    .sort((a, b) => b.data.localeCompare(a.data))
                    .map((entry) => {
                      const entryCosts =
                        toNumber(entry.pedaneCosto) +
                        toNumber(entry.imballiCosto) +
                        toNumber(entry.giornateCosto) +
                        toNumber(entry.trasportoCosto) +
                        toNumber(entry.altriCosti);
                      return (
                        <div
                          key={entry.id}
                          className="rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-5 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="text-lg font-semibold text-slate-900">{entry.data || "Giornata"}</div>
                              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                <Tag>{`Costi ${euro(entryCosts)}`}</Tag>
                                <Tag>{`Ricavo ${euro(toNumber(entry.ricavo))}`}</Tag>
                                <Tag>{`Peso grezzo ${formatKg(toNumber(entry.pesoMerceGrezza))}`}</Tag>
                                <Tag>{`Peso lavorato ${formatKg(toNumber(entry.pesoMerceLavorata))}`}</Tag>
                              </div>
                              {entry.note ? (
                                <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                  {entry.note}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => editEntry(entry)}
                                disabled={selectedLotto.stato === "chiuso"}
                                className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Pencil size={15} /> Modifica
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteEntry(entry.id)}
                                disabled={selectedLotto.stato === "chiuso"}
                                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 size={15} /> Elimina
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-500">
            Seleziona un lotto per aprire il registro giornaliero.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label className="flex flex-col rounded-[28px] border border-sky-100 bg-white p-4 shadow-sm">
      <span className="mb-3 flex min-h-[40px] items-start gap-2 text-sm font-semibold text-slate-700">
        <Icon size={16} className="mt-0.5 shrink-0" />
        <span>{label}</span>
      </span>
      {children}
    </label>
  );
}

function ResultBanner({
  risultato,
  esito,
}: {
  risultato: number;
  esito: EsitoLotto;
}): React.JSX.Element {
  if (esito === "guadagno") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
          <TrendingUp size={16} /> Guadagno
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,_#22c55e_0%,_#16a34a_100%)]" />
        </div>
        <div className="mt-3 text-2xl font-black">{euro(risultato)}</div>
      </div>
    );
  }

  if (esito === "perdita") {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
          <TrendingDown size={16} /> Perdita
        </div>
        <div className="mt-3 text-2xl font-black">{euro(risultato)}</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <div className="text-sm font-semibold uppercase tracking-[0.18em]">Pareggio</div>
      <div className="mt-3 text-2xl font-black">{euro(risultato)}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-sky-50/60 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white px-4 py-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <span className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm text-slate-700 shadow-sm">
      {children}
    </span>
  );
}
// function runSelfTests(): void {
//   const entries: LottoDayEntry[] = [
//     {
//       id: "1",
//       lottoId: "LOTTO-1",
//       data: "2026-03-01",
//       pianteRaccolte: "1000",
//       pesoMerceGrezza: "1000",
//       pesoMerceLavorata: "850",
//       pesoVenduto: "820",
//       pedaneCosto: "100",
//       imballiCosto: "50",
//       giornateCosto: "200",
//       trasportoCosto: "80",
//       altriCosti: "20",
//       ricavo: "700",
//       note: "giorno 1",
//     },
//     {
//       id: "2",
//       lottoId: "LOTTO-1",
//       data: "2026-03-02",
//       pianteRaccolte: "900",
//       pesoMerceGrezza: "900",
//       pesoMerceLavorata: "750",
//       pesoVenduto: "730",
//       pedaneCosto: "90",
//       imballiCosto: "40",
//       giornateCosto: "180",
//       trasportoCosto: "70",
//       altriCosti: "20",
//       ricavo: "600",
//       note: "giorno 2",
//     },
//   ];

//   const summary = summarizeLotto(entries);
//   console.assert(summary.totaleCosti === 850, "Test failed: totale costi lotto errato");
//   console.assert(summary.totaleRicavo === 1300, "Test failed: totale ricavo lotto errato");
//   console.assert(summary.risultato === 450, "Test failed: risultato lotto errato");
//   console.assert(summary.scartoKg === 300, "Test failed: scarto kg errato");
//   console.assert(Math.abs(summary.resaPercentuale - 80) < 0.001, "Test failed: resa lotto errata");
//   console.assert(summary.esito === "guadagno", "Test failed: esito lotto errato");
// }
  // const drawSummary = summarizeLotto([
  //   {
  //     ...entries[0],
  //     id: "3",
  //     ricavo: "450",
  //     pedaneCosto: "100",
  //     imballiCosto: "50",
  //     giornateCosto: "200",
  //     trasportoCosto: "80",
  //     altriCosti: "20",
  //   },
  // ]);
  // console.assert(drawSummary.risultato === 0, "Test failed: pareggio lotto errato");
  // console.assert(drawSummary.esito === "pareggio", "Test failed: esito pareggio errato");

//   const lossSummary = summarizeLotto([
//     {
//       ...entries[0],
//       id: "4",
//       ricavo: "100",
//       pedaneCosto: "100",
//       imballiCosto: "50",
//       giornateCosto: "200",
//       trasportoCosto: "80",
//       altriCosti: "20",
//     },
//   ]);
//   console.assert(lossSummary.risultato < 0, "Test failed: perdita lotto errata");
//   console.assert(lossSummary.esito === "perdita", "Test failed: esito perdita errato");
// }

if (typeof window !== "undefined") {
  // runSelfTests();
}

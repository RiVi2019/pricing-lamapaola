"use client";

import React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Leaf,
  Plus,
  Save,
  Sprout,
  Tractor,
  X,
} from "lucide-react";

type ProductFamily =
  | "FINOCCHIO"
  | "SEDANO"
  | "BIETOLA"
  | "CICORIA"
  | "PREZZEMOLO"
  | "ANETO"
  | "PATATE";

type LottoStatus = "aperto" | "chiuso";

interface LottoHeader {
  id: string;
  prodotto: ProductFamily;
  codice: string;
  produttore: string;
  dataApertura: string;
  stato: LottoStatus;
  costoLotto: string;
  pianteIniziali: string;
  pesoGrezzoIniziale: string;
  pesoMedioPiantaGrezza: string;
  pesoMedioPiantaLavorata: string;
  noteGenerali: string;
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
const STORAGE_KEY_LOTTI = "lamapaola-lotti-product-calendar-v1";
const STORAGE_KEY_ENTRIES = "lamapaola-lotti-product-calendar-entries-v1";

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
const PRODUCT_META: Record<
  ProductFamily,
  {
    icon: typeof Sprout;
    badge: string;
    bg: string;
    defaults: {
      pesoMedioPiantaGrezza: string;
      pesoMedioPiantaLavorata: string;
    };
  }
> = {
  FINOCCHIO: {
    icon: Sprout,
    badge: "Focus finocchio",
    bg: "from-emerald-50 to-lime-50",
    defaults: { pesoMedioPiantaGrezza: "1.1", pesoMedioPiantaLavorata: "0.55" },
  },
  SEDANO: {
    icon: Leaf,
    badge: "Focus sedano",
    bg: "from-sky-50 to-cyan-50",
    defaults: { pesoMedioPiantaGrezza: "1.2", pesoMedioPiantaLavorata: "0.75" },
  },
  BIETOLA: {
    icon: Leaf,
    badge: "Focus bietola",
    bg: "from-emerald-50 to-teal-50",
    defaults: { pesoMedioPiantaGrezza: "0.8", pesoMedioPiantaLavorata: "0.45" },
  },
  CICORIA: {
    icon: Leaf,
    badge: "Focus cicoria",
    bg: "from-amber-50 to-yellow-50",
    defaults: { pesoMedioPiantaGrezza: "0.9", pesoMedioPiantaLavorata: "0.5" },
  },
  PREZZEMOLO: {
    icon: Leaf,
    badge: "Focus prezzemolo",
    bg: "from-green-50 to-emerald-50",
    defaults: { pesoMedioPiantaGrezza: "0.18", pesoMedioPiantaLavorata: "0.12" },
  },
  ANETO: {
    icon: Leaf,
    badge: "Focus aneto",
    bg: "from-teal-50 to-cyan-50",
    defaults: { pesoMedioPiantaGrezza: "0.15", pesoMedioPiantaLavorata: "0.1" },
  },
  PATATE: {
    icon: Tractor,
    badge: "Focus patate",
    bg: "from-orange-50 to-amber-50",
    defaults: { pesoMedioPiantaGrezza: "1", pesoMedioPiantaLavorata: "1" },
  },
};

const PRODUCT_ORDER: ProductFamily[] = [
  "FINOCCHIO",
  "SEDANO",
  "BIETOLA",
  "CICORIA",
  "PREZZEMOLO",
  "ANETO",
  "PATATE",
];

const inputClass =
  "w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

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

function getEmptyLotto(product: ProductFamily, date = ""): LottoHeader {
  const defaults = PRODUCT_META[product].defaults;
  return {
    id: "",
    prodotto: product,
    codice: "",
    produttore: "",
    dataApertura: date,
    stato: "aperto",
    costoLotto: "",
    pianteIniziali: "",
    pesoGrezzoIniziale: "",
    pesoMedioPiantaGrezza: defaults.pesoMedioPiantaGrezza,
    pesoMedioPiantaLavorata: defaults.pesoMedioPiantaLavorata,
    noteGenerali: "",
  };
}

function calculateEstimate(lotto: LottoHeader) {
  const costoLotto = toNumber(lotto.costoLotto);
  const pianteIniziali = toNumber(lotto.pianteIniziali);
  const pesoGrezzoIniziale = toNumber(lotto.pesoGrezzoIniziale);
  const pesoMedioPiantaGrezza = toNumber(lotto.pesoMedioPiantaGrezza);
  const pesoMedioPiantaLavorata = toNumber(lotto.pesoMedioPiantaLavorata);
  function summarizeEntries(entries: LottoDayEntry[]) {
  const pianteRaccolte = entries.reduce((sum, item) => sum + toNumber(item.pianteRaccolte), 0);
  const pesoGrezzo = entries.reduce((sum, item) => sum + toNumber(item.pesoMerceGrezza), 0);
  const pesoLavorato = entries.reduce((sum, item) => sum + toNumber(item.pesoMerceLavorata), 0);
  const pesoVenduto = entries.reduce((sum, item) => sum + toNumber(item.pesoVenduto), 0);

  const pedaneCosto = entries.reduce((sum, item) => sum + toNumber(item.pedaneCosto), 0);
  const imballiCosto = entries.reduce((sum, item) => sum + toNumber(item.imballiCosto), 0);
  const giornateCosto = entries.reduce((sum, item) => sum + toNumber(item.giornateCosto), 0);
  const trasportoCosto = entries.reduce((sum, item) => sum + toNumber(item.trasportoCosto), 0);
  const altriCosti = entries.reduce((sum, item) => sum + toNumber(item.altriCosti), 0);

  const totaleCosti =
    pedaneCosto + imballiCosto + giornateCosto + trasportoCosto + altriCosti;

  const totaleRicavi = entries.reduce((sum, item) => sum + toNumber(item.ricavo), 0);
  const risultato = totaleRicavi - totaleCosti;

  const resaPercentuale =
    pesoGrezzo > 0 ? (pesoLavorato / pesoGrezzo) * 100 : 0;

  return {
    pianteRaccolte,
    pesoGrezzo,
    pesoLavorato,
    pesoVenduto,
    pedaneCosto,
    imballiCosto,
    giornateCosto,
    trasportoCosto,
    altriCosti,
    totaleCosti,
    totaleRicavi,
    risultato,
    resaPercentuale,
  };
}

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

  const resaTeorica =
    pesoMedioPiantaGrezza > 0
      ? (pesoMedioPiantaLavorata / pesoMedioPiantaGrezza) * 100
      : 0;

  const costoPerPianta = pianteStimate > 0 ? costoLotto / pianteStimate : 0;
  const costoTeoricoKg = pesoLavoratoTeorico > 0 ? costoLotto / pesoLavoratoTeorico : 0;

  return {
    pianteStimate,
    pesoLavoratoTeorico,
    resaTeorica,
    costoPerPianta,
    costoTeoricoKg,
  };
}
function summarizeEntries(entries: LottoDayEntry[]) {
  const pianteRaccolte = entries.reduce(
    (sum, item) => sum + toNumber(item.pianteRaccolte),
    0
  );

  const pesoGrezzo = entries.reduce(
    (sum, item) => sum + toNumber(item.pesoMerceGrezza),
    0
  );

  const pesoLavorato = entries.reduce(
    (sum, item) => sum + toNumber(item.pesoMerceLavorata),
    0
  );

  const pesoVenduto = entries.reduce(
    (sum, item) => sum + toNumber(item.pesoVenduto),
    0
  );

  const pedaneCosto = entries.reduce(
    (sum, item) => sum + toNumber(item.pedaneCosto),
    0
  );

  const imballiCosto = entries.reduce(
    (sum, item) => sum + toNumber(item.imballiCosto),
    0
  );

  const giornateCosto = entries.reduce(
    (sum, item) => sum + toNumber(item.giornateCosto),
    0
  );

  const trasportoCosto = entries.reduce(
    (sum, item) => sum + toNumber(item.trasportoCosto),
    0
  );

  const altriCosti = entries.reduce(
    (sum, item) => sum + toNumber(item.altriCosti),
    0
  );

  const totaleCosti =
    pedaneCosto +
    imballiCosto +
    giornateCosto +
    trasportoCosto +
    altriCosti;

  const totaleRicavi = entries.reduce(
    (sum, item) => sum + toNumber(item.ricavo),
    0
  );

  const risultato = totaleRicavi - totaleCosti;

  const resaPercentuale =
    pesoGrezzo > 0 ? (pesoLavorato / pesoGrezzo) * 100 : 0;

  return {
    pianteRaccolte,
    pesoGrezzo,
    pesoLavorato,
    pesoVenduto,
    pedaneCosto,
    imballiCosto,
    giornateCosto,
    trasportoCosto,
    altriCosti,
    totaleCosti,
    totaleRicavi,
    risultato,
    resaPercentuale,
  };
}
function monthTitle(date: Date): string {
  return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildCalendarDays(currentMonth: Date): Date[] {
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return d;
  });
}

export default function ReseLottoProductCalendar(): React.JSX.Element {
  const [selectedProduct, setSelectedProduct] = React.useState<ProductFamily>("FINOCCHIO");
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [lotti, setLotti] = React.useState<LottoHeader[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [lottoForm, setLottoForm] = React.useState<LottoHeader>(getEmptyLotto("FINOCCHIO"));
  const [notification, setNotification] = React.useState("");
  const [selectedLottoId, setSelectedLottoId] = React.useState("");
  const [entries, setEntries] = React.useState<LottoDayEntry[]>([]);
  const [entryForm, setEntryForm] = React.useState<LottoDayEntry>({ ...emptyEntry });

  React.useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY_LOTTI);
  if (stored) {
    try {
      setLotti(JSON.parse(stored) as LottoHeader[]);
    } catch {
      setLotti([]);
    }
  }

  const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
  if (storedEntries) {
    try {
      setEntries(JSON.parse(storedEntries) as LottoDayEntry[]);
    } catch {
      setEntries([]);
    }
  }
}, []);
React.useEffect(() => {
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
}, [entries]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOTTI, JSON.stringify(lotti));
  }, [lotti]);

  React.useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const updateLottoForm = <K extends keyof LottoHeader>(key: K, value: LottoHeader[K]) => {
    setLottoForm((prev) => ({ ...prev, [key]: value }));
  };
const updateEntryForm = <K extends keyof LottoDayEntry>(
  key: K,
  value: LottoDayEntry[K]
) => {
  setEntryForm((prev) => ({ ...prev, [key]: value }));
};

const resetEntryForm = () => {
  setEntryForm({
    ...emptyEntry,
    lottoId: selectedLottoId,
    data: new Date().toISOString().slice(0, 10),
  });
};

const saveEntry = (): void => {
  if (!selectedLottoId) {
    setNotification("Seleziona prima un lotto");
    return;
  }

  if (!entryForm.data) {
    setNotification("Inserisci la data");
    return;
  }

  const newEntry: LottoDayEntry = {
    ...entryForm,
    id: makeId(),
    lottoId: selectedLottoId,
  };

  setEntries((prev) => [newEntry, ...prev]);
  resetEntryForm();
  setNotification("Registrazione giornaliera salvata");
};
  const openNewLottoModal = (date: string) => {
    setLottoForm(getEmptyLotto(selectedProduct, date));
    setIsModalOpen(true);
  };

  const saveLotto = (): void => {
    if (!lottoForm.codice.trim()) {
      setNotification("Inserisci il codice lotto");
      return;
    }

    const lotto: LottoHeader = {
      ...lottoForm,
      id: makeId(),
      prodotto: selectedProduct,
      stato: "aperto",
    };

    setLotti((prev) => [lotto, ...prev]);
    setIsModalOpen(false);
    setNotification(`Lotto ${lotto.codice} creato per ${selectedProduct}`);
  };

  const productLotti = React.useMemo(
    () => lotti.filter((item) => item.prodotto === selectedProduct),
    [lotti, selectedProduct]
  );
  const selectedLotto = React.useMemo(
  () => productLotti.find((item) => item.id === selectedLottoId) ?? null,
  [productLotti, selectedLottoId]
);
const selectedEntries = React.useMemo(
  () => entries.filter((item) => item.lottoId === selectedLottoId),
  [entries, selectedLottoId]
);
const selectedSummary = React.useMemo(
  () => summarizeEntries(selectedEntries),
  [selectedEntries]
);
React.useEffect(() => {
  if (!selectedLottoId) return;

  setEntryForm({
    ...emptyEntry,
    lottoId: selectedLottoId,
    data: new Date().toISOString().slice(0, 10),
  });
}, [selectedLottoId]);
  const calendarDays = React.useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const lottoEstimate = React.useMemo(() => calculateEstimate(lottoForm), [lottoForm]);

  const openLottiCount = productLotti.filter((item) => item.stato === "aperto").length;
  const productMeta = PRODUCT_META[selectedProduct];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f0fbff_0%,_#f7feff_40%,_#ecfdf5_100%)] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-700">
                Macro famiglia rese lotto
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Lotti in raccolta per articolo
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Seleziona il prodotto, clicca sul giorno di apertura del lotto nel calendario e avvia la scheda lotto con tutti i dati iniziali.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <strong>{selectedProduct}</strong> · Lotti aperti: <strong>{openLottiCount}</strong>
            </div>
          </div>
        </div>

        {notification ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notification}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {PRODUCT_ORDER.map((product) => {
            const meta = PRODUCT_META[product];
            const Icon = meta.icon;
            const active = selectedProduct === product;
            return (
              <button
                key={product}
                type="button"
                onClick={() => setSelectedProduct(product)}
                className={
                  active
                    ? `rounded-[28px] border border-emerald-200 bg-gradient-to-br ${meta.bg} p-5 text-left shadow-[0_14px_34px_rgba(16,185,129,0.12)]`
                    : "rounded-[28px] border border-sky-100 bg-white p-5 text-left shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50"
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm">
                    <Icon size={20} className="text-emerald-700" />
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {meta.badge}
                  </span>
                </div>
                <div className="mt-4 text-lg font-bold text-slate-900">{product}</div>
                <div className="mt-1 text-sm text-slate-500">
                  Accedi ai lotti in raccolta e apri nuove schede da calendario.
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">Calendario apertura lotti · {selectedProduct}</div>
                <div className="mt-1 text-sm text-slate-500">Clicca sul giorno per creare un nuovo lotto del prodotto selezionato.</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="min-w-[180px] rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-slate-800">
                  {monthTitle(currentMonth)}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const iso = toISODate(day);
                const hasLotti = productLotti.some((item) => item.dataApertura === iso);

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => openNewLottoModal(iso)}
                    className={
                      isCurrentMonth
                        ? `min-h-[94px] rounded-2xl border p-3 text-left shadow-sm transition ${
                            hasLotti
                              ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70"
                              : "border-sky-100 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                          }`
                        : "min-h-[94px] rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left text-slate-400"
                    }
                  >
                    <div className="text-sm font-semibold">{day.getDate()}</div>
                    {hasLotti ? (
                      <div className="mt-2 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        Lotto presente
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-slate-500">Nuovo lotto</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`rounded-[32px] border border-sky-100 bg-gradient-to-br ${productMeta.bg} p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl border border-white/70 bg-white/90 p-3 shadow-sm">
                <productMeta.icon size={22} className="text-emerald-700" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">Scheda prodotto · {selectedProduct}</div>
                <div className="mt-1 text-sm text-slate-600">Parametri tecnici di base per stimare il lotto in apertura.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MiniStat title="Peso medio pianta grezza" value={`${productMeta.defaults.pesoMedioPiantaGrezza} kg`} />
              <MiniStat title="Peso medio pianta lavorata" value={`${productMeta.defaults.pesoMedioPiantaLavorata} kg`} />
              <MiniStat
                title="Resa teorica"
                value={`${((toNumber(productMeta.defaults.pesoMedioPiantaLavorata) / toNumber(productMeta.defaults.pesoMedioPiantaGrezza)) * 100).toLocaleString("it-IT", { maximumFractionDigits: 1 })}%`}
              />
              <MiniStat title="Lotti aperti" value={String(openLottiCount)} />
            </div>

            <div className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-700">
              Cliccando sul giorno di apertura, il form lotto userà automaticamente il prodotto selezionato e i parametri tecnici standard del relativo articolo.
            </div>
          </div>
        </div>
        {selectedLotto ? (
  <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
    <div className="mb-5 text-lg font-semibold text-slate-900">
      Dettaglio lotto selezionato
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MiniStat
        title="Costo lotto"
        value={euro(toNumber(selectedLotto.costoLotto))}
      />

      <MiniStat
        title="Piante iniziali"
        value={toNumber(selectedLotto.pianteIniziali).toLocaleString("it-IT")}
      />

      <MiniStat
        title="Peso grezzo iniziale"
        value={formatKg(toNumber(selectedLotto.pesoGrezzoIniziale))}
      />

      <MiniStat
        title="Produttore"
        value={selectedLotto.produttore || "—"}
      />
    </div>
  </div>
) : null}
{(() => {
  const resultClass =
    selectedSummary.risultato > 0
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : selectedSummary.risultato < 0
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-amber-200 bg-amber-50 text-amber-800";

  const resultText =
    selectedSummary.risultato > 0
      ? "Il lotto è attualmente in utile."
      : selectedSummary.risultato < 0
        ? "Il lotto è attualmente in perdita."
        : "Il lotto è attualmente in pareggio.";

  return (
    <div className={`mt-6 rounded-2xl border px-4 py-4 text-sm font-semibold shadow-sm ${resultClass}`}>
      {resultText}
    </div>
  );
})()}
        <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ClipboardList size={18} /> Lotti in raccolta · {selectedProduct}
          </div>

          <div className="space-y-4">
            {productLotti.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-500">
                Nessun lotto aperto per {selectedProduct}. Clicca su un giorno nel calendario per iniziare.
              </div>
            ) : (
              productLotti
                .slice()
                .sort((a, b) => b.dataApertura.localeCompare(a.dataApertura))
                .map((lotto) => {
                  const estimate = calculateEstimate(lotto);
                  return (
                    <button
  key={lotto.id}
  type="button"
  onClick={() => setSelectedLottoId(lotto.id)}
  className={`w-full rounded-3xl border p-5 text-left shadow-sm ${
    selectedLottoId === lotto.id
      ? "border-emerald-200 bg-emerald-50/60"
      : "border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)]"
  }`}
>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="text-lg font-semibold text-slate-900">
                            {lotto.codice || "Lotto"} · {lotto.prodotto}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Apertura: {lotto.dataApertura || "—"} · Produttore: {lotto.produttore || "—"}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm">
                            <Tag>{`Costo lotto ${euro(toNumber(lotto.costoLotto))}`}</Tag>
                            <Tag>{`Piante ${estimate.pianteStimate.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`}</Tag>
                            <Tag>{`Peso grezzo ${formatKg(toNumber(lotto.pesoGrezzoIniziale))}`}</Tag>
                            <Tag>{`Peso lavorato teorico ${formatKg(estimate.pesoLavoratoTeorico)}`}</Tag>
                            <Tag>{`Costo teorico/kg ${euro(estimate.costoTeoricoKg)}`}</Tag>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                          {lotto.stato === "aperto" ? "Lotto aperto" : "Lotto chiuso"}
                        </div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>
      </div> 
{selectedLotto ? (
  <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
    <div className="mb-5 text-lg font-semibold text-slate-900">
      Dettaglio lotto selezionato
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MiniStat
        title="Costo lotto"
        value={euro(toNumber(selectedLotto.costoLotto))}
      />

      <MiniStat
        title="Piante iniziali"
        value={toNumber(selectedLotto.pianteIniziali).toLocaleString("it-IT")}
      />

      <MiniStat
        title="Peso grezzo iniziale"
        value={formatKg(toNumber(selectedLotto.pesoGrezzoIniziale))}
      />

      <MiniStat
        title="Produttore"
        value={selectedLotto.produttore || "—"}
      />
    </div>
  </div>
) : null}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Nuovo lotto prodotto
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {selectedProduct} · apertura lotto
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Inserisci i dati iniziali del lotto. Dopo il salvataggio potrai passare alle registrazioni giornaliere.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Prodotto" icon={Leaf}>
                <input value={lottoForm.prodotto} readOnly className={`${inputClass} h-[52px] bg-slate-50`} />
              </Field>

              <Field label="Data apertura" icon={CalendarDays}>
                <input
                  type="date"
                  value={lottoForm.dataApertura}
                  onChange={(e) => updateLottoForm("dataApertura", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                />
              </Field>

              <Field label="Codice lotto" icon={ClipboardList}>
                <input
                  value={lottoForm.codice}
                  onChange={(e) => updateLottoForm("codice", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                  placeholder="Es. FIN-0326-A"
                />
              </Field>

              <Field label="Produttore" icon={Tractor}>
                <input
                  value={lottoForm.produttore}
                  onChange={(e) => updateLottoForm("produttore", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                  placeholder="Produttore / fornitore"
                />
              </Field>

              <Field label="Costo lotto (€)" icon={Save}>
                <input
                  type="number"
                  step="0.01"
                  value={lottoForm.costoLotto}
                  onChange={(e) => updateLottoForm("costoLotto", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                  placeholder="Es. 10000"
                />
              </Field>

              <Field label="Piante iniziali (se note)" icon={Sprout}>
                <input
                  type="number"
                  step="1"
                  value={lottoForm.pianteIniziali}
                  onChange={(e) => updateLottoForm("pianteIniziali", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                  placeholder="Es. 100000"
                />
              </Field>

              <Field label="Peso grezzo iniziale lotto (kg)" icon={Tractor}>
                <input
                  type="number"
                  step="0.01"
                  value={lottoForm.pesoGrezzoIniziale}
                  onChange={(e) => updateLottoForm("pesoGrezzoIniziale", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                  placeholder="Es. 22000"
                />
              </Field>

              <Field label="Peso medio pianta grezza (kg)" icon={Leaf}>
                <input
                  type="number"
                  step="0.01"
                  value={lottoForm.pesoMedioPiantaGrezza}
                  onChange={(e) => updateLottoForm("pesoMedioPiantaGrezza", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                />
              </Field>

              <Field label="Peso medio pianta lavorata (kg)" icon={Leaf}>
                <input
                  type="number"
                  step="0.01"
                  value={lottoForm.pesoMedioPiantaLavorata}
                  onChange={(e) => updateLottoForm("pesoMedioPiantaLavorata", e.target.value)}
                  className={`${inputClass} h-[52px]`}
                />
              </Field>
            </div>

            <div className="mb-6 rounded-[28px] border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="mb-3 text-sm font-semibold text-emerald-800">
                Stima tecnica lotto in apertura
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <MiniStat title="Piante stimate" value={lottoEstimate.pianteStimate.toLocaleString("it-IT", { maximumFractionDigits: 0 })} />
                <MiniStat title="Peso lavorato teorico" value={formatKg(lottoEstimate.pesoLavoratoTeorico)} />
                <MiniStat title="Resa teorica" value={`${lottoEstimate.resaTeorica.toLocaleString("it-IT", { maximumFractionDigits: 1 })}%`} />
                <MiniStat title="Costo per pianta" value={euro(lottoEstimate.costoPerPianta)} />
                <MiniStat title="Costo teorico €/kg" value={euro(lottoEstimate.costoTeoricoKg)} />
              </div>
            </div>

            <Field label="Note generali lotto" icon={ClipboardList}>
              <textarea
                value={lottoForm.noteGenerali}
                onChange={(e) => updateLottoForm("noteGenerali", e.target.value)}
                className={`${inputClass} min-h-[110px] resize-none`}
                placeholder="Annotazioni iniziali del lotto"
              />
            </Field>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveLotto}
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0284c7_0%,_#0369a1_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(2,132,199,0.28)]"
              >
                <Save size={18} /> Salva lotto
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
              >
                <X size={18} /> Chiudi
              </button>
            </div>
          </div>
        </div>
      ) : null}
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

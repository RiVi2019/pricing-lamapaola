"use client";
import ReseLottoMasterDetail from "./ReseLottoMasterDetail";
import React from "react";
import {
  Save,
  Download,
  FileText,
  Search,
  Copy,
  Trash2,
  Package,
  Percent,
  Truck,
  Factory,
  Scale,
  Box,
  Building2,
  Wallet,
  MapPin,
  Settings2,
  type LucideIcon
} from "lucide-react";

type ProductName =
  | "sedano"
  | "prezzemolo liscio"
  | "prezzemolo riccio"
  | "finocchio"
  | "bietola costa"
  | "cicoria catalogna"
  | "aneto"
  | "patate";

type ClientName = string;
type DestinationName = string;
type PalletCode = string;

type PackagingFamily =
  | "IFCO"
  | "CPR SYSTEM"
  | "TOSCA POLYMER"
  | "PLASTICA A PERDERE";

type UnitMode = "kg" | "pz";
type AllocationMode = "kg" | "pz";
type SectionColor = "green" | "sky" | "amber" | "violet";
type MetricTone =
  | "sky"
  | "emerald"
  | "cyan"
  | "violet"
  | "amber"
  | "rose"
  | "slate"
  | "blue";
type AggregateMode = "cliente" | "prodotto" | "imballo";

interface PalletItem {
  code: PalletCode;
  costo: number;
}

interface PackagingItem {
  code: string;
  name: string;
  costo: number;
}

interface FormState {
  scontoCliente: string;
  clienteManuale: string;
  cliente: ClientName;
  nomeProdotto: ProductName;
  codiceLotto: string;
  destinazione: DestinationName;
  unitaMisura: UnitMode;
  unitaCostiAgricoli: UnitMode;
  ripartizioneCostiPedana: AllocationMode;
  pezziPerPedana: string;
  materiaPrima: string;
  resaLavorazione: string;
  pesoPedanaTrasporto: string;
  costoTrasportoPedana: string;
  costoPersonaleRaccolta: string;
  quantitaRaccolta: string;
  costoPersonaleTrasformazione: string;
  pesoTrasformato: string;
  famigliaImballo: PackagingFamily;
  imballoCode: string;
  pesoProdottoPedana: string;
  cassePerPedana: string;
  corrediPedana: string;
  palletType: PalletCode;
  pesoPedanaFinita: string;
  costoLogisticaPedana: string;
  produzioneMensileKg: string;
  costoEnergiaMensile: string;
  costoAmministrazioneMensile: string;
  quantita: string;
  margine: string;
  overrideTrasporto: boolean;
  overrideCostoImballo: string;
  overrideCostoPallet: string;
}

interface QuoteMetrics {
  pesoMedioPezzoKg: number;
  costoAgricolo: number;
  costoIndustriale: number;
  costoConfezionamento: number;
  costoStruttura: number;
  incidenzaAgricoloPercentuale: number;
  incidenzaIndustrialePercentuale: number;
  incidenzaConfezionamentoPercentuale: number;
  incidenzaStrutturaPercentuale: number;
  costoUnitario: number;
  costoUnitarioKg: number;
  costoUnitarioPezzo: number;
  prezzoNetto: number;
  prezzoPareggio: number;
  prezzoMinimoAziendale: number;
  prezzoListinoDaApplicare: number;
  prezzoFinaleScontato: number;
  prezzoFinaleScontatoKg: number;
  prezzoFinaleScontatoPezzo: number;
  scontoCliente: number;
  utileUnitario: number;
  utileTotale: number;
  utilePedana: number;
  redditivitaPercentuale: number;
  costoTrasportoUnitario: number;
  costoRaccoltaUnitario: number;
  costoTrasformazioneUnitario: number;
  costoImballiUnitario: number;
  costoCorrediUnitario: number;
  costoPalletUnitario: number;
  costoLogisticaUnitario: number;
  costoLuceUnitario: number;
  costoAmministrazioneUnitario: number;
}

interface SavedQuote {
  id: string;
  createdAt: string;
  form: FormState;
  metrics: QuoteMetrics;
}

interface AggregateItem {
  label: string;
  count: number;
  avgMargin: number;
  avgListino: number;
  avgCosto: number;
  totalProfit: number;
  totalPedanaProfit: number;
}

interface PricingMasters {
  clienti: ClientName[];
  destinazioni: DestinationName[];
  trasporti: Record<string, number>;
  imballi: Record<PackagingFamily, PackagingItem[]>;
  pallet: PalletItem[];
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
const STORAGE_KEY = "pricing-app-ortofrutta-v12";
const STORAGE_KEY_CLIENTI_ANAGRAFICA = "lamapaola-anagrafiche-clienti-v1";
const MASTERS_KEY = "pricing-app-ortofrutta-v12-masters";
const logoLamapaola = "/logo-lamapaola.jpg";
const FINOCCHIO_COSTO_RACCOLTA = 800;
const FINOCCHIO_QTA_RACCOLTA = 20000;
const MARGINE_AZIENDALE_FISSO = 20;
const PRODUZIONE_MENSILE_DEFAULT = 400000;
const COSTO_ENERGIA_MENSILE_DEFAULT = 3000;
const COSTO_AMMINISTRAZIONE_MENSILE_DEFAULT = 9000;

const REFERENZE: ProductName[] = [
  "sedano",
  "prezzemolo liscio",
  "prezzemolo riccio",
  "finocchio",
  "bietola costa",
  "cicoria catalogna",
  "aneto",
  "patate"
];

const RESE_STANDARD: Record<ProductName, number> = {
  sedano: 90,
  "prezzemolo liscio": 92,
  "prezzemolo riccio": 92,
  finocchio: 80,
  "bietola costa": 88,
  "cicoria catalogna": 86,
  aneto: 90,
  patate: 100
};

const CLIENTI: ClientName[] = [];

const SCONTI_CLIENTE: Record<string, number> = {
  "CONAD ADRIATICO": 3.5,
  "CONAD CENTRO NORD": 3.5,
  "IPER LISCATE": 7,
  "IPER TRUCCAZZANO": 7,
  IPERAL: 7,
  "GEMUSERING STUTTGART": 5,
  ITALBRIX: 10,
  PENNY: 6
};

const FAMIGLIA_IMBALLO_CLIENTE: Record<string, PackagingFamily> = {
  "CONAD ADRIATICO": "CPR SYSTEM",
  "CONAD CENTRO NORD": "CPR SYSTEM",
  "IPER LISCATE": "CPR SYSTEM",
  "IPER TRUCCAZZANO": "CPR SYSTEM",
  "PAM PADOVA": "CPR SYSTEM",
  "PAM PONTEDERA": "CPR SYSTEM",
  "PAM ROMA": "CPR SYSTEM",
  "PAM TREZZANO": "CPR SYSTEM",
  IPERAL: "TOSCA POLYMER",
  SOGEGROSS: "TOSCA POLYMER",
  TIGROS: "TOSCA POLYMER",
  "ARCA DISTRIBUZIONE": "IFCO",
  PENNY: "IFCO",
  "GEMUSERING STUTTGART": "IFCO"
};

const DEFAULT_TRASPORTI: Record<string, number> = {
  "ARCA CESENA": 55,
  "BERGAMO MERCATO": 70,
  "CENTRO 3A ASTI": 80,
  "CONAD GROTTAGLIE": 40,
  "CORSI SPA": 45,
  "FASANO MERCATO": 40,
  "FONDI MERCATO": 45,
  "GRUPPO PRODUTTORI PETRILLO": 45,
  "INTERFRIGO MILANO": 60,
  "IPERAL GIUSSANO": 75,
  ITALBRIX: 65,
  "ORTOFIN LISCATE": 60,
  "ORTOFIN TRUCCAZZANO": 60,
  "ORTOLOG NATOORA": 60,
  "ORTOLOG MILANO": 60,
  "PAM PADOVA": 60,
  "PAM PONTEDERA": 70,
  "PAM ROMA": 55,
  "PAM TREZZANO": 65,
  PANNOZZO: 45,
  "PENNY GIOIA": 35,
  "SAN LIDANO BOLGARE": 70,
  "SAN LIDANO SEZZE": 50,
  SOGEGROSS: 80,
  "SPREAFICO DOLZAGO": 75,
  "TIGROS SPA": 75,
  "TREVISO MERCATO": 70,
  "TORINO MERCATO": 80
};

const DESTINAZIONE_CLIENTE: Record<string, DestinationName> = {
  "ARCA DISTRIBUZIONE": "ARCA CESENA",
  "CENTRO 3A": "CENTRO 3A ASTI",
  IPERAL: "IPERAL GIUSSANO",
  ITALBRIX: "ITALBRIX",
  NATOORA: "ORTOLOG NATOORA",
  "PAM PADOVA": "PAM PADOVA",
  "PAM PONTEDERA": "PAM PONTEDERA",
  "PAM ROMA": "PAM ROMA",
  "PAM TREZZANO": "PAM TREZZANO",
  PENNY: "PENNY GIOIA",
  "SAN LIDANO": "SAN LIDANO SEZZE",
  SOGEGROSS: "SOGEGROSS",
  SPREAFICO: "SPREAFICO DOLZAGO",
  TIGROS: "TIGROS SPA",
  "IPER LISCATE": "ORTOFIN LISCATE",
  "IPER TRUCCAZZANO": "ORTOFIN TRUCCAZZANO"
};

const DEFAULT_PALLET: PalletItem[] = [
  { code: "PR12", costo: 2.0 },
  { code: "PT8120", costo: 2.9 },
  { code: "PIND", costo: 5.0 },
  { code: "EPAL", costo: 0 }
];

const DEFAULT_IMBALLI: Record<PackagingFamily, PackagingItem[]> = {
  IFCO: [
    { code: "IF4314", name: "IFCO 4314", costo: 0.68 },
    { code: "IF6410", name: "IFCO 6410", costo: 0.825 },
    { code: "IF6413", name: "IFCO 6413", costo: 0.94 },
    { code: "IF6416", name: "IFCO 6416", costo: 0.985 },
    { code: "IF6418", name: "IFCO 6418", costo: 1.05 },
    { code: "IF6424", name: "IFCO 6424", costo: 1.14 }
  ],
  "CPR SYSTEM": [
    { code: "CPR6418", name: "CPR 6418", costo: 0.35 },
    { code: "CPR6412", name: "CPR 6412", costo: 0.56 }
  ],
  "TOSCA POLYMER": [
    { code: "PY6413", name: "TOSCA POLYMER 6413", costo: 0.71 },
    { code: "PY6419", name: "TOSCA POLYMER 6419", costo: 0.76 }
  ],
  "PLASTICA A PERDERE": [
    { code: "PL305012", name: "PLASTICA 30x50 H12", costo: 0.54 },
    { code: "PL406017", name: "PLASTICA 40x60 H17", costo: 0.92 }
  ]
};

const CASSE_PER_PEDANA_DEFAULT: Record<string, string[]> = {
  IF4314: ["120"],
  IF6410: ["80"],
  IF6413: ["56"],
  IF6416: ["48", "52"],
  IF6418: ["48"],
  IF6424: ["0"],
  CPR6418: ["48"],
  CPR6412: ["72"],
  PY6413: ["56"],
  PY6419: ["48"],
  PL305012: ["104", "112", "136"],
  PL406017: ["48", "52"]
};

const emptyForm: FormState = {
  scontoCliente: "",
  clienteManuale: "",
  cliente: "",
  nomeProdotto: "sedano",
  codiceLotto: "",
  destinazione: "",
  unitaMisura: "kg",
  unitaCostiAgricoli: "kg",
  ripartizioneCostiPedana: "kg",
  pezziPerPedana: "",
  materiaPrima: "",
  resaLavorazione: String(RESE_STANDARD.sedano),
  pesoPedanaTrasporto: "",
  costoTrasportoPedana: "",
  costoPersonaleRaccolta: "",
  quantitaRaccolta: "",
  costoPersonaleTrasformazione: "",
  pesoTrasformato: "",
  famigliaImballo: "IFCO",
  imballoCode: "IF4314",
  pesoProdottoPedana: "",
  cassePerPedana: "120",
  corrediPedana: "",
  palletType: "PR12",
  pesoPedanaFinita: "",
  costoLogisticaPedana: "",
  produzioneMensileKg: String(PRODUZIONE_MENSILE_DEFAULT),
  costoEnergiaMensile: String(COSTO_ENERGIA_MENSILE_DEFAULT),
  costoAmministrazioneMensile: String(COSTO_AMMINISTRAZIONE_MENSILE_DEFAULT),
  quantita: "1",
  margine: String(MARGINE_AZIENDALE_FISSO),
  overrideTrasporto: false,
  overrideCostoImballo: "",
  overrideCostoPallet: ""
};

const inputClass =
  "w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-800 outline-none transition duration-200 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100";

function clampMin(value: number, min = 0): number {
  return Number.isFinite(value) ? Math.max(value, min) : min;
}

function toNumber(value: string): number {
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function euro(n: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(Number.isFinite(n) ? n : 0);
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, "it"));
}

function getDefaultMasters(): PricingMasters {
  return {
    clienti: sortStrings(CLIENTI),
    destinazioni: sortStrings(Object.keys(DEFAULT_TRASPORTI)),
    trasporti: { ...DEFAULT_TRASPORTI },
    imballi: JSON.parse(JSON.stringify(DEFAULT_IMBALLI)) as Record<PackagingFamily, PackagingItem[]>,
    pallet: JSON.parse(JSON.stringify(DEFAULT_PALLET)) as PalletItem[]
  };
}

function normalizeMasters(raw: PricingMasters | null | undefined): PricingMasters {
  const fallback = getDefaultMasters();
  if (!raw) return fallback;

  const clienti = Array.isArray(raw.clienti) && raw.clienti.length > 0 ? sortStrings(raw.clienti) : fallback.clienti;
  const destinazioniFromRaw = Array.isArray(raw.destinazioni) ? raw.destinazioni : [];
  const trasporti = raw.trasporti && typeof raw.trasporti === "object" ? raw.trasporti : fallback.trasporti;
  const destinazioni = sortStrings(
    Array.from(new Set([...(destinazioniFromRaw as string[]), ...Object.keys(trasporti)]))
  );

  const imballi = (raw.imballi && typeof raw.imballi === "object" ? raw.imballi : fallback.imballi) as Record<PackagingFamily, PackagingItem[]>;
  const pallet = Array.isArray(raw.pallet) && raw.pallet.length > 0 ? raw.pallet : fallback.pallet;

  return {
    clienti,
    destinazioni,
    trasporti: { ...fallback.trasporti, ...trasporti },
    imballi: {
      IFCO: imballi.IFCO ?? fallback.imballi.IFCO,
      "CPR SYSTEM": imballi["CPR SYSTEM"] ?? fallback.imballi["CPR SYSTEM"],
      "TOSCA POLYMER": imballi["TOSCA POLYMER"] ?? fallback.imballi["TOSCA POLYMER"],
      "PLASTICA A PERDERE": imballi["PLASTICA A PERDERE"] ?? fallback.imballi["PLASTICA A PERDERE"]
    },
    pallet
  };
}

function getEffectivePackagingCost(
  overrideCostoImballo: string,
  imballoSelezionato: PackagingItem | null
): number {
  return clampMin(toNumber(overrideCostoImballo || String(imballoSelezionato?.costo ?? 0)));
}

function getEffectivePalletCost(overrideCostoPallet: string, palletSelezionato: PalletItem): number {
  return clampMin(toNumber(overrideCostoPallet || String(palletSelezionato.costo)));
}

function aggregateMetrics(savedQuotes: SavedQuote[], mode: AggregateMode): AggregateItem[] {
  const groups = new Map<string, AggregateItem & { sumMargin: number; sumListino: number; sumCosto: number }>();

  savedQuotes.forEach((item) => {
    const key =
      mode === "cliente"
        ? item.form.clienteManuale.trim() || item.form.cliente || "—"
        : mode === "prodotto"
          ? item.form.nomeProdotto
          : item.form.imballoCode || "—";

    const current = groups.get(key) ?? {
      label: key,
      count: 0,
      avgMargin: 0,
      avgListino: 0,
      avgCosto: 0,
      totalProfit: 0,
      totalPedanaProfit: 0,
      sumMargin: 0,
      sumListino: 0,
      sumCosto: 0
    };

    current.count += 1;
    current.sumMargin += item.metrics.utileUnitario;
    current.sumListino += item.metrics.prezzoListinoDaApplicare;
    current.sumCosto += item.metrics.costoUnitario;
    current.totalProfit += item.metrics.utileTotale;
    current.totalPedanaProfit += item.metrics.utilePedana;
    groups.set(key, current);
  });

  return Array.from(groups.values())
    .map((item) => ({
      label: item.label,
      count: item.count,
      avgMargin: item.count > 0 ? item.sumMargin / item.count : 0,
      avgListino: item.count > 0 ? item.sumListino / item.count : 0,
      avgCosto: item.count > 0 ? item.sumCosto / item.count : 0,
      totalProfit: item.totalProfit,
      totalPedanaProfit: item.totalPedanaProfit
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit)
    .slice(0, 8);
}

function buildMetrics(form: FormState, masters: PricingMasters): QuoteMetrics {
  const imballiFamiglia = masters.imballi[form.famigliaImballo] ?? [];
  const imballoSelezionato = imballiFamiglia.find((item) => item.code === form.imballoCode) ?? imballiFamiglia[0] ?? null;
  const palletSelezionato = masters.pallet.find((item) => item.code === form.palletType) ?? masters.pallet[0];

  const costoImballoUnitario = getEffectivePackagingCost(form.overrideCostoImballo, imballoSelezionato);
  const costoPalletSelezionato = getEffectivePalletCost(form.overrideCostoPallet, palletSelezionato);

  const values = {
    materiaPrima: clampMin(toNumber(form.materiaPrima)),
    resaLavorazione: Math.min(clampMin(toNumber(form.resaLavorazione)), 100),
    pesoPedanaTrasportoInput: clampMin(toNumber(form.pesoPedanaTrasporto)),
    costoTrasportoPedana: clampMin(toNumber(form.costoTrasportoPedana)),
    costoPersonaleRaccolta: clampMin(toNumber(form.costoPersonaleRaccolta)),
    quantitaRaccoltaInput: clampMin(toNumber(form.quantitaRaccolta)),
    costoPersonaleTrasformazione: clampMin(toNumber(form.costoPersonaleTrasformazione)),
    pesoTrasformatoInput: clampMin(toNumber(form.pesoTrasformato)),
    pesoProdottoPedana: clampMin(toNumber(form.pesoProdottoPedana)),
    pesoPedanaFinita: clampMin(toNumber(form.pesoPedanaFinita)),
    pezziPerPedana: clampMin(toNumber(form.pezziPerPedana)),
    cassePerPedana: clampMin(toNumber(String(form.cassePerPedana).split("/")[0])),
    corrediPedana: clampMin(toNumber(form.corrediPedana)),
    costoLogisticaPedana: clampMin(toNumber(form.costoLogisticaPedana)),
    produzioneMensileKg: clampMin(toNumber(form.produzioneMensileKg)),
    costoEnergiaMensile: clampMin(toNumber(form.costoEnergiaMensile)),
    costoAmministrazioneMensile: clampMin(toNumber(form.costoAmministrazioneMensile)),
    quantita: Math.max(clampMin(toNumber(form.quantita)), 1),
    margine: Math.min(clampMin(toNumber(form.margine)), 99.99),
    scontoCliente: clampMin(toNumber(form.scontoCliente) || SCONTI_CLIENTE[form.cliente] || 0)
  };

  const pesoPedanaCalcolo = values.pesoProdottoPedana || values.pesoPedanaFinita;
  const pesoMedioPezzoKg =
    values.pezziPerPedana > 0 && pesoPedanaCalcolo > 0 ? pesoPedanaCalcolo / values.pezziPerPedana : 0;

  const kgToPz = (valueKg: number): number => (pesoMedioPezzoKg > 0 ? valueKg * pesoMedioPezzoKg : 0);
  const pzToKg = (valuePz: number): number => (pesoMedioPezzoKg > 0 ? valuePz / pesoMedioPezzoKg : 0);

  const pesoPedanaTrasportoKg = form.unitaCostiAgricoli === "pz" ? pzToKg(values.pesoPedanaTrasportoInput) : values.pesoPedanaTrasportoInput;
  const quantitaRaccoltaKg = form.unitaCostiAgricoli === "pz" ? pzToKg(values.quantitaRaccoltaInput) : values.quantitaRaccoltaInput;
  const pesoTrasformatoKg = form.unitaCostiAgricoli === "pz" ? pzToKg(values.pesoTrasformatoInput) : values.pesoTrasformatoInput;

  const costoTrasportoUnitarioKg = pesoPedanaTrasportoKg > 0 ? values.costoTrasportoPedana / pesoPedanaTrasportoKg : 0;

  const costoRaccoltaUnitarioKg =
    form.nomeProdotto === "finocchio"
      ? FINOCCHIO_COSTO_RACCOLTA / FINOCCHIO_QTA_RACCOLTA
      : quantitaRaccoltaKg > 0
        ? values.costoPersonaleRaccolta / quantitaRaccoltaKg
        : 0;

  const costoTrasformazioneUnitarioKg = pesoTrasformatoKg > 0 ? values.costoPersonaleTrasformazione / pesoTrasformatoKg : 0;
  const resaDecimale = values.resaLavorazione > 0 ? values.resaLavorazione / 100 : 1;
  const materiaPrimaRealeKg = resaDecimale > 0 ? values.materiaPrima / resaDecimale : values.materiaPrima;

  const allocatePedanaCost = (totalePedana: number): { kg: number; pz: number } => {
    if (form.ripartizioneCostiPedana === "pz") {
      const pz = values.pezziPerPedana > 0 ? totalePedana / values.pezziPerPedana : 0;
      return { kg: pzToKg(pz), pz };
    }
    const kg = pesoPedanaCalcolo > 0 ? totalePedana / pesoPedanaCalcolo : 0;
    return { kg, pz: kgToPz(kg) };
  };

  const costiImballi = allocatePedanaCost(costoImballoUnitario * values.cassePerPedana);
  const costiCorredi = allocatePedanaCost(values.corrediPedana);
  const costiPallet = allocatePedanaCost(costoPalletSelezionato);
  const costiLogistica = allocatePedanaCost(values.costoLogisticaPedana);

  const costoEnergiaUnitarioKg = values.produzioneMensileKg > 0 ? values.costoEnergiaMensile / values.produzioneMensileKg : 0;
  const costoAmministrazioneUnitarioKg = values.produzioneMensileKg > 0 ? values.costoAmministrazioneMensile / values.produzioneMensileKg : 0;

  const costoAgricoloKg = materiaPrimaRealeKg + costoRaccoltaUnitarioKg + costoTrasportoUnitarioKg;
  const costoIndustrialeKg = costoTrasformazioneUnitarioKg + costiLogistica.kg;
  const costoConfezionamentoKg = costiImballi.kg + costiCorredi.kg + costiPallet.kg;
  const costoStrutturaKg = costoEnergiaUnitarioKg + costoAmministrazioneUnitarioKg;
  const costoUnitarioKg = costoAgricoloKg + costoIndustrialeKg + costoConfezionamentoKg + costoStrutturaKg;

  const costoAgricoloPezzo = kgToPz(costoAgricoloKg);
  const costoIndustrialePezzo = kgToPz(costoIndustrialeKg);
  const costoConfezionamentoPezzo = costiImballi.pz + costiCorredi.pz + costiPallet.pz;
  const costoStrutturaPezzo = kgToPz(costoStrutturaKg);
  const costoUnitarioPezzo = costoAgricoloPezzo + costoIndustrialePezzo + costoConfezionamentoPezzo + costoStrutturaPezzo;

  const prezzoNettoKg = values.margine >= 100 ? 0 : costoUnitarioKg / (1 - values.margine / 100);
  const prezzoNettoPezzo = values.margine >= 100 ? 0 : costoUnitarioPezzo / (1 - values.margine / 100);

  const prezzoListinoDaApplicareKg = 1 - values.scontoCliente / 100 > 0 ? prezzoNettoKg / (1 - values.scontoCliente / 100) : prezzoNettoKg;
  const prezzoListinoDaApplicarePezzo = 1 - values.scontoCliente / 100 > 0 ? prezzoNettoPezzo / (1 - values.scontoCliente / 100) : prezzoNettoPezzo;

  const prezzoFinaleScontatoKg = prezzoListinoDaApplicareKg * (1 - values.scontoCliente / 100);
  const prezzoFinaleScontatoPezzo = prezzoListinoDaApplicarePezzo * (1 - values.scontoCliente / 100);

  const usaPezzo = form.unitaMisura === "pz";
  const costoUnitario = usaPezzo ? costoUnitarioPezzo : costoUnitarioKg;
  const prezzoNetto = usaPezzo ? prezzoNettoPezzo : prezzoNettoKg;
  const prezzoPareggio = costoUnitario;
  const prezzoMinimoAziendale = costoUnitario * (1 + MARGINE_AZIENDALE_FISSO / 100);
  const prezzoListinoDaApplicare = usaPezzo ? prezzoListinoDaApplicarePezzo : prezzoListinoDaApplicareKg;
  const prezzoFinaleScontato = usaPezzo ? prezzoFinaleScontatoPezzo : prezzoFinaleScontatoKg;
  const utileUnitario = prezzoFinaleScontato - costoUnitario;
  const utileTotale = utileUnitario * values.quantita;
  const utilePedana = usaPezzo ? utileUnitario * values.pezziPerPedana : utileUnitario * pesoPedanaCalcolo;
  const redditivitaPercentuale = costoUnitario > 0 ? (utileUnitario / costoUnitario) * 100 : 0;

  const costoAgricolo = usaPezzo ? costoAgricoloPezzo : costoAgricoloKg;
  const costoIndustriale = usaPezzo ? costoIndustrialePezzo : costoIndustrialeKg;
  const costoConfezionamento = usaPezzo ? costoConfezionamentoPezzo : costoConfezionamentoKg;
  const costoStruttura = usaPezzo ? costoStrutturaPezzo : costoStrutturaKg;

  return {
    pesoMedioPezzoKg,
    costoAgricolo,
    costoIndustriale,
    costoConfezionamento,
    costoStruttura,
    incidenzaAgricoloPercentuale: costoUnitario > 0 ? (costoAgricolo / costoUnitario) * 100 : 0,
    incidenzaIndustrialePercentuale: costoUnitario > 0 ? (costoIndustriale / costoUnitario) * 100 : 0,
    incidenzaConfezionamentoPercentuale: costoUnitario > 0 ? (costoConfezionamento / costoUnitario) * 100 : 0,
    incidenzaStrutturaPercentuale: costoUnitario > 0 ? (costoStruttura / costoUnitario) * 100 : 0,
    costoUnitario,
    costoUnitarioKg,
    costoUnitarioPezzo,
    prezzoNetto,
    prezzoPareggio,
    prezzoMinimoAziendale,
    prezzoListinoDaApplicare,
    prezzoFinaleScontato,
    prezzoFinaleScontatoKg,
    prezzoFinaleScontatoPezzo,
    scontoCliente: values.scontoCliente,
    utileUnitario,
    utileTotale,
    utilePedana,
    redditivitaPercentuale,
    costoTrasportoUnitario: usaPezzo ? kgToPz(costoTrasportoUnitarioKg) : costoTrasportoUnitarioKg,
    costoRaccoltaUnitario: usaPezzo ? kgToPz(costoRaccoltaUnitarioKg) : costoRaccoltaUnitarioKg,
    costoTrasformazioneUnitario: usaPezzo ? kgToPz(costoTrasformazioneUnitarioKg) : costoTrasformazioneUnitarioKg,
    costoImballiUnitario: usaPezzo ? costiImballi.pz : costiImballi.kg,
    costoCorrediUnitario: usaPezzo ? costiCorredi.pz : costiCorredi.kg,
    costoPalletUnitario: usaPezzo ? costiPallet.pz : costiPallet.kg,
    costoLogisticaUnitario: usaPezzo ? costiLogistica.pz : costiLogistica.kg,
    costoLuceUnitario: usaPezzo ? kgToPz(costoEnergiaUnitarioKg) : costoEnergiaUnitarioKg,
    costoAmministrazioneUnitario: usaPezzo ? kgToPz(costoAmministrazioneUnitarioKg) : costoAmministrazioneUnitarioKg
  };
}

export default function PricingApp(): React.JSX.Element {
  const [form, setForm] = React.useState<FormState>({ ...emptyForm });
  const [savedQuotes, setSavedQuotes] = React.useState<SavedQuote[]>([]);
  const [masters, setMasters] = React.useState<PricingMasters>(getDefaultMasters());
  const [search, setSearch] = React.useState("");
  const [notification, setNotification] = React.useState("");
  const [showAdmin, setShowAdmin] = React.useState(false);
  const [newCliente, setNewCliente] = React.useState("");
  const [newDestinazione, setNewDestinazione] = React.useState("");
  const [newDestinazioneCosto, setNewDestinazioneCosto] = React.useState("");
  const [newImballoFamily, setNewImballoFamily] = React.useState<PackagingFamily>("IFCO");
  const [newImballoCode, setNewImballoCode] = React.useState("");
  const [newImballoName, setNewImballoName] = React.useState("");
  const [newImballoCosto, setNewImballoCosto] = React.useState("");
  const [newPalletCode, setNewPalletCode] = React.useState("");
  const [newPalletCosto, setNewPalletCosto] = React.useState("");
  const [clientiAnagrafica, setClientiAnagrafica] = React.useState<ClienteAnagraficaStored[]>([]);
  const clientiDisponibili = clientiAnagrafica
  .map((item) => item.denominazione)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, "it"));

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedQuotes(JSON.parse(stored) as SavedQuote[]);
      } catch {
        setSavedQuotes([]);
      }
    }

    const storedMasters = localStorage.getItem(MASTERS_KEY);
    if (storedMasters) {
      try {
        setMasters(normalizeMasters(JSON.parse(storedMasters) as PricingMasters));
      } catch {
        setMasters(getDefaultMasters());
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  React.useEffect(() => {
    localStorage.setItem(MASTERS_KEY, JSON.stringify(masters));
  }, [masters]);

  React.useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  React.useEffect(() => {
    if (!form.destinazione || form.overrideTrasporto) return;
    const prezzo = masters.trasporti[form.destinazione] ?? 0;
    if (Number.isFinite(prezzo)) {
      setForm((prev) => ({ ...prev, costoTrasportoPedana: String(prezzo) }));
    }
  }, [form.destinazione, form.overrideTrasporto, masters.trasporti]);
  React.useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY_CLIENTI_ANAGRAFICA);
  if (!stored) {
    setClientiAnagrafica([]);
    return;
  }

  try {
    setClientiAnagrafica(JSON.parse(stored) as ClienteAnagraficaStored[]);
  } catch {
    setClientiAnagrafica([]);
  }
}, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

   const updateCliente = (cliente: ClientName): void => {
  if (!cliente) {
    setForm((prev) => ({
      ...prev,
      cliente: "",
      destinazione: "",
      costoTrasportoPedana: "",
      scontoCliente: "",
    }));
    return;
  }

  const clienteAnagrafica = clientiAnagrafica.find(
    (item) => item.denominazione === cliente
  );

  const destinazioneAutomatica = clienteAnagrafica?.piattaformaScarico || "";
  const trasportoAutomatico = clienteAnagrafica?.costoTrasporto || "";
  const scontoAutomatico = clienteAnagrafica?.scontistica || "";

  const famigliaForzata = FAMIGLIA_IMBALLO_CLIENTE[cliente];

  if (!famigliaForzata) {
    setForm((prev) => ({
      ...prev,
      cliente,
      destinazione: destinazioneAutomatica,
      costoTrasportoPedana:
        prev.overrideTrasporto && prev.costoTrasportoPedana
          ? prev.costoTrasportoPedana
          : trasportoAutomatico,
      scontoCliente: scontoAutomatico,
    }));
    return;
  }

  const primoImballo = masters.imballi[famigliaForzata][0];
  const opzioni = CASSE_PER_PEDANA_DEFAULT[primoImballo.code] ?? ["0"];

  setForm((prev) => ({
    ...prev,
    cliente,
    destinazione: destinazioneAutomatica,
    costoTrasportoPedana:
      prev.overrideTrasporto && prev.costoTrasportoPedana
        ? prev.costoTrasportoPedana
        : trasportoAutomatico,
    scontoCliente: scontoAutomatico,
    famigliaImballo: famigliaForzata,
    imballoCode: primoImballo.code,
    cassePerPedana: opzioni[0] ?? "0",
  }));
};

  const updateProdotto = (prodotto: ProductName): void => {
    setForm((prev) => ({
      ...prev,
      nomeProdotto: prodotto,
      resaLavorazione: String(RESE_STANDARD[prodotto])
    }));
  };

  const updateImballoCode = (code: string): void => {
    const opzioni = CASSE_PER_PEDANA_DEFAULT[code] ?? ["0"];
    setForm((prev) => ({
      ...prev,
      imballoCode: code,
      cassePerPedana: opzioni[0] ?? "0"
    }));
  };

  const updateTrasportoMaster = (dest: string, value: string): void => {
    setMasters((prev) => ({
      ...prev,
      trasporti: { ...prev.trasporti, [dest]: clampMin(toNumber(value)) }
    }));
  };

  const addClienteMaster = (): void => {
    const value = newCliente.trim().toUpperCase();
    if (!value) return;
    setMasters((prev) => ({ ...prev, clienti: sortStrings(Array.from(new Set([...prev.clienti, value]))) }));
    setNewCliente("");
    setNotification("Cliente aggiunto in anagrafica");
  };

  const addDestinazioneMaster = (): void => {
    const value = newDestinazione.trim().toUpperCase();
    if (!value) return;
    setMasters((prev) => ({
      ...prev,
      destinazioni: sortStrings(Array.from(new Set([...prev.destinazioni, value]))),
      trasporti: { ...prev.trasporti, [value]: clampMin(toNumber(newDestinazioneCosto)) }
    }));
    setNewDestinazione("");
    setNewDestinazioneCosto("");
    setNotification("Destinazione aggiunta in anagrafica");
  };

  const addImballoMaster = (): void => {
    const code = newImballoCode.trim().toUpperCase();
    const name = newImballoName.trim();
    if (!code || !name) return;
    setMasters((prev) => ({
      ...prev,
      imballi: {
        ...prev.imballi,
        [newImballoFamily]: prev.imballi[newImballoFamily].some((item) => item.code === code)
          ? prev.imballi[newImballoFamily]
          : [...prev.imballi[newImballoFamily], { code, name, costo: clampMin(toNumber(newImballoCosto)) }]
      }
    }));
    setNewImballoCode("");
    setNewImballoName("");
    setNewImballoCosto("");
    setNotification("Imballo aggiunto in anagrafica");
  };

  const addPalletMaster = (): void => {
    const code = newPalletCode.trim().toUpperCase();
    if (!code) return;
    setMasters((prev) => ({
      ...prev,
      pallet: prev.pallet.some((item) => item.code === code)
        ? prev.pallet
        : [...prev.pallet, { code, costo: clampMin(toNumber(newPalletCosto)) }]
    }));
    setNewPalletCode("");
    setNewPalletCosto("");
    setNotification("Pallet aggiunto in anagrafica");
  };

  const updateImballoMaster = (
    family: PackagingFamily,
    code: string,
    field: "name" | "costo",
    value: string
  ): void => {
    setMasters((prev) => ({
      ...prev,
      imballi: {
        ...prev.imballi,
        [family]: prev.imballi[family].map((item) =>
          item.code === code ? { ...item, [field]: field === "costo" ? clampMin(toNumber(value)) : value } : item
        )
      }
    }));
  };

  const updatePalletMaster = (code: string, value: string): void => {
    setMasters((prev) => ({
      ...prev,
      pallet: prev.pallet.map((item) => (item.code === code ? { ...item, costo: clampMin(toNumber(value)) } : item))
    }));
  };

  const resetMasters = (): void => {
    setMasters(getDefaultMasters());
    setNotification("Anagrafiche costi ripristinate");
  };

  const metrics = React.useMemo(() => buildMetrics(form, masters), [form, masters]);
  const imballiFamiglia = masters.imballi[form.famigliaImballo] ?? [];
  const opzioniCassePerPedana = CASSE_PER_PEDANA_DEFAULT[form.imballoCode] ?? ["0"];
  const imballoSelezionato = imballiFamiglia.find((item) => item.code === form.imballoCode) ?? imballiFamiglia[0] ?? null;
  const palletSelezionato = masters.pallet.find((item) => item.code === form.palletType) ?? masters.pallet[0];
  const costoImballoAttivo = getEffectivePackagingCost(form.overrideCostoImballo, imballoSelezionato);
  const costoPalletAttivo = getEffectivePalletCost(form.overrideCostoPallet, palletSelezionato);
  const famigliaBloccata = Boolean(form.cliente && FAMIGLIA_IMBALLO_CLIENTE[form.cliente]);
  const clienteEffettivo = form.clienteManuale.trim() || form.cliente || "—";
  const pesoPedanaCalcolo = clampMin(toNumber(form.pesoProdottoPedana)) || clampMin(toNumber(form.pesoPedanaFinita));

  const alerts = [
    form.unitaMisura === "pz" && metrics.pesoMedioPezzoKg <= 0
      ? "Compila peso pedana e pezzi per pedana per avere un calcolo affidabile a pezzo."
      : "",
    !form.destinazione
      ? "Seleziona una destinazione per valorizzare automaticamente il trasporto a pedana."
      : "",
    metrics.prezzoFinaleScontato < metrics.prezzoPareggio
      ? "Il prezzo finale è sotto il prezzo di pareggio."
      : "",
    metrics.prezzoFinaleScontato >= metrics.prezzoPareggio && metrics.prezzoFinaleScontato < metrics.prezzoMinimoAziendale
      ? "Il prezzo copre i costi ma è sotto la soglia minima aziendale."
      : ""
  ].filter(Boolean);

  const saveQuote = (): void => {
    const item: SavedQuote = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toLocaleString("it-IT"),
      form: { ...form },
      metrics
    };
    setSavedQuotes((prev) => [item, ...prev]);
    setNotification("Scheda salvata nello storico");
  };

  const loadQuote = (item: SavedQuote): void => {
    setForm({ ...emptyForm, ...item.form });
    setNotification("Scheda caricata");
  };

  const duplicateQuote = (item: SavedQuote): void => {
    setSavedQuotes((prev) => [
      {
        ...item,
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        createdAt: new Date().toLocaleString("it-IT")
      },
      ...prev
    ]);
    setNotification("Scheda duplicata");
  };

  const deleteQuote = (id: string): void => {
    setSavedQuotes((prev) => prev.filter((item) => item.id !== id));
    setNotification("Scheda eliminata");
  };

  const resetForm = (): void => {
    setForm({ ...emptyForm });
    setNotification("Nuova scheda pronta");
  };

  const exportCSV = (): void => {
    const header = [
      "Data",
      "Cliente da listino",
      "Cliente manuale",
      "Referenza",
      "Lotto",
      "Destinazione",
      "Unità vendita",
      "Costo trasporto pedana",
      "Costo unitario",
      "Prezzo finale",
      "Utile unitario",
      "Utile totale"
    ];

    const current: SavedQuote = {
      id: "current",
      createdAt: new Date().toLocaleString("it-IT"),
      form: { ...form },
      metrics
    };

    const data = [current, ...savedQuotes].map((item) => [
      item.createdAt,
      item.form.cliente,
      item.form.clienteManuale,
      item.form.nomeProdotto,
      item.form.codiceLotto,
      item.form.destinazione,
      item.form.unitaMisura,
      item.form.costoTrasportoPedana,
      item.metrics.costoUnitario,
      item.metrics.prezzoFinaleScontato,
      item.metrics.utileUnitario,
      item.metrics.utileTotale
    ]);

    const csv = [header, ...data]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "storico-prezzi-ortofrutta.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotification("Export CSV completato");
  };

  const filteredQuotes = savedQuotes.filter((item) => {
    const target = `${item.form.cliente} ${item.form.clienteManuale} ${item.form.nomeProdotto} ${item.form.codiceLotto} ${item.form.imballoCode} ${item.form.destinazione}`.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.20),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.14),_transparent_24%),linear-gradient(135deg,_#f0fbff_0%,_#f7feff_36%,_#dcfce7_100%)] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <HeaderCard
          onSave={saveQuote}
          onExport={exportCSV}
          onReset={resetForm}
          onToggleAdmin={() => setShowAdmin((prev) => !prev)}
          adminOpen={showAdmin}
        />

        {notification ? <NotificationBanner message={notification} /> : null}

        {showAdmin ? (
          <SurfaceCard title="Versione 12 · Anagrafiche dinamiche" className="mb-6">
            <div className="mb-4 text-sm text-slate-600">
              Qui puoi modificare i costi base dell'app e aggiungere nuovi clienti, destinazioni, imballi e pallet. Le variazioni restano salvate nel browser.
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
              <AdminMasterCard title="Nuovo cliente" subtitle="Aggiungi cliente in listino">
                <input value={newCliente} onChange={(e) => setNewCliente(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Es. ESSELUNGA" />
                <button type="button" onClick={addClienteMaster} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Aggiungi cliente</button>
              </AdminMasterCard>

              <AdminMasterCard title="Nuova destinazione" subtitle="Aggiungi destinazione e costo">
                <input value={newDestinazione} onChange={(e) => setNewDestinazione(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Es. MILANO ORTOMERCATO" />
                <input type="number" step="0.01" min="0" value={newDestinazioneCosto} onChange={(e) => setNewDestinazioneCosto(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Costo €/pedana" />
                <button type="button" onClick={addDestinazioneMaster} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Aggiungi destinazione</button>
              </AdminMasterCard>

              <AdminMasterCard title="Nuovo imballo" subtitle="Aggiungi codice, nome e costo">
                <select value={newImballoFamily} onChange={(e) => setNewImballoFamily(e.target.value as PackagingFamily)} className={`${inputClass} h-[46px]`}>
                  {(Object.keys(masters.imballi) as PackagingFamily[]).map((family) => (
                    <option key={family} value={family}>{family}</option>
                  ))}
                </select>
                <input value={newImballoCode} onChange={(e) => setNewImballoCode(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Codice imballo" />
                <input value={newImballoName} onChange={(e) => setNewImballoName(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Nome imballo" />
                <input type="number" step="0.01" min="0" value={newImballoCosto} onChange={(e) => setNewImballoCosto(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Costo €/cassa" />
                <button type="button" onClick={addImballoMaster} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Aggiungi imballo</button>
              </AdminMasterCard>

              <AdminMasterCard title="Nuovo pallet" subtitle="Aggiungi pallet utilizzabile">
                <input value={newPalletCode} onChange={(e) => setNewPalletCode(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Codice pallet" />
                <input type="number" step="0.01" min="0" value={newPalletCosto} onChange={(e) => setNewPalletCosto(e.target.value)} className={`${inputClass} h-[46px]`} placeholder="Costo €/pallet" />
                <button type="button" onClick={addPalletMaster} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Aggiungi pallet</button>
              </AdminMasterCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <AdminMasterCard title="Trasporti per destinazione" subtitle="€/pedana">
                {masters.destinazioni.map((dest) => (
                  <AdminRow key={dest} label={dest}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={masters.trasporti[dest] ?? 0}
                      onChange={(e) => updateTrasportoMaster(dest, e.target.value)}
                      className={`${inputClass} h-[46px]`}
                    />
                  </AdminRow>
                ))}
              </AdminMasterCard>

              <AdminMasterCard title="Imballi" subtitle="Costo standard €/cassa">
                {(Object.keys(masters.imballi) as PackagingFamily[]).map((family) => (
                  <div key={family} className="mb-4 rounded-2xl border border-slate-100 p-3">
                    <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{family}</div>
                    <div className="space-y-3">
                      {masters.imballi[family].map((item) => (
                        <div key={item.code} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_100px]">
                          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                            {item.code} · {item.name}
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.costo}
                            onChange={(e) => updateImballoMaster(family, item.code, "costo", e.target.value)}
                            className={`${inputClass} h-[42px]`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </AdminMasterCard>

              <AdminMasterCard title="Pallet" subtitle="Costo standard €/pallet">
                {masters.pallet.map((item) => (
                  <AdminRow key={item.code} label={item.code}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.costo}
                      onChange={(e) => updatePalletMaster(item.code, e.target.value)}
                      className={`${inputClass} h-[46px]`}
                    />
                  </AdminRow>
                ))}
                <button type="button" onClick={resetMasters} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  Ripristina costi standard
                </button>
              </AdminMasterCard>
            </div>
          </SurfaceCard>
        ) : null}

        {alerts.length > 0 ? (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <AlertCard key={`${alert}-${index}`} text={alert} />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SurfaceCard className="xl:col-span-2">
            <ClientReferenceBlock
  form={form}
  clienti={clientiDisponibili}
  update={update}
  updateCliente={updateCliente}
  updateProdotto={updateProdotto}
/>
            {form.nomeProdotto === "finocchio" ? (
              <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                Per <strong>finocchio</strong> il costo raccolta è fisso: € 800 su 20.000 kg, pari a <strong>{euro(FINOCCHIO_COSTO_RACCOLTA / FINOCCHIO_QTA_RACCOLTA)}</strong> per kg.
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:items-stretch">
              <SectionBadge icon={Package} color="green">Costi agricoli e resa</SectionBadge>
              <Spacer />

              <InputCard icon={Package} label="Costo materia prima unitario (€ / kg o pianta)">
                <NumberInput value={form.materiaPrima} onChange={(v) => update("materiaPrima", v)} />
              </InputCard>

              <InputCard icon={Percent} label="Resa lavorazione (%)">
                <NumberInput value={form.resaLavorazione} onChange={(v) => update("resaLavorazione", v)} />
              </InputCard>

              <InputCard icon={Scale} label="Unità campi agricoli e resa">
                <select value={form.unitaCostiAgricoli} onChange={(e) => update("unitaCostiAgricoli", e.target.value as UnitMode)} className={`${inputClass} h-[52px]`}>
                  <option value="kg">kg</option>
                  <option value="pz">pz</option>
                </select>
              </InputCard>

              <InputCard icon={Truck} label={`Peso pedana trasporto (${form.unitaCostiAgricoli})`}>
                <NumberInput value={form.pesoPedanaTrasporto} onChange={(v) => update("pesoPedanaTrasporto", v)} />
              </InputCard>

              <InputCard icon={Truck} label="Costo trasporto pedana (€)">
                <NumberInput value={form.costoTrasportoPedana} onChange={(v) => update("costoTrasportoPedana", v)} />
              </InputCard>

              <InputCard icon={Factory} label="Costo personale raccolta (€)">
                <NumberInput value={form.costoPersonaleRaccolta} onChange={(v) => update("costoPersonaleRaccolta", v)} disabled={form.nomeProdotto === "finocchio"} />
              </InputCard>

              <InputCard icon={Scale} label={`Quantità raccolta (${form.unitaCostiAgricoli})`}>
                <NumberInput value={form.quantitaRaccolta} onChange={(v) => update("quantitaRaccolta", v)} disabled={form.nomeProdotto === "finocchio"} />
              </InputCard>

              <InputCard icon={Factory} label="Costo personale trasformazione (€)">
                <NumberInput value={form.costoPersonaleTrasformazione} onChange={(v) => update("costoPersonaleTrasformazione", v)} />
              </InputCard>

              <InputCard icon={Scale} label={`Peso merce trasformata (${form.unitaCostiAgricoli})`}>
                <NumberInput value={form.pesoTrasformato} onChange={(v) => update("pesoTrasformato", v)} />
              </InputCard>

              <SectionBadge icon={Truck} color="sky">Destinazione e trasporto</SectionBadge>
              <Spacer />

              <InputCard icon={MapPin} label="Destinazione">
                <select value={form.destinazione} onChange={(e) => update("destinazione", e.target.value)} className={`${inputClass} h-[52px]`}>
                  <option value="">Seleziona destinazione</option>
                  {masters.destinazioni.map((dest) => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </InputCard>

              <InputCard icon={Truck} label="Trasporto da destinazione (€/pedana)">
                <div className="flex h-full flex-col gap-3 justify-start">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.overrideTrasporto}
                      onChange={(e) =>
                        setForm((prev) => {
                          const checked = e.target.checked;
                          const costoAutomatico = prev.destinazione ? String(masters.trasporti[prev.destinazione] ?? prev.costoTrasportoPedana) : prev.costoTrasportoPedana;
                          return {
                            ...prev,
                            overrideTrasporto: checked,
                            costoTrasportoPedana: checked ? prev.costoTrasportoPedana : costoAutomatico
                          };
                        })
                      }
                    />
                    Modifica manualmente il costo trasporto
                  </label>
                  <NumberInput value={form.costoTrasportoPedana} onChange={(v) => update("costoTrasportoPedana", v)} />
                  <div className="text-xs text-slate-500">
                    {form.overrideTrasporto
                      ? "Valore manuale attivo: il costo non viene sovrascritto dalla destinazione."
                      : "Valore automatico attivo: cambiando destinazione il costo si aggiorna dalle anagrafiche."}
                  </div>
                </div>
              </InputCard>

              <SectionBadge icon={Box} color="sky">Confezionamento e palletizzazione</SectionBadge>
              <Spacer />

              <InputCard icon={Scale} label="Unità di vendita finale">
                <select value={form.unitaMisura} onChange={(e) => update("unitaMisura", e.target.value as UnitMode)} className={`${inputClass} h-[52px]`}>
                  <option value="kg">kg</option>
                  <option value="pz">pz</option>
                </select>
              </InputCard>

              <InputCard icon={Scale} label="Ripartizione costi di pedana">
                <select value={form.ripartizioneCostiPedana} onChange={(e) => update("ripartizioneCostiPedana", e.target.value as AllocationMode)} className={`${inputClass} h-[52px]`}>
                  <option value="kg">Ripartisci per kg</option>
                  <option value="pz">Ripartisci per pz</option>
                </select>
              </InputCard>

              <InputCard icon={Box} label="Famiglia imballo">
                <select
                  value={form.famigliaImballo}
                  disabled={famigliaBloccata}
                  onChange={(e) => {
                    const famiglia = e.target.value as PackagingFamily;
                    const primo = masters.imballi[famiglia][0];
                    setForm((prev) => ({
                      ...prev,
                      famigliaImballo: famiglia,
                      imballoCode: primo.code,
                      cassePerPedana: CASSE_PER_PEDANA_DEFAULT[primo.code]?.[0] ?? "0"
                    }));
                  }}
                  className={`${inputClass} h-[52px]`}
                >
                  {(Object.keys(masters.imballi) as PackagingFamily[]).map((famiglia) => (
                    <option key={famiglia} value={famiglia}>{famiglia}</option>
                  ))}
                </select>
              </InputCard>

              <InputCard icon={Box} label="Misura cassa">
                <div className="space-y-3">
                  <select value={form.imballoCode} onChange={(e) => updateImballoCode(e.target.value)} className={`${inputClass} h-[52px]`}>
                    {imballiFamiglia.map((item) => (
                      <option key={item.code} value={item.code}>{item.code} · {euro(item.costo)}</option>
                    ))}
                  </select>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Costo imballo modificabile (€ / cassa)</div>
                    <NumberInput value={form.overrideCostoImballo} onChange={(v) => update("overrideCostoImballo", v)} />
                    <div className="mt-2 text-xs text-slate-500">Lascia vuoto per usare il costo standard. Costo attivo: {euro(costoImballoAttivo)}</div>
                  </div>
                </div>
              </InputCard>

              <InputCard icon={Scale} label="Peso prodotto per pedana (kg)">
                <NumberInput value={form.pesoProdottoPedana} onChange={(v) => update("pesoProdottoPedana", v)} />
              </InputCard>

              <InputCard icon={Scale} label="Pezzi per pedana">
                <NumberInput value={form.pezziPerPedana} onChange={(v) => update("pezziPerPedana", v)} />
              </InputCard>

              <InputCard icon={Box} label="Numero casse per pedana">
                {opzioniCassePerPedana.length > 1 ? (
                  <select value={form.cassePerPedana} onChange={(e) => update("cassePerPedana", e.target.value)} className={`${inputClass} h-[52px]`}>
                    {opzioniCassePerPedana.map((opzione) => (
                      <option key={opzione} value={opzione}>{opzione} casse / pedana</option>
                    ))}
                  </select>
                ) : (
                  <NumberInput value={form.cassePerPedana} onChange={(v) => update("cassePerPedana", v)} />
                )}
              </InputCard>

              <InputCard icon={Package} label="Corredi imballo (€ / pedana)">
                <NumberInput value={form.corrediPedana} onChange={(v) => update("corrediPedana", v)} />
              </InputCard>

              <InputCard icon={Box} label="Tipologia pallet">
                <div className="space-y-3">
                  <select value={form.palletType} onChange={(e) => update("palletType", e.target.value)} className={`${inputClass} h-[52px]`}>
                    {masters.pallet.map((item) => (
                      <option key={item.code} value={item.code}>{item.code} · {euro(item.costo)}</option>
                    ))}
                  </select>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Costo pallet modificabile (€ / pallet)</div>
                    <NumberInput value={form.overrideCostoPallet} onChange={(v) => update("overrideCostoPallet", v)} />
                    <div className="mt-2 text-xs text-slate-500">Lascia vuoto per usare il costo standard. Costo attivo: {euro(costoPalletAttivo)}</div>
                  </div>
                </div>
              </InputCard>

              <InputCard icon={Scale} label="Peso pedana merce finita (kg)">
                <NumberInput value={form.pesoPedanaFinita} onChange={(v) => update("pesoPedanaFinita", v)} />
              </InputCard>

              <InputCard icon={Truck} label="Costo logistica interna pedana (€)">
                <NumberInput value={form.costoLogisticaPedana} onChange={(v) => update("costoLogisticaPedana", v)} />
              </InputCard>

              <SectionBadge icon={Building2} color="amber">Costi aziendali e struttura</SectionBadge>
              <Spacer />

              <InputCard icon={Factory} label="Produzione mensile stabilimento (kg)">
                <NumberInput value={form.produzioneMensileKg} onChange={(v) => update("produzioneMensileKg", v)} />
              </InputCard>

              <InputCard icon={Factory} label="Costo energia stabilimento mensile (€)">
                <NumberInput value={form.costoEnergiaMensile} onChange={(v) => update("costoEnergiaMensile", v)} />
              </InputCard>

              <InputCard icon={Building2} label="Costo personale amministrativo mensile (€)">
                <NumberInput value={form.costoAmministrazioneMensile} onChange={(v) => update("costoAmministrazioneMensile", v)} />
              </InputCard>

              <InputCard icon={Scale} label={`Quantità lotto venduto (${form.unitaMisura})`}>
                <NumberInput value={form.quantita} onChange={(v) => update("quantita", v)} />
              </InputCard>

              <SectionBadge icon={Wallet} color="violet">Prezzo finale e marginalità</SectionBadge>
              <Spacer />

              <InputCard icon={Percent} label="Margine desiderato (%)">
                <NumberInput value={form.margine} onChange={(v) => update("margine", v)} />
              </InputCard>

              <InputCard icon={Wallet} label="Simulatore rapido prezzo vendita">
                <div className="space-y-3">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
                    Inserisci i valori principali nelle sezioni sopra e usa questo riquadro per verificare subito se il prezzo finale è sostenibile.
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MiniStatCard label="Costo attuale" value={euro(metrics.costoUnitario)} />
                    <MiniStatCard label="Prezzo finale" value={euro(metrics.prezzoFinaleScontato)} />
                    <MiniStatCard label="Utile unitario" value={euro(metrics.utileUnitario)} />
                  </div>
                  <QuickSimulatorCard
                    unitLabel={form.unitaMisura}
                    costoUnitario={metrics.costoUnitario}
                    prezzoPareggio={metrics.prezzoPareggio}
                    prezzoMinimoAziendale={metrics.prezzoMinimoAziendale}
                    prezzoFinale={metrics.prezzoFinaleScontato}
                    utileUnitario={metrics.utileUnitario}
                    redditivitaPercentuale={metrics.redditivitaPercentuale}
                    quantita={Math.max(clampMin(toNumber(form.quantita)), 1)}
                    utileTotale={metrics.utileTotale}
                  />
                </div>
              </InputCard>
            </div>
          </SurfaceCard>

          <KpiPanel
            clienteEffettivo={clienteEffettivo}
            form={form}
            metrics={metrics}
            imballoSelezionato={imballoSelezionato}
            palletSelezionato={palletSelezionato}
            costoImballoAttivo={costoImballoAttivo}
            costoPalletAttivo={costoPalletAttivo}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <SurfaceCard title={`Dettaglio costi unitari per ${form.unitaMisura}`}>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MiniStatCard label="Costo unitario" value={euro(metrics.costoUnitario)} />
              <MiniStatCard label="Prezzo finale" value={euro(metrics.prezzoFinaleScontato)} />
            </div>

            <div className="divide-y divide-slate-100">
              {[
                ["Destinazione", form.destinazione || "—"],
                ["Peso medio per pezzo", metrics.pesoMedioPezzoKg > 0 ? `${metrics.pesoMedioPezzoKg.toLocaleString("it-IT", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg` : "—"],
                ["Costo agricolo", euro(metrics.costoAgricolo)],
                ["Costo industriale", euro(metrics.costoIndustriale)],
                ["Costo confezionamento", euro(metrics.costoConfezionamento)],
                ["Costo struttura", euro(metrics.costoStruttura)],
                ["Costo trasporto unitario", euro(metrics.costoTrasportoUnitario)],
                ["Costo unitario kg", euro(metrics.costoUnitarioKg)],
                ["Costo unitario pz", euro(metrics.costoUnitarioPezzo)],
                ["Prezzo finale kg", euro(metrics.prezzoFinaleScontatoKg)],
                ["Prezzo finale pz", euro(metrics.prezzoFinaleScontatoPezzo)]
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between py-3 text-sm md:text-base">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard title="Scheda selezionata">
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MiniStatCard label="Cliente" value={clienteEffettivo} />
              <MiniStatCard label="Destinazione" value={form.destinazione || "—"} />
            </div>
            <div className="space-y-3">
              <InfoRow label="Cliente" value={clienteEffettivo} />
              <InfoRow label="Referenza" value={form.nomeProdotto} />
              <InfoRow label="Lotto" value={form.codiceLotto || "—"} />
              <InfoRow label="Destinazione" value={form.destinazione || "—"} />
              <InfoRow label="Trasporto pedana" value={form.costoTrasportoPedana ? euro(toNumber(form.costoTrasportoPedana)) : "—"} />
              <InfoRow label="Peso pedana" value={`${pesoPedanaCalcolo.toLocaleString("it-IT")} kg`} />
              <InfoRow label="Costo unitario kg" value={euro(metrics.costoUnitarioKg)} />
              <InfoRow label="Costo unitario pz" value={euro(metrics.costoUnitarioPezzo)} />
              <InfoRow label="Prezzo finale kg" value={euro(metrics.prezzoFinaleScontatoKg)} />
              <InfoRow label="Prezzo finale pz" value={euro(metrics.prezzoFinaleScontatoPezzo)} />
              <InfoRow label="Utile per pedana" value={euro(metrics.utilePedana)} />
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard title="Storico schede salvate" className="mt-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600">Schede salvate nel browser per uso interno rapido.</p>
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca per cliente, prodotto, lotto, imballo o destinazione"
                className="w-full rounded-2xl border border-sky-100 bg-white py-3 pl-10 pr-4 outline-none transition duration-200 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-slate-500">Nessuna scheda salvata nello storico.</div>
            ) : (
              filteredQuotes.map((item) => (
                <SavedQuoteCard key={item.id} item={item} onLoad={loadQuote} onDuplicate={duplicateQuote} onDelete={deleteQuote} />
              ))
            )}
          </div>
        </SurfaceCard>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardCard title="Margine medio per cliente" items={aggregateMetrics(savedQuotes, "cliente")} />
          <DashboardCard title="Margine medio per prodotto" items={aggregateMetrics(savedQuotes, "prodotto")} />
          <DashboardCard title="Margine medio per imballo" items={aggregateMetrics(savedQuotes, "imballo")} />
        </div>
      </div>
    </div>
  );
}

function HeaderCard({
  onSave,
  onExport,
  onReset,
  onToggleAdmin,
  adminOpen
}: {
  onSave: () => void;
  onExport: () => void;
  onReset: () => void;
  onToggleAdmin: () => void;
  adminOpen: boolean;
}): React.JSX.Element {
  return (
    <div className="mb-6 overflow-hidden rounded-[32px] border border-sky-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="bg-[linear-gradient(135deg,_rgba(240,253,244,0.96)_0%,_rgba(248,250,252,0.96)_35%,_rgba(254,242,242,0.94)_100%)] px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center">
            <div className="w-full max-w-[760px] rounded-[24px] border border-slate-100 bg-white px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:px-4 sm:py-3">
              <img src={logoLamapaola} alt="Lamapaola Ortofrutticola" className="h-auto w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <ActionButton icon={Settings2} onClick={onToggleAdmin}>{adminOpen ? "Chiudi anagrafiche" : "Apri anagrafiche"}</ActionButton>
            <ActionButton icon={Save} onClick={onSave} primary>Salva</ActionButton>
            <ActionButton icon={Download} onClick={onExport}>Export</ActionButton>
            <ActionButton icon={FileText} onClick={onReset}>Nuovo</ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientReferenceBlock({
  form,
  clienti,
  update,
  updateCliente,
  updateProdotto
}: {
  form: FormState;
  clienti: ClientName[];
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  updateCliente: (cliente: ClientName) => void;
  updateProdotto: (prodotto: ProductName) => void;
}): React.JSX.Element {
  return (
    <div className="mb-6 rounded-[30px] border border-sky-100 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Building2 size={16} /> Dati cliente e riferimento
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
        <TopField className="lg:col-span-3" label="Cliente da listino">
          <select
            value={form.cliente}
            onChange={(e) => updateCliente(e.target.value)}
            className={`${inputClass} h-[52px]`}
          >
            <option value="">— Cliente manuale —</option>
            {clienti.map((cliente) => (
              <option key={cliente} value={cliente}>
                {cliente}
              </option>
            ))}
          </select>
        </TopField>

        <TopField className="lg:col-span-2" label="Scontistica cliente %">
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.scontoCliente}
            onChange={(e) => update("scontoCliente", e.target.value)}
            className={`${inputClass} h-[52px]`}
            placeholder="0,0"
          />
        </TopField>

        <TopField className="lg:col-span-3" label="Nuovo cliente manuale">
          <input
            type="text"
            value={form.clienteManuale}
            onChange={(e) => update("clienteManuale", e.target.value)}
            className={`${inputClass} h-[52px]`}
            placeholder="Inserisci cliente fuori listino"
          />
        </TopField>

        <TopField className="lg:col-span-2" label="Referenza">
          <select
            value={form.nomeProdotto}
            onChange={(e) => updateProdotto(e.target.value as ProductName)}
            className={`${inputClass} h-[52px]`}
          >
            {REFERENZE.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </TopField>

        <TopField className="lg:col-span-2" label="Codice lotto">
          <input
            type="text"
            value={form.codiceLotto}
            onChange={(e) => update("codiceLotto", e.target.value)}
            className={`${inputClass} h-[52px]`}
            placeholder="Lotto"
          />
        </TopField>
      </div>
    </div>
  );
}

function KpiPanel({
  clienteEffettivo,
  form,
  metrics,
  imballoSelezionato,
  palletSelezionato,
  costoImballoAttivo,
  costoPalletAttivo
}: {
  clienteEffettivo: string;
  form: FormState;
  metrics: QuoteMetrics;
  imballoSelezionato: PackagingItem | null;
  palletSelezionato: PalletItem;
  costoImballoAttivo: number;
  costoPalletAttivo: number;
}): React.JSX.Element {
  return (
    <div className="rounded-[36px] border border-sky-200/30 bg-[linear-gradient(160deg,_#052e16_0%,_#0f172a_36%,_#7f1d1d_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.30)] md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Dashboard premium Lamapaola</h2>
          <p className="mt-1 text-sm text-white/70">Controllo immediato di costi, soglie minime e redditività.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right backdrop-blur-sm">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">Cliente</div>
          <div className="text-sm font-semibold">{clienteEffettivo}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard label={`Costo unitario / ${form.unitaMisura}`} value={euro(metrics.costoUnitario)} tone="slate" />
        <MetricCard label="Prezzo netto target" value={euro(metrics.prezzoNetto)} tone="blue" />
        <MetricCard label="Prezzo pareggio" value={euro(metrics.prezzoPareggio)} tone="rose" />
        <MetricCard label={`Prezzo minimo aziendale (${MARGINE_AZIENDALE_FISSO}%)`} value={euro(metrics.prezzoMinimoAziendale)} tone="emerald" />
        <MetricCard label={`Prezzo listino con sconto ${metrics.scontoCliente.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`} value={euro(metrics.prezzoListinoDaApplicare)} highlight tone="amber" />
        <MetricCard label="Prezzo finale dopo sconto" value={euro(metrics.prezzoFinaleScontato)} tone="cyan" />
        <MetricCard label="Utile unitario" value={euro(metrics.utileUnitario)} tone="violet" />
        <MetricCard label="Utile per pedana" value={euro(metrics.utilePedana)} tone="sky" />
        <MetricCard label="Utile totale lotto" value={euro(metrics.utileTotale)} tone="emerald" />
        <MetricCard label="Redditività %" value={`${metrics.redditivitaPercentuale.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`} tone="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MiniPanel label={`Incidenza imballi / ${form.unitaMisura}`} value={euro(metrics.costoImballiUnitario)} />
        <MiniPanel label="Imballo attivo" value={imballoSelezionato ? `${imballoSelezionato.code} · ${imballoSelezionato.name} · ${euro(costoImballoAttivo)}` : "—"} />
        <MiniPanel label="Costo kg" value={euro(metrics.costoUnitarioKg)} />
        <MiniPanel label="Costo pz" value={euro(metrics.costoUnitarioPezzo)} />
        <MiniPanel label="Prezzo finale kg" value={euro(metrics.prezzoFinaleScontatoKg)} />
        <MiniPanel label="Prezzo finale pz" value={euro(metrics.prezzoFinaleScontatoPezzo)} />
        <MiniPanel label="Pallet" value={`${palletSelezionato.code} · ${euro(costoPalletAttivo)}`} />
        <MiniPanel label="Peso medio pezzo" value={metrics.pesoMedioPezzoKg > 0 ? `${metrics.pesoMedioPezzoKg.toLocaleString("it-IT", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg` : "—"} />
      </div>
    </div>
  );
}

function TopField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string; }): React.JSX.Element {
  return (
    <label className={`flex h-full min-h-[96px] flex-col justify-start ${className}`}>
      <span className="mb-2 flex min-h-[40px] items-start text-sm font-medium text-slate-700">{label}</span>
      <div className="flex flex-1 items-start">{children}</div>
    </label>
  );
}

function Spacer(): React.JSX.Element {
  return <div className="hidden md:block" />;
}

function SectionBadge({ icon: Icon, color, children }: { icon: LucideIcon; color: SectionColor; children: React.ReactNode; }): React.JSX.Element {
  const styles: Record<SectionColor, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700"
  };

  return (
    <div className="md:col-span-2 pt-3">
      <div className={`mb-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm ${styles[color]}`}>
        <Icon size={14} /> {children}
      </div>
    </div>
  );
}

function InputCard({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode; }): React.JSX.Element {
  return (
    <label className="group flex h-full min-h-[150px] flex-col rounded-[30px] border border-sky-100 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <span className="mb-3 flex min-h-[40px] items-start gap-2 text-sm font-semibold text-slate-700">
        <Icon size={16} className="mt-0.5 shrink-0" />
        <span className="leading-5">{label}</span>
      </span>
      <div className="flex flex-1 flex-col">{children}</div>
    </label>
  );
}

function NumberInput({ value, onChange, disabled = false }: { value: string; onChange: (v: string) => void; disabled?: boolean; }): React.JSX.Element {
  return <input type="number" inputMode="decimal" step="0.01" min="0" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={`${inputClass} h-[52px]`} placeholder="0,00" />;
}

function ActionButton({ icon: Icon, children, onClick, primary = false }: { icon: LucideIcon; children: React.ReactNode; onClick: () => void; primary?: boolean; }): React.JSX.Element {
  const className = primary
    ? "inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#0284c7_0%,_#0369a1_100%)] px-5 py-3 text-white shadow-[0_14px_30px_rgba(2,132,199,0.28)]"
    : "inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white/95 px-5 py-3 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]";
  return <button type="button" onClick={onClick} className={className}><Icon size={18} /> {children}</button>;
}

function MetricCard({ label, value, highlight = false, tone = "sky" }: { label: string; value: string; highlight?: boolean; tone?: MetricTone; }): React.JSX.Element {
  const toneClasses: Record<MetricTone, string> = {
    sky: "from-sky-400/20 to-sky-500/10 border-sky-300/20",
    emerald: "from-emerald-400/20 to-green-500/10 border-emerald-300/20",
    cyan: "from-cyan-400/20 to-blue-500/10 border-cyan-300/20",
    violet: "from-violet-400/20 to-fuchsia-500/10 border-violet-300/20",
    amber: "from-amber-400/20 to-orange-500/10 border-amber-300/20",
    rose: "from-rose-400/20 to-pink-500/10 border-rose-300/20",
    slate: "from-white/10 to-white/5 border-white/10",
    blue: "from-blue-400/20 to-indigo-500/10 border-blue-300/20"
  };
  const classes = highlight ? `border bg-gradient-to-br ${toneClasses[tone]} backdrop-blur-sm ring-1 ring-white/10` : `border bg-gradient-to-br ${toneClasses[tone]} backdrop-blur-sm`;
  return <div className={`rounded-[28px] p-5 ${classes}`}><div className="text-sm font-medium text-sky-50/90">{label}</div><div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div></div>;
}

function MiniPanel({ label, value }: { label: string; value: string }): React.JSX.Element {
  return <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"><div className="text-xs uppercase tracking-[0.2em] text-sky-100/70">{label}</div><div className="mt-2 text-sm font-semibold">{value}</div></div>;
}

function MiniStatCard({ label, value }: { label: string; value: string }): React.JSX.Element {
  return <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-2 text-lg font-semibold text-slate-900">{value}</div></div>;
}

function QuickSimulatorCard({ unitLabel, costoUnitario, prezzoPareggio, prezzoMinimoAziendale, prezzoFinale, utileUnitario, redditivitaPercentuale, quantita, utileTotale }: { unitLabel: string; costoUnitario: number; prezzoPareggio: number; prezzoMinimoAziendale: number; prezzoFinale: number; utileUnitario: number; redditivitaPercentuale: number; quantita: number; utileTotale: number; }): React.JSX.Element {
  const stato = prezzoFinale < prezzoPareggio
    ? { label: "Sotto costo", className: "border-rose-200 bg-rose-50 text-rose-800", text: "Il prezzo finale non copre il costo unitario." }
    : prezzoFinale < prezzoMinimoAziendale
      ? { label: "Margine ridotto", className: "border-amber-200 bg-amber-50 text-amber-800", text: "Il prezzo copre i costi ma resta sotto la soglia minima aziendale." }
      : { label: "Prezzo corretto", className: "border-emerald-200 bg-emerald-50 text-emerald-800", text: "Il prezzo finale è coerente con la soglia minima aziendale." };

  return (
    <div className="rounded-[28px] border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${stato.className}`}>{stato.label}</div>
          <div className="mt-3 text-sm text-slate-600">{stato.text}</div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div>Quantità lotto: <strong>{quantita.toLocaleString("it-IT")}</strong> {unitLabel}</div>
          <div className="mt-1">Utile totale stimato: <strong>{euro(utileTotale)}</strong></div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStatCard label="Pareggio" value={euro(prezzoPareggio)} />
        <MiniStatCard label="Soglia minima" value={euro(prezzoMinimoAziendale)} />
        <MiniStatCard label="Utile unitario" value={euro(utileUnitario)} />
        <MiniStatCard label="Redditività" value={`${redditivitaPercentuale.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`} />
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,_#ef4444_0%,_#f59e0b_50%,_#16a34a_100%)]" style={{ width: `${Math.max(4, Math.min(100, costoUnitario > 0 ? (prezzoFinale / (prezzoMinimoAziendale || costoUnitario)) * 100 : 0))}%` }} />
      </div>
    </div>
  );
}

function SurfaceCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string; }): React.JSX.Element {
  return <div className={`rounded-[36px] border border-sky-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${className}`}>{title ? <h3 className="mb-5 text-lg font-semibold text-slate-900">{title}</h3> : null}<div>{children}</div></div>;
}

function AdminMasterCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode; }): React.JSX.Element {
  return <div className="rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-4 shadow-sm"><div className="mb-3 text-sm font-semibold text-slate-900">{title}</div><div className="mb-4 text-xs uppercase tracking-[0.18em] text-slate-400">{subtitle}</div><div className="space-y-3">{children}</div></div>;
}

function AdminRow({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_110px] md:items-center"><div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">{label}</div>{children}</div>;
}

function InfoRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return <div className="flex min-h-[56px] items-center justify-between gap-4 rounded-2xl bg-sky-50/60 px-4 py-3"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value}</span></div>;
}

function BadgePill({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <span className="inline-flex min-h-[34px] items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 shadow-sm">{children}</span>;
}

function NotificationBanner({ message }: { message: string }): React.JSX.Element {
  return <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.10)]">{message}</div>;
}

function AlertCard({ text }: { text: string }): React.JSX.Element {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">{text}</div>;
}

function SavedQuoteCard({ item, onLoad, onDuplicate, onDelete }: { item: SavedQuote; onLoad: (item: SavedQuote) => void; onDuplicate: (item: SavedQuote) => void; onDelete: (id: string) => void; }): React.JSX.Element {
  const clienteLabel = item.form.clienteManuale.trim() || item.form.cliente || "—";
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">{item.form.nomeProdotto}</div>
          <div className="mt-1 text-sm text-slate-500">Cliente: {clienteLabel} · Lotto: {item.form.codiceLotto || "—"} · Destinazione: {item.form.destinazione || "—"} · Imballo: {item.form.imballoCode} · Data: {item.createdAt}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <BadgePill>Costo {item.form.unitaMisura} {euro(item.metrics.costoUnitario)}</BadgePill>
            <BadgePill>Prezzo finale {item.form.unitaMisura} {euro(item.metrics.prezzoFinaleScontato)}</BadgePill>
            <BadgePill>Utile pedana {euro(item.metrics.utilePedana)}</BadgePill>
            <BadgePill>Utile totale {euro(item.metrics.utileTotale)}</BadgePill>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <SmallButton onClick={() => onLoad(item)}>Apri</SmallButton>
          <SmallButton onClick={() => onDuplicate(item)} icon={Copy}>Duplica</SmallButton>
          <SmallButton onClick={() => onDelete(item.id)} icon={Trash2} danger>Elimina</SmallButton>
        </div>
      </div>
    </div>
  );
}

function SmallButton({ onClick, icon: Icon, children, danger = false }: { onClick: () => void; icon?: LucideIcon; children: React.ReactNode; danger?: boolean; }): React.JSX.Element {
  const className = danger
    ? "inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm text-rose-600 shadow-sm"
    : "inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm";
  return <button type="button" onClick={onClick} className={className}>{Icon ? <Icon size={15} /> : null}{children}</button>;
}

function DashboardCard({ title, items }: { title: string; items: AggregateItem[]; }): React.JSX.Element {
  return (
    <SurfaceCard title={title}>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-4 text-sm text-slate-500">Nessun dato disponibile.</div>
        ) : (
          items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.count} schede salvate</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Margine medio</div>
                  <div className="mt-1 font-semibold text-slate-900">{euro(item.avgMargin)}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <BadgePill>Listino {euro(item.avgListino)}</BadgePill>
                <BadgePill>Costo {euro(item.avgCosto)}</BadgePill>
                <BadgePill>Utile totale {euro(item.totalProfit)}</BadgePill>
                <BadgePill>Utile pedane {euro(item.totalPedanaProfit)}</BadgePill>
              </div>
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  );
}

function runSelfTests(): void {
  const masters = getDefaultMasters();

  const sampleKg: FormState = {
    ...emptyForm,
    cliente: "PAM PADOVA",
    destinazione: "PAM PADOVA",
    costoTrasportoPedana: "60",
    materiaPrima: "1",
    resaLavorazione: "100",
    pesoPedanaTrasporto: "100",
    costoPersonaleRaccolta: "20",
    quantitaRaccolta: "100",
    costoPersonaleTrasformazione: "30",
    pesoTrasformato: "100",
    pesoProdottoPedana: "100",
    pezziPerPedana: "200",
    cassePerPedana: "10",
    corrediPedana: "5",
    costoLogisticaPedana: "15",
    produzioneMensileKg: "1000",
    costoEnergiaMensile: "3000",
    costoAmministrazioneMensile: "9000",
    quantita: "10",
    margine: "20",
    overrideTrasporto: true,
    overrideCostoImballo: "0.35",
    overrideCostoPallet: "2"
  };

  const kgMetrics = buildMetrics(sampleKg, masters);
  console.assert(typeof PricingApp === "function", "Test failed: PricingApp deve essere definita");
  console.assert(Number.isFinite(kgMetrics.costoUnitarioKg), "Test failed: costoUnitarioKg deve essere finito");
  console.assert(kgMetrics.costoTrasportoUnitario > 0, "Test failed: il costo trasporto unitario deve essere valorizzato");
  console.assert(Math.abs(kgMetrics.pesoMedioPezzoKg - 0.5) < 0.0001, "Test failed: peso medio pezzo deve essere 0.5 kg");
  console.assert(Math.abs(getEffectivePackagingCost("0.35", DEFAULT_IMBALLI.IFCO[0]) - 0.35) < 0.0001, "Test failed: override costo imballo non applicato");
  console.assert(Math.abs(getEffectivePalletCost("2", DEFAULT_PALLET[0]) - 2) < 0.0001, "Test failed: override costo pallet non applicato");

  const samplePz: FormState = {
    ...sampleKg,
    unitaMisura: "pz",
    unitaCostiAgricoli: "pz",
    ripartizioneCostiPedana: "pz",
    pesoPedanaTrasporto: "200",
    quantitaRaccolta: "200",
    pesoTrasformato: "200"
  };

  const pzMetrics = buildMetrics(samplePz, masters);
  console.assert(Number.isFinite(pzMetrics.prezzoFinaleScontatoPezzo), "Test failed: prezzo finale pz deve essere finito");
  console.assert(pzMetrics.costoTrasportoUnitario > 0, "Test failed: input agricoli in pz devono essere convertibili");

  const sampleFallback: FormState = {
    ...emptyForm,
    famigliaImballo: "IFCO",
    imballoCode: "IF4314",
    palletType: "PR12"
  };

  console.assert(Math.abs(getEffectivePackagingCost("", DEFAULT_IMBALLI.IFCO[0]) - 0.68) < 0.0001, "Test failed: fallback costo imballo standard errato");
  console.assert(Math.abs(getEffectivePalletCost("", DEFAULT_PALLET[0]) - 2) < 0.0001, "Test failed: fallback costo pallet standard errato");
  console.assert(buildMetrics(sampleFallback, masters).costoUnitario >= 0, "Test failed: buildMetrics fallback deve restituire un valore valido");
  console.assert(masters.trasporti["PAM PADOVA"] === 60, "Test failed: trasporto anagrafica PAM PADOVA errato");
  console.assert(masters.clienti.includes("PAM PADOVA"), "Test failed: anagrafica clienti iniziale errata");
  console.assert(masters.destinazioni.includes("PAM PADOVA"), "Test failed: anagrafica destinazioni iniziale errata");

  const normalized = normalizeMasters({
    clienti: [],
    destinazioni: ["NUOVA DESTINAZIONE"],
    trasporti: { "NUOVA DESTINAZIONE": 99 },
    imballi: DEFAULT_IMBALLI,
    pallet: []
  });
  console.assert(normalized.destinazioni.includes("NUOVA DESTINAZIONE"), "Test failed: normalizeMasters deve preservare nuove destinazioni");
  console.assert(normalized.pallet.length > 0, "Test failed: normalizeMasters deve ripristinare pallet se mancanti");

  const aggregated = aggregateMetrics([{ id: "1", createdAt: "oggi", form: sampleKg, metrics: kgMetrics }], "cliente");
  console.assert(aggregated.length === 1, "Test failed: aggregateMetrics deve creare un gruppo");
}

if (typeof window !== "undefined") {
  runSelfTests();
}

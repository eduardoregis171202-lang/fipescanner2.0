// DETRAN URLs por estado
export const DETRAN_URLS: Record<string, string> = {
  AC: "https://www.detran.ac.gov.br/",
  AL: "https://www.detran.al.gov.br/servicos-veiculos/",
  AP: "https://www.detran.ap.gov.br",
  AM: "https://www.detran.am.gov.br",
  BA: "https://www.detran.ba.gov.br",
  CE: "https://sistemas.detran.ce.gov.br/meudetran/",
  DF: "https://www.detran.df.gov.br",
  ES: "https://www.detran.es.gov.br",
  GO: "https://www.detran.go.gov.br",
  MA: "https://www.detran.ma.gov.br",
  MT: "https://www.detran.mt.gov.br",
  MS: "https://www.detran.ms.gov.br",
  MG: "https://www.detran.mg.gov.br",
  PA: "https://www.detran.pa.gov.br",
  PB: "https://www.detran.pb.gov.br",
  PR: "https://www.detran.pr.gov.br",
  PE: "https://www.detran.pe.gov.br",
  PI: "https://www.detran.pi.gov.br",
  RJ: "https://www.detran.rj.gov.br",
  RN: "https://www.detran.rn.gov.br",
  RS: "https://www.detran.rs.gov.br",
  RO: "https://www.detran.ro.gov.br",
  RR: "https://www.detran.rr.gov.br",
  SC: "https://www.detran.sc.gov.br",
  SP: "https://www.detran.sp.gov.br",
  SE: "https://www.detran.se.gov.br",
  TO: "https://www.detran.to.gov.br"
};

// Ranges de placas por UF (formato Mercosul e antigo)
export const PLATE_RANGES = [
  { start: "MZN", end: "NAG", uf: "AC" },
  { start: "MUX", end: "MZE", uf: "AL" },
  { start: "NEI", end: "NFB", uf: "AP" },
  { start: "JXW", end: "KBT", uf: "AM" },
  { start: "NOA", end: "NPH", uf: "AM" },
  { start: "JKK", end: "JSW", uf: "BA" },
  { start: "OKI", end: "OLG", uf: "BA" },
  { start: "HTA", end: "HTW", uf: "MS" },
  { start: "LNI", end: "LNL", uf: "PI" },
  { start: "BFA", end: "GKI", uf: "SP" },
  { start: "GKJ", end: "HLM", uf: "MG" },
  { start: "KAI", end: "KMC", uf: "MT" },
  { start: "AAA", end: "BEZ", uf: "PR" },
  { start: "KAV", end: "KFC", uf: "MT" },
  { start: "HGP", end: "HKW", uf: "MG" },
  { start: "KGU", end: "KMC", uf: "PE" },
  { start: "OIA", end: "OIQ", uf: "CE" },
  { start: "PBA", end: "PBZ", uf: "DF" },
  { start: "KNB", end: "KRE", uf: "RJ" },
  { start: "LVE", end: "LVZ", uf: "PI" },
  { start: "MMW", end: "MNJ", uf: "PB" },
  { start: "MOC", end: "MOU", uf: "TO" },
  { start: "HNH", end: "HPR", uf: "MA" },
  { start: "PSA", end: "PZJ", uf: "MA" },
  { start: "RJY", end: "RJZ", uf: "SC" },
  { start: "RLA", end: "RLQ", uf: "SC" },
  { start: "RNI", end: "RNZ", uf: "RN" },
  { start: "RTA", end: "RUZ", uf: "MG" },
  { start: "IVA", end: "IWZ", uf: "RS" },
  { start: "IXA", end: "IZZ", uf: "RS" },
  { start: "JAA", end: "JKJ", uf: "RS" },
  { start: "LWA", end: "LXZ", uf: "RO" },
  { start: "NAH", end: "NEH", uf: "RR" },
  { start: "LYA", end: "MMV", uf: "SC" },
  { start: "NQA", end: "NQZ", uf: "SE" },
  { start: "JSX", end: "JXV", uf: "ES" },
  { start: "HPD", end: "HQE", uf: "GO" },
  { start: "HQF", end: "HTX", uf: "GO" }
];

export const API_BASE = "https://parallelum.com.br/fipe/api/v1";

export type VehicleType = 'carros' | 'motos' | 'caminhoes';

export interface Brand {
  codigo: string;
  nome: string;
}

export interface Model {
  codigo: number;
  nome: string;
}

export interface Year {
  codigo: string;
  nome: string;
}

export interface FipeResult {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

export interface HistoryItem {
  plate: string;
  uf: string;
  timestamp: number;
}

export interface FipeHistoryItem {
  brand: string;
  model: string;
  year: string;
  value: string;
  codigoFipe: string;
  timestamp: number;
}

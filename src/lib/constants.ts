// DETRAN URLs por estado
export const DETRAN_URLS: Record<string, string> = {
  AC: "https://www.detran.ac.gov.br/servicos/veiculos/",
  AL: "https://www.detran.al.gov.br/veiculos/",
  AP: "https://www.detran.ap.gov.br/detranap/",
  AM: "https://digital.detran.am.gov.br/servicos/veiculos",
  BA: "https://www.detran.ba.gov.br/servicos/veiculos",
  CE: "https://central.detran.ce.gov.br/#/servicos/veiculos",
  DF: "https://www.detran.df.gov.br/servicos/veiculos/",
  ES: "https://detran.es.gov.br/veiculos",
  GO: "https://www.detran.go.gov.br/pservicos/veiculos",
  MA: "https://portal.detran.ma.gov.br/",
  MT: "https://www.detran.mt.gov.br/veiculos",
  MS: "https://www.detran.ms.gov.br/veiculo/",
  MG: "https://www.detran.mg.gov.br/veiculos",
  PA: "https://www.detran.pa.gov.br/veiculos/",
  PB: "https://detran.pb.gov.br/servicos/veiculos",
  PR: "https://www.detran.pr.gov.br/servicos/veiculos",
  PE: "https://www.detran.pe.gov.br/veiculo/",
  PI: "https://portal.pi.gov.br/detran/servicos-de-veiculo/",
  RJ: "http://www.detran.rj.gov.br/veiculos",
  RN: "https://www.detran.rn.gov.br/veiculos/",
  RS: "https://www.detran.rs.gov.br/veiculos",
  RO: "https://www.detran.ro.gov.br/veiculos/",
  RR: "https://www.detran.rr.gov.br/veiculos/",
  SC: "https://www.detran.sc.gov.br/veiculos/",
  SP: "https://www.detran.sp.gov.br/wps/portal/portaldetran/cidadao/veiculos",
  SE: "https://www.detran.se.gov.br/portal/?pg=servicos_veiculos",
  TO: "https://pwa.detran.to.gov.br/veiculos/"
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

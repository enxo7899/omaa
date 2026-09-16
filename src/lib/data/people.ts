import type { Agent, Client, Owner } from "@/lib/types";

export const owner: Owner = {
  id: "owner-omaa",
  name: "Arben Meta",
  company: "OMAA shpk",
};

export const agents: Agent[] = [
  {
    id: "ag-tirane",
    name: "Elton Hoxha",
    region: "tirane",
    phone: "355692011001",
    email: "elton@omaa.al",
  },
  {
    id: "ag-jug",
    name: "Klodiana Bregu",
    region: "jug",
    phone: "355692011002",
    email: "klodiana@omaa.al",
  },
  {
    id: "ag-veri",
    name: "Gentian Ndreu",
    region: "veri",
    phone: "355692011003",
    email: "gentian@omaa.al",
  },
];

export const clients: Client[] = [
  // Tiranë / Durrës
  { id: "cl-toska", name: "Market Toska", city: "Tiranë", region: "tirane", agentId: "ag-tirane", contactName: "Besnik Toska", phone: "355682200101", kind: "shop" },
  { id: "cl-iliria", name: "Restorant Iliria", city: "Tiranë", region: "tirane", agentId: "ag-tirane", contactName: "Mirela Kola", phone: "355682200102", kind: "restaurant" },
  { id: "cl-delta", name: "Delta Ushqime shpk", city: "Durrës", region: "tirane", agentId: "ag-tirane", contactName: "Artan Dervishi", phone: "355682200103", kind: "reseller" },
  { id: "cl-vllaznimi", name: "Minimarket Vllaznimi", city: "Durrës", region: "tirane", agentId: "ag-tirane", contactName: "Luan Prifti", phone: "355682200104", kind: "shop" },
  { id: "cl-blini", name: "Furra Blini", city: "Tiranë", region: "tirane", agentId: "ag-tirane", contactName: "Blerina Shehu", phone: "355682200105", kind: "shop" },
  // Jug
  { id: "cl-jonufri", name: "Market Jonufri", city: "Vlorë", region: "jug", agentId: "ag-jug", contactName: "Ilir Jonufri", phone: "355682200201", kind: "shop" },
  { id: "cl-lekuresi", name: "Restorant Lëkurësi", city: "Sarandë", region: "jug", agentId: "ag-jug", contactName: "Eno Marku", phone: "355682200202", kind: "restaurant" },
  { id: "cl-apolonia", name: "Apolonia Distribucion", city: "Fier", region: "jug", agentId: "ag-jug", contactName: "Edlira Çela", phone: "355682200203", kind: "reseller" },
  { id: "cl-plazhi", name: "Minimarket Plazhi", city: "Vlorë", region: "jug", agentId: "ag-jug", contactName: "Sokol Gjoka", phone: "355682200204", kind: "shop" },
  // Veri
  { id: "cl-rozafa", name: "Market Rozafa", city: "Shkodër", region: "veri", agentId: "ag-veri", contactName: "Dritan Kraja", phone: "355682200301", kind: "shop" },
  { id: "cl-drini", name: "Restorant Drini", city: "Lezhë", region: "veri", agentId: "ag-veri", contactName: "Valbona Doda", phone: "355682200302", kind: "restaurant" },
  { id: "cl-malesia", name: "Malësia Ushqime", city: "Kukës", region: "veri", agentId: "ag-veri", contactName: "Fatmir Halili", phone: "355682200303", kind: "reseller" },
  { id: "cl-bulevardi", name: "Minimarket Bulevardi", city: "Shkodër", region: "veri", agentId: "ag-veri", contactName: "Arta Gjeloshi", phone: "355682200304", kind: "shop" },
];

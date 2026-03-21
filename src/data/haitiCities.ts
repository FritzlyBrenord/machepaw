import type { ShippingZoneScope } from "@/data/types";

export interface HaitiCommuneData {
  sections: string[];
  latitude?: number;
  longitude?: number;
}

export interface HaitiArrondissementData {
  latitude: number;
  longitude: number;
  communes: Record<string, HaitiCommuneData>;
}

export interface HaitiDepartmentData {
  latitude: number;
  longitude: number;
  arrondissements: Record<string, HaitiArrondissementData>;
}

export const HAITI_HIERARCHY: Record<string, HaitiDepartmentData> = {

  // ════════════════════════════════════════════════════
  "Artibonite": {
    latitude: 19.3333, longitude: -72.5000,
    arrondissements: {
      "Dessalines": {
        latitude: 19.2833, longitude: -72.5000,
        communes: {
          "Desdunes":                         { latitude: 19.3167, longitude: -72.5333, sections: ["Aux Sources", "Hatte-Lathan", "Desdunes"] },
          "Dessalines":                        { latitude: 19.2833, longitude: -72.5000, sections: ["Petit-Bourg de Dessalines", "Fiéfié", "Macanda", "Caracol"] },
          "Grande-Saline":                     { latitude: 19.1833, longitude: -72.8167, sections: ["Grande-Saline", "Source Chaude"] },
          "Petite Rivière de l'Artibonite":   { latitude: 19.1333, longitude: -72.4833, sections: ["Savane-Carrée", "Bas-Coupé", "Labady", "Médor", "Ogé"] },
          "Verrettes":                         { latitude: 19.0500, longitude: -72.4667, sections: ["Bas-Liancourt", "Goyavier", "Viau", "Guilleau", "Désarmes"] },
        }
      },
      "Gonaïves": {
        latitude: 19.4167, longitude: -72.6833,
        communes: {
          "Gonaïves":   { latitude: 19.4167, longitude: -72.6833, sections: ["Pont-Gaudin", "Bas-Artibonite", "Labranle", "Poteau", "Gouyave"] },
          "Ennery":     { latitude: 19.4833, longitude: -72.5000, sections: ["Savane-Guillaume", "Plaine des Nègres", "Chemin Neuf", "Puilboreau"] },
          "L'Estère":   { latitude: 19.3500, longitude: -72.5833, sections: ["La Hatte", "Savane-Longue"] },
          "Liancourt":  { latitude: 19.0833, longitude: -72.3500, sections: ["Grande-Savane", "Petite-Source"] },
        }
      },
      "Gros-Morne": {
        latitude: 19.6667, longitude: -72.6833,
        communes: {
          "Gros-Morne":  { latitude: 19.6667, longitude: -72.6833, sections: ["Boucan-Richard", "L'Acul", "Grande-Savane", "Moneac", "Dos-Palmier", "Camp-Coq"] },
          "Anse-Rouge":  { latitude: 19.6333, longitude: -73.0667, sections: ["Calebasse", "Des Forges"] },
          "Terre-Neuve": { latitude: 19.6500, longitude: -72.7500, sections: ["Terre-Neuve", "Port-à-Piment", "Trou-Zombi"] },
        }
      },
      "Marmelade": {
        latitude: 19.5167, longitude: -72.3500,
        communes: {
          "Marmelade":                  { latitude: 19.5167, longitude: -72.3500, sections: ["Plaisance", "Bas-Plaisance", "Haut-Plaisance", "Grand-Fond"] },
          "Saint-Michel-de-l'Attalaye":{ latitude: 19.3667, longitude: -72.3500, sections: ["Platana", "Camathe", "L'Arbre", "Marmelade", "Dessalines", "Artibonite"] },
        }
      },
      "Saint-Marc": {
        latitude: 19.1114, longitude: -72.7008,
        communes: {
          "Saint-Marc":  { latitude: 19.1114, longitude: -72.7008, sections: ["Pont-Sondé", "Bocozelle", "Guêpes", "Bois-Neuf", "Lalue", "Delice"] },
          "La Chapelle": { latitude: 19.1167, longitude: -72.4167, sections: ["Fosse-Général", "Labranle", "Grande-Savane"] },
          "Montrouis":   { latitude: 19.1056, longitude: -72.7072, sections: ["Montrouis", "L'Acul", "Les Salines"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Centre": {
    latitude: 19.0000, longitude: -72.0000,
    arrondissements: {
      "Cerca-la-Source": {
        latitude: 18.9833, longitude: -71.8667,
        communes: {
          "Cerca-la-Source": { latitude: 18.9833, longitude: -71.8667, sections: ["Bois-Proux", "Anse-Rouge", "La Colline"] },
          "Thomassique":     { latitude: 19.0833, longitude: -71.8000, sections: ["Grande-Source", "Matelas", "Savane-à-Roche"] },
        }
      },
      "Hinche": {
        latitude: 19.1409, longitude: -72.0119,
        communes: {
          "Hinche":         { latitude: 19.1409, longitude: -72.0119, sections: ["Juanaria", "Marmont", "Aguahedionde (Rive Droite)", "Aguahedionde (Rive Gauche)"] },
          "Cerca-Carvajal": { latitude: 18.9833, longitude: -71.9833, sections: ["Rang", "Lamiel"] },
          "Maïssade":       { latitude: 19.1667, longitude: -72.1333, sections: ["Savane-Plate", "Boco", "Hatte-Célestin", "Cabaret"] },
          "Thomonde":       { latitude: 19.0667, longitude: -72.0833, sections: ["Terre-Rouge", "Bois-Carré", "Couleur-Café", "Bazelais"] },
        }
      },
      "Lascahobas": {
        latitude: 18.8333, longitude: -71.9500,
        communes: {
          "Lascahobas": { latitude: 18.8333, longitude: -71.9500, sections: ["Savanette", "Morne-à-Gommier", "Grande-Source"] },
          "Belladère":  { latitude: 18.8533, longitude: -71.7833, sections: ["Ranquitte", "Roy-Sec", "Nan-Cochon"] },
          "Savanette":  { latitude: 18.7833, longitude: -71.9333, sections: ["La Hache", "La Selle", "Palmiste"] },
        }
      },
      "Mirebalais": {
        latitude: 18.8369, longitude: -72.1108,
        communes: {
          "Mirebalais":   { latitude: 18.8369, longitude: -72.1108, sections: ["Sarazin", "Crête-Brûlée", "Gascogne", "Rive de l'Artibonite"] },
          "Boucan-Carré": { latitude: 19.0000, longitude: -72.2000, sections: ["Boucan-Carré", "Bois-Gérard", "Dumay", "Grand-Fond"] },
          "Saut-d'Eau":   { latitude: 18.8667, longitude: -72.3000, sections: ["La Saline", "Montagne Terrible", "Goyavier"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Grand'Anse": {
    latitude: 18.5833, longitude: -74.0000,
    arrondissements: {
      "Anse d'Hainault": {
        latitude: 18.4833, longitude: -74.4500,
        communes: {
          "Anse-d'Hainault": { latitude: 18.4833, longitude: -74.4500, sections: ["Gommier", "Trou-Jaques", "Dame-Marie"] },
          "Dame-Marie":      { latitude: 18.5667, longitude: -74.4333, sections: ["Dame-Marie", "Petite-Rivière", "L'Asile"] },
          "Les Irois":       { latitude: 18.4667, longitude: -74.4333, sections: ["Les Irois", "Anse-à-Veau", "Tiburon"] },
        }
      },
      "Corail": {
        latitude: 18.5667, longitude: -73.8833,
        communes: {
          "Corail":   { latitude: 18.5667, longitude: -73.8833, sections: ["Corail", "Pestel"] },
          "Beaumont": { latitude: 18.3833, longitude: -74.1167, sections: ["Beaumont", "Grande-Rivière"] },
          "Pestel":   { latitude: 18.6167, longitude: -73.8500, sections: ["Pestel", "Les Irois", "Jean-Denis", "Grand'Anse"] },
          "Roseaux":  { latitude: 18.4833, longitude: -73.9000, sections: ["Roseaux", "Les Platons", "Fond-Paille"] },
        }
      },
      "Jérémie": {
        latitude: 18.6500, longitude: -74.1167,
        communes: {
          "Jérémie":    { latitude: 18.6500, longitude: -74.1167, sections: ["Bas-L'Anse-à-Veau", "Haut-L'Anse-à-Veau", "Grande-Plaine", "Baconois"] },
          "Abricots":   { latitude: 18.6333, longitude: -74.0000, sections: ["Abricots", "Dame-Marie", "La Source"] },
          "Bonbon":     { latitude: 18.5000, longitude: -74.0167, sections: ["Bonbon", "Grande-Source"] },
          "Chambellan": { latitude: 18.5500, longitude: -73.9333, sections: ["Chambellan", "Source-Salée"] },
          "Marfranc":   { latitude: 18.6000, longitude: -74.0333, sections: ["Marfranc", "Gommier"] },
          "Moron":      { latitude: 18.5500, longitude: -74.0000, sections: ["Moron", "Anse-à-Veau"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Nippes": {
    latitude: 18.4000, longitude: -73.4000,
    arrondissements: {
      "Anse-à-Veau": {
        latitude: 18.5000, longitude: -73.3667,
        communes: {
          "Anse-à-Veau":             { latitude: 18.5000, longitude: -73.3667, sections: ["Corail-Henri", "Baconois-Grec", "Boucan"] },
          "Arnaud":                  { latitude: 18.4000, longitude: -73.3500, sections: ["Arnaud", "Grande-Colline", "La Source"] },
          "L'Asile":                 { latitude: 18.3667, longitude: -73.4167, sections: ["L'Asile", "Changieux", "Nan-Corne", "Morne-L'Hôpital"] },
          "Petit-Trou-de-Nippes":    { latitude: 18.5167, longitude: -73.5833, sections: ["Raymond", "Tiby", "Lièvre", "Fond-de-Nègres"] },
          "Plaisance-du-Sud":        { latitude: 18.3833, longitude: -73.6167, sections: ["Plaisance-du-Sud", "Camp-Perrin"] },
        }
      },
      "Baradères": {
        latitude: 18.4833, longitude: -73.6500,
        communes: {
          "Baradères":   { latitude: 18.4833, longitude: -73.6500, sections: ["Baradères", "Fonds-des-Blancs", "Gommier", "Grand-Boucan"] },
          "Grand-Boucan":{ latitude: 18.4333, longitude: -73.6500, sections: ["Grand-Boucan", "Anse-à-Veau"] },
        }
      },
      "Miragoâne": {
        latitude: 18.4456, longitude: -73.0878,
        communes: {
          "Miragoâne":                 { latitude: 18.4456, longitude: -73.0878, sections: ["Grande-Colline", "Bellevue", "Belle-Vue", "Savane-Dubois"] },
          "Fonds-des-Nègres":          { latitude: 18.3667, longitude: -73.3833, sections: ["Fonds-des-Nègres", "Morne-Fort", "Pli-Bwa", "Boucan"] },
          "Paillant":                  { latitude: 18.3167, longitude: -73.3167, sections: ["Paillant", "Colline des Pins", "Desvarieux", "Savane-Carrée"] },
          "Petite-Rivière-de-Nippes":  { latitude: 18.5167, longitude: -73.5833, sections: ["Petite-Rivière-de-Nippes", "Source-Chaude", "Gros-Mornes", "Fond-des-Anglais"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Nord": {
    latitude: 19.6667, longitude: -72.2000,
    arrondissements: {
      "Acul du Nord": {
        latitude: 19.7833, longitude: -72.3333,
        communes: {
          "Acul-du-Nord":  { latitude: 19.7833, longitude: -72.3333, sections: ["Camp-Louise", "Morne-à-Brûler", "Grand-Boucan", "La Soufrière"] },
          "Plaine-du-Nord":{ latitude: 19.7667, longitude: -72.2667, sections: ["Morne Rouge", "Bas-Plaine du Nord", "Grand-Pré"] },
          "Milot":         { latitude: 19.7333, longitude: -72.2167, sections: ["Perches", "Monbin", "La Porte"] },
        }
      },
      "Borgne": {
        latitude: 19.8500, longitude: -72.5333,
        communes: {
          "Borgne":      { latitude: 19.8500, longitude: -72.5333, sections: ["Boucan-Mahot", "Port-Margot", "Bas-Limbé"] },
          "Port-Margot": { latitude: 19.7667, longitude: -72.4667, sections: ["Bas-Petit-Bourg", "Corail", "Haut-Petit-Bourg", "Grande-Plaine"] },
        }
      },
      "Cap-Haïtien": {
        latitude: 19.7595, longitude: -72.2008,
        communes: {
          "Cap-Haïtien":    { latitude: 19.75952, longitude: -72.20081, sections: ["Haut du Cap", "Petite-Anse", "Barrière-Bouteille"] },
          "Limonade":       { latitude: 19.7500,  longitude: -72.13333, sections: ["Bois-de-Lance", "Bas-Limonade", "Haut-Limonade"] },
          "Quartier-Morin": { latitude: 19.76667, longitude: -72.16667, sections: ["Riche-Bord", "Bas-Morin"] },
        }
      },
      "Grande-Rivière du Nord": {
        latitude: 19.5833, longitude: -72.1667,
        communes: {
          "Grande-Rivière-du-Nord": { latitude: 19.5833, longitude: -72.1667, sections: ["Grande-Rivière", "Cormier", "Jaquezi"] },
          "Bahon":                  { latitude: 19.4667, longitude: -72.1167, sections: ["Bahon", "Grande-Plaine"] },
        }
      },
      "Limbé": {
        latitude: 19.7000, longitude: -72.4000,
        communes: {
          "Limbé":     { latitude: 19.7000, longitude: -72.4000, sections: ["Limbé", "Bas-Limbé", "Haut-Limbé", "Port-Margot"] },
          "Bas-Limbé": { latitude: 19.7333, longitude: -72.3500, sections: ["Bas-Limbé", "Haut-Limbé"] },
        }
      },
      "Plaisance": {
        latitude: 19.6000, longitude: -72.4667,
        communes: {
          "Plaisance": { latitude: 19.6000, longitude: -72.4667, sections: ["Plaisance", "Lacroix", "Marigot", "L'Acul"] },
          "Pilate":    { latitude: 19.6333, longitude: -72.5333, sections: ["Pilate", "Fond-Cheval", "Ravine-des-Roches", "Chouchou", "Plaisance"] },
        }
      },
      "Saint-Raphaël": {
        latitude: 19.4833, longitude: -72.2167,
        communes: {
          "Saint-Raphaël": { latitude: 19.4833, longitude: -72.2167, sections: ["Saint-Raphaël", "Bois-Proux", "Boucan-Carré", "Dufailly"] },
          "Dondon":        { latitude: 19.5167, longitude: -72.2667, sections: ["Dondon", "Brostage"] },
          "Ranquitte":     { latitude: 19.4500, longitude: -72.1333, sections: ["Ranquitte", "Fond-Baptiste", "Grande-Plaine"] },
          "Pignon":        { latitude: 19.3667, longitude: -72.1333, sections: ["Pignon", "Bocozelle"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Nord-Est": {
    latitude: 19.5833, longitude: -71.9167,
    arrondissements: {
      "Fort-Liberté": {
        latitude: 19.6500, longitude: -71.8333,
        communes: {
          "Fort-Liberté": { latitude: 19.6733, longitude: -71.8423, sections: ["Fort-Liberté", "Quartier-Morin", "Dondon"] },
          "Perches":      { latitude: 19.7000, longitude: -71.9000, sections: ["Perches", "Dondon"] },
          "Ferrier":      { latitude: 19.6833, longitude: -71.8167, sections: ["Ferrier", "Bois-de-Lance"] },
        }
      },
      "Ouanaminthe": {
        latitude: 19.5533, longitude: -71.7333,
        communes: {
          "Ouanaminthe":   { latitude: 19.5533, longitude: -71.7333, sections: ["Ouanaminthe", "Gens de Nantes", "Capotille"] },
          "Capotille":     { latitude: 19.5667, longitude: -71.9333, sections: ["Capotille", "Terrier-Rouge"] },
          "Mont-Organisé": { latitude: 19.3167, longitude: -71.9833, sections: ["Mont-Organisé", "Savane-Longue"] },
        }
      },
      "Trou du Nord": {
        latitude: 19.6975, longitude: -72.0250,
        communes: {
          "Trou-du-Nord":  { latitude: 19.6975, longitude: -72.0250, sections: ["Trou du Nord", "Caracol", "Petite-Anse"] },
          "Caracol":       { latitude: 19.7167, longitude: -71.9500, sections: ["Caracol", "Trou du Nord"] },
          "Sainte-Suzanne":{ latitude: 19.6500, longitude: -72.0500, sections: ["Sainte-Suzanne", "Bas-Capotille"] },
          "Terrier-Rouge": { latitude: 19.6667, longitude: -71.9833, sections: ["Terrier-Rouge", "Savane-Pilote", "Grand-Bassin"] },
        }
      },
      "Vallières": {
        latitude: 19.4667, longitude: -71.9667,
        communes: {
          "Vallières": { latitude: 19.4667, longitude: -71.9667, sections: ["Vallières", "Carice", "Mombin-Crochu"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Nord-Ouest": {
    latitude: 19.8333, longitude: -72.9167,
    arrondissements: {
      "Môle Saint-Nicolas": {
        latitude: 19.8000, longitude: -73.3667,
        communes: {
          "Môle-Saint-Nicolas": { latitude: 19.8000, longitude: -73.3667, sections: ["Môle Saint-Nicolas", "Jean-Rabel", "Baie de Henne"] },
          "Baie-de-Henne":      { latitude: 19.7500, longitude: -73.2167, sections: ["Baie de Henne", "Anse-Rouge"] },
          "Bombardopolis":      { latitude: 20.0667, longitude: -73.0167, sections: ["Bombardopolis", "Cap-Rose"] },
          "Jean-Rabel":         { latitude: 19.8667, longitude: -73.1833, sections: ["Jean-Rabel", "Lacoma", "Vieux-Pignon"] },
        }
      },
      "Port-de-Paix": {
        latitude: 19.9398, longitude: -72.8304,
        communes: {
          "Port-de-Paix": { latitude: 19.9398, longitude: -72.8304, sections: ["Port-de-Paix", "Baie de Port-de-Paix", "La Source", "Plaine du Nord"] },
          "Chansolme":    { latitude: 20.0167, longitude: -72.9667, sections: ["Chansolme", "Petite-Anse"] },
          "Bassin-Bleu":  { latitude: 19.8167, longitude: -72.9167, sections: ["Bassin Bleu", "Haut-Bassin Bleu", "La Source"] },
          "La Tortue":    { latitude: 20.0333, longitude: -72.8167, sections: ["La Tortue", "Terre-Neuve"] },
        }
      },
      "Saint-Louis-du-Nord": {
        latitude: 19.9500, longitude: -72.7167,
        communes: {
          "Saint-Louis-du-Nord": { latitude: 19.9500, longitude: -72.7167, sections: ["Saint-Louis du Nord", "Anse-à-Foleur", "Port-Margot"] },
          "Anse-à-Foleur":       { latitude: 19.9167, longitude: -72.7000, sections: ["Anse-à-Foleur", "Citerne-Rémy"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Ouest": {
    latitude: 18.5392, longitude: -72.3288,
    arrondissements: {
      "Arcahaie": {
        latitude: 18.7716, longitude: -72.5278,
        communes: {
          "Arcahaie": { latitude: 18.7716, longitude: -72.5278, sections: ["Arcahaie", "Boucassin", "Délice", "Fonds-Baptiste"] },
          "Cabaret":  { latitude: 18.7000, longitude: -72.5333, sections: ["Cabaret", "Fonds-Verrettes"] },
        }
      },
      "Croix-des-Bouquets": {
        latitude: 18.5768, longitude: -72.2263,
        communes: {
          "Croix-des-Bouquets": { latitude: 18.5768, longitude: -72.2263, sections: ["Fonds Verrettes", "Corail-Cesselesse", "Grande-Savane", "Les Varreux"] },
          "Thomazeau":          { latitude: 18.6500, longitude: -72.0900, sections: ["Thomazeau", "Ganthier"] },
          "Ganthier":           { latitude: 18.5667, longitude: -72.0833, sections: ["Ganthier", "Fonds-Verrettes", "Belle-Vue"] },
          "Cornillon":          { latitude: 18.6333, longitude: -72.0667, sections: ["Cornillon", "Fond-Baptiste"] },
          "Fonds-Verrettes":    { latitude: 18.5167, longitude: -71.9667, sections: ["Fonds-Verrettes", "Savane-Diane"] },
        }
      },
      "La Gonâve": {
        latitude: 18.8000, longitude: -73.0000,
        communes: {
          "Anse-à-Galets":      { latitude: 18.8000, longitude: -72.7667, sections: ["Anse-à-Galets", "Grande-Source", "Petite-Anse"] },
          "Pointe-à-Raquette":  { latitude: 18.8333, longitude: -73.0167, sections: ["Pointe-à-Raquette", "Gros-Mornes"] },
        }
      },
      "Léogâne": {
        latitude: 18.5111, longitude: -72.6334,
        communes: {
          "Léogâne":    { latitude: 18.5111, longitude: -72.6334, sections: ["Léogâne", "Petit-Goâve", "Grand-Goâve", "Miragoâne"] },
          "Grand-Goâve":{ latitude: 18.4333, longitude: -72.7833, sections: ["Grand-Goâve", "Petit-Goâve", "Miragoâne"] },
          "Petit-Goâve":{ latitude: 18.4312, longitude: -72.8652, sections: ["Petit-Goâve", "Grand-Goâve", "Miragoâne"] },
        }
      },
      "Port-au-Prince": {
        latitude: 18.5392, longitude: -72.3288,
        communes: {
          "Port-au-Prince": { latitude: 18.5392,  longitude: -72.3288, sections: ["Port-au-Prince", "Turgeau", "Canapé-Vert", "Carrefour", "Martissant", "Lacoma", "Bernagousse", "Bas Coursin", "Bariadelle", "Taïfer", "Morne à Bateau"] },
          "Carrefour":      { latitude: 18.5467,  longitude: -72.4033, sections: ["Carrefour", "Plaine du Cul-de-Sac", "Grand-Goâve"] },
          "Cité Soleil":    { latitude: 18.5833,  longitude: -72.3167, sections: ["Cité Soleil", "La Saline"] },
          "Delmas":         { latitude: 18.5500,  longitude: -72.3000, sections: ["Delmas", "Pétion-Ville", "Carrefour"] },
          "Gressier":       { latitude: 18.6167,  longitude: -72.4667, sections: ["Gressier", "Plaine du Cul-de-Sac"] },
          "Pétion-Ville":   { latitude: 18.51382, longitude: -72.28819,sections: ["Pétion-Ville", "Meyotte", "Montagne Noire"] },
          "Kenscoff":       { latitude: 18.4500,  longitude: -72.2833, sections: ["Kenscoff", "Furcy", "Bongard"] },
          "Tabarre":        { latitude: 18.5333,  longitude: -72.2667, sections: ["Tabarre", "Croix des Bouquets"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Sud": {
    latitude: 18.2500, longitude: -73.7000,
    arrondissements: {
      "Aquin": {
        latitude: 18.2833, longitude: -73.3833,
        communes: {
          "Aquin":              { latitude: 18.2833, longitude: -73.3833, sections: ["Aquin", "Vieux-Bourg d'Aquin", "Fond des Nègres", "Zanglais"] },
          "Cavaillon":          { latitude: 18.3000, longitude: -73.6167, sections: ["Cavaillon", "Fond des Blancs", "Boileau"] },
          "Saint-Louis-du-Sud": { latitude: 18.2667, longitude: -73.5167, sections: ["Saint-Louis du Sud", "Myard", "Bocage"] },
        }
      },
      "Les Cayes": {
        latitude: 18.1920, longitude: -73.7495,
        communes: {
          "Les Cayes":   { latitude: 18.1920, longitude: -73.7495, sections: ["Les Cayes", "Bourdet", "Fonfrède", "Laborde"] },
          "Camp-Perrin": { latitude: 18.3167, longitude: -73.5667, sections: ["Camp-Perrin", "Plaine des Cayes"] },
          "Chantal":     { latitude: 18.3333, longitude: -73.7333, sections: ["Chantal", "La Colline"] },
          "Maniche":     { latitude: 18.2833, longitude: -73.7167, sections: ["Maniche", "Les Platons"] },
          "Île-à-Vache": { latitude: 18.0833, longitude: -73.6667, sections: ["Île à Vache", "Pointe-Est"] },
        }
      },
      "Chardonnières": {
        latitude: 18.2667, longitude: -74.1333,
        communes: {
          "Chardonnières": { latitude: 18.2667, longitude: -74.1333, sections: ["Chardonnières", "Damassin", "Fond-des-Blancs"] },
          "Les Anglais":   { latitude: 18.2500, longitude: -74.1667, sections: ["Les Anglais", "Grande-Anse"] },
          "Tiburon":       { latitude: 18.3333, longitude: -74.0000, sections: ["Tiburon", "Dame-Marie", "Anse-à-Veau"] },
        }
      },
      "Côteaux": {
        latitude: 18.2333, longitude: -74.0167,
        communes: {
          "Côteaux":        { latitude: 18.2333, longitude: -74.0167, sections: ["Côteaux", "Cavaillon", "Saint-Jean du Sud"] },
          "Port-à-Piment":  { latitude: 18.1667, longitude: -74.0000, sections: ["Port-à-Piment", "Roche-à-Bateaux"] },
          "Roche-à-Bateau": { latitude: 18.1833, longitude: -73.9167, sections: ["Roche-à-Bateaux", "Côteaux"] },
        }
      },
      "Port-Salut": {
        latitude: 18.1667, longitude: -73.9167,
        communes: {
          "Port-Salut":        { latitude: 18.1667, longitude: -73.9167, sections: ["Port-Salut", "Saint-Jean du Sud"] },
          "Saint-Jean-du-Sud": { latitude: 18.1833, longitude: -73.8833, sections: ["Saint-Jean du Sud", "Port-Salut"] },
          "Arniquet":          { latitude: 18.2500, longitude: -73.8167, sections: ["Arniquet", "Saint-Louis du Sud"] },
        }
      },
    }
  },

  // ════════════════════════════════════════════════════
  "Sud-Est": {
    latitude: 18.2500, longitude: -72.3333,
    arrondissements: {
      "Bainet": {
        latitude: 18.2167, longitude: -72.8167,
        communes: {
          "Bainet":       { latitude: 18.2167, longitude: -72.8167, sections: ["Bainet", "Les Irois", "Côtes-de-Fer"] },
          "Côtes-de-Fer": { latitude: 18.3167, longitude: -72.7667, sections: ["Côtes-de-Fer", "La Plaine", "Gris-Gris"] },
        }
      },
      "Belle-Anse": {
        latitude: 18.2167, longitude: -72.0667,
        communes: {
          "Belle-Anse":    { latitude: 18.2167, longitude: -72.0667, sections: ["Belle-Anse", "Marigot", "Fonds-Verrettes"] },
          "Anse-à-Pitres": { latitude: 18.0667, longitude: -71.7833, sections: ["Anse-à-Pitres", "Mapou"] },
          "Grand-Gosier":  { latitude: 18.3167, longitude: -71.9333, sections: ["Grand-Gosier", "Thiotte"] },
          "Thiotte":       { latitude: 18.3167, longitude: -71.8167, sections: ["Thiotte", "Mapou"] },
        }
      },
      "Jacmel": {
        latitude: 18.2357, longitude: -72.5369,
        communes: {
          "Jacmel":               { latitude: 18.2357, longitude: -72.5369, sections: ["Jacmel", "Cayes-Jacmel", "Marigot", "La Vallée"] },
          "Cayes-Jacmel":         { latitude: 18.2167, longitude: -72.6333, sections: ["Cayes-Jacmel", "Marigot"] },
          "La Vallée de Jacmel":  { latitude: 18.2000, longitude: -72.7333, sections: ["La Vallée de Jacmel", "Belle-Anse"] },
          "Marigot":              { latitude: 18.2167, longitude: -72.3167, sections: ["Marigot", "Belle-Anse", "Fonds-Verrettes"] },
        }
      },
    }
  },

};

// ════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════

export const HAITI_DEPARTMENTS = Object.keys(HAITI_HIERARCHY);

export const SHIPPING_ZONE_SCOPE_LABELS: Record<ShippingZoneScope, string> = {
  global:            "Tout Haïti",
  country:           "Pays (Hors Haïti)",
  department:        "Département",
  arrondissement:    "Arrondissement",
  commune:           "Commune/Ville",
  section_communale: "Section Communale",
  city:              "Ville (Legacy)",
  custom:            "Zone personnalisée",
};

export const SHIPPING_ZONE_SCOPE_OPTIONS: Array<{
  value: ShippingZoneScope;
  label: string;
  description: string;
}> = [
  { value: "global",            label: "Tout Haïti",          description: "S'applique partout en Haïti." },
  { value: "department",        label: "Département",          description: "Un ou plusieurs départements." },
  { value: "arrondissement",    label: "Arrondissement",       description: "Un ou plusieurs arrondissements." },
  { value: "commune",           label: "Commune/Ville",        description: "Une ou plusieurs communes haïtiennes." },
  { value: "section_communale", label: "Section Communale",    description: "Une ou plusieurs sections communales." },
  { value: "custom",            label: "Zone personnalisée",   description: "Valeurs libres pour des zones spécifiques." },
];

export const COUNTRIES = [{ code: "HT", name: "Haiti" }];

export function getArrondissementsByDepartment(department: string): string[] {
  return HAITI_HIERARCHY[department]
    ? Object.keys(HAITI_HIERARCHY[department].arrondissements)
    : [];
}

export function getCommunesByArrondissement(department: string, arrondissement: string): string[] {
  const dept = HAITI_HIERARCHY[department];
  if (!dept) return [];
  const arr = dept.arrondissements[arrondissement];
  if (!arr) return [];
  return Object.keys(arr.communes);
}

export function getSectionsByCommune(department: string, arrondissement: string, commune: string): string[] {
  const dept = HAITI_HIERARCHY[department];
  if (!dept) return [];
  const arr = dept.arrondissements[arrondissement];
  if (!arr) return [];
  const com = arr.communes[commune];
  if (!com) return [];
  return com.sections;
}

export function getCoordinatesByDepartment(department: string): { latitude: number; longitude: number } | null {
  const dept = HAITI_HIERARCHY[department];
  return dept ? { latitude: dept.latitude, longitude: dept.longitude } : null;
}

export function getCoordinatesByArrondissement(department: string, arrondissement: string): { latitude: number; longitude: number } | null {
  const arr = HAITI_HIERARCHY[department]?.arrondissements[arrondissement];
  return arr ? { latitude: arr.latitude, longitude: arr.longitude } : null;
}

export function getCoordinatesByCommune(department: string, arrondissement: string, commune: string): { latitude: number; longitude: number } | null {
  const com = HAITI_HIERARCHY[department]?.arrondissements[arrondissement]?.communes[commune];
  return com?.latitude ? { latitude: com.latitude, longitude: com.longitude! } : null;
}

export function getZoneInputPlaceholder(scope: ShippingZoneScope) {
  switch (scope) {
    case "global":            return "Tous les départements d'Haïti.";
    case "department":        return "Départements, ex: Ouest, Nord";
    case "arrondissement":    return "Arrondissements, ex: Port-au-Prince, Cap-Haïtien";
    case "commune":           return "Communes, ex: Delmas, Pétion-Ville";
    case "section_communale": return "Sections communales, ex: Turgeau, Canapé-Vert";
    case "custom":            return "Zones libres, séparées par des virgules";
    default:                  return "Valeurs séparées par des virgules";
  }
}
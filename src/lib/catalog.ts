// Catálogo oficial del álbum Panini FIFA World Cup 2026.
// 980 láminas: 9 intro (FWC1-FWC9) + 11 FIFA Museum (FWC10-FWC20) + 48 equipos × 20 láminas.

export type StickerSection = "intro" | "museum" | "team";
export type StickerType =
  | "intro"
  | "museum"
  | "logo"
  | "team-photo"
  | "player";

export type Sticker = {
  code: string;
  section: StickerSection;
  type: StickerType;
  name: string;
  order: number;
  teamCode?: string;
  teamName?: string;
  flag?: string;
};

export type Team = {
  code: string;
  name: string;
  flag: string;
  confederation: "CONCACAF" | "UEFA" | "CONMEBOL" | "AFC" | "CAF" | "OFC";
};

export const TEAMS: Team[] = [
  // CONCACAF (6) — incluye 3 anfitriones
  { code: "CAN", name: "Canadá", flag: "🇨🇦", confederation: "CONCACAF" },
  { code: "MEX", name: "México", flag: "🇲🇽", confederation: "CONCACAF" },
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", confederation: "CONCACAF" },
  { code: "CUW", name: "Curazao", flag: "🇨🇼", confederation: "CONCACAF" },
  { code: "HAI", name: "Haití", flag: "🇭🇹", confederation: "CONCACAF" },
  { code: "PAN", name: "Panamá", flag: "🇵🇦", confederation: "CONCACAF" },

  // CONMEBOL (6)
  { code: "ARG", name: "Argentina", flag: "🇦🇷", confederation: "CONMEBOL" },
  { code: "BRA", name: "Brasil", flag: "🇧🇷", confederation: "CONMEBOL" },
  { code: "COL", name: "Colombia", flag: "🇨🇴", confederation: "CONMEBOL" },
  { code: "ECU", name: "Ecuador", flag: "🇪🇨", confederation: "CONMEBOL" },
  { code: "PAR", name: "Paraguay", flag: "🇵🇾", confederation: "CONMEBOL" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾", confederation: "CONMEBOL" },

  // UEFA (16)
  { code: "AUT", name: "Austria", flag: "🇦🇹", confederation: "UEFA" },
  { code: "BEL", name: "Bélgica", flag: "🇧🇪", confederation: "UEFA" },
  { code: "BIH", name: "Bosnia y Herzegovina", flag: "🇧🇦", confederation: "UEFA" },
  { code: "CRO", name: "Croacia", flag: "🇭🇷", confederation: "UEFA" },
  { code: "CZE", name: "República Checa", flag: "🇨🇿", confederation: "UEFA" },
  { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "UEFA" },
  { code: "ESP", name: "España", flag: "🇪🇸", confederation: "UEFA" },
  { code: "FRA", name: "Francia", flag: "🇫🇷", confederation: "UEFA" },
  { code: "GER", name: "Alemania", flag: "🇩🇪", confederation: "UEFA" },
  { code: "NED", name: "Países Bajos", flag: "🇳🇱", confederation: "UEFA" },
  { code: "NOR", name: "Noruega", flag: "🇳🇴", confederation: "UEFA" },
  { code: "POR", name: "Portugal", flag: "🇵🇹", confederation: "UEFA" },
  { code: "SCO", name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confederation: "UEFA" },
  { code: "SUI", name: "Suiza", flag: "🇨🇭", confederation: "UEFA" },
  { code: "SWE", name: "Suecia", flag: "🇸🇪", confederation: "UEFA" },
  { code: "TUR", name: "Turquía", flag: "🇹🇷", confederation: "UEFA" },

  // AFC (9)
  { code: "AUS", name: "Australia", flag: "🇦🇺", confederation: "AFC" },
  { code: "IRN", name: "Irán", flag: "🇮🇷", confederation: "AFC" },
  { code: "IRQ", name: "Iraq", flag: "🇮🇶", confederation: "AFC" },
  { code: "JOR", name: "Jordania", flag: "🇯🇴", confederation: "AFC" },
  { code: "JPN", name: "Japón", flag: "🇯🇵", confederation: "AFC" },
  { code: "KOR", name: "Corea del Sur", flag: "🇰🇷", confederation: "AFC" },
  { code: "KSA", name: "Arabia Saudita", flag: "🇸🇦", confederation: "AFC" },
  { code: "QAT", name: "Catar", flag: "🇶🇦", confederation: "AFC" },
  { code: "UZB", name: "Uzbekistán", flag: "🇺🇿", confederation: "AFC" },

  // CAF (10)
  { code: "ALG", name: "Argelia", flag: "🇩🇿", confederation: "CAF" },
  { code: "CIV", name: "Costa de Marfil", flag: "🇨🇮", confederation: "CAF" },
  { code: "COD", name: "RD Congo", flag: "🇨🇩", confederation: "CAF" },
  { code: "CPV", name: "Cabo Verde", flag: "🇨🇻", confederation: "CAF" },
  { code: "EGY", name: "Egipto", flag: "🇪🇬", confederation: "CAF" },
  { code: "GHA", name: "Ghana", flag: "🇬🇭", confederation: "CAF" },
  { code: "MAR", name: "Marruecos", flag: "🇲🇦", confederation: "CAF" },
  { code: "RSA", name: "Sudáfrica", flag: "🇿🇦", confederation: "CAF" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", confederation: "CAF" },
  { code: "TUN", name: "Túnez", flag: "🇹🇳", confederation: "CAF" },

  // OFC (1)
  { code: "NZL", name: "Nueva Zelanda", flag: "🇳🇿", confederation: "OFC" },
];

const INTRO_STICKERS: Array<{ name: string }> = [
  { name: "Logo Panini" },
  { name: "Logo oficial FIFA World Cup 2026" },
  { name: "Trofeo del Mundial" },
  { name: "Balón oficial" },
  { name: "Mascotas: Maple, Zayu y Clutch" },
  { name: "Ciudades anfitrionas (1/3)" },
  { name: "Ciudades anfitrionas (2/3)" },
  { name: "Ciudades anfitrionas (3/3)" },
  { name: "Eslogan oficial" },
];

const MUSEUM_STICKERS: Array<{ name: string }> = [
  { name: "FIFA Museum - Uruguay 1930" },
  { name: "FIFA Museum - Italia 1934/1938" },
  { name: "FIFA Museum - Alemania 1954/1974/1990/2014" },
  { name: "FIFA Museum - Brasil 1958/1962/1970/1994/2002" },
  { name: "FIFA Museum - Inglaterra 1966" },
  { name: "FIFA Museum - Argentina 1978/1986/2022" },
  { name: "FIFA Museum - Francia 1998/2018" },
  { name: "FIFA Museum - España 2010" },
  { name: "FIFA Museum - Trofeo Jules Rimet" },
  { name: "FIFA Museum - Trofeo actual" },
  { name: "FIFA Museum - Mejores momentos" },
];

function buildTeamStickers(team: Team, baseOrder: number): Sticker[] {
  const stickers: Sticker[] = [];

  stickers.push({
    code: `${team.code}1`,
    section: "team",
    type: "logo",
    name: `${team.name} - Escudo`,
    order: baseOrder + 1,
    teamCode: team.code,
    teamName: team.name,
    flag: team.flag,
  });

  stickers.push({
    code: `${team.code}2`,
    section: "team",
    type: "team-photo",
    name: `${team.name} - Plantel`,
    order: baseOrder + 2,
    teamCode: team.code,
    teamName: team.name,
    flag: team.flag,
  });

  for (let i = 3; i <= 20; i++) {
    stickers.push({
      code: `${team.code}${i}`,
      section: "team",
      type: "player",
      name: `Jugador ${i - 2}`,
      order: baseOrder + i,
      teamCode: team.code,
      teamName: team.name,
      flag: team.flag,
    });
  }

  return stickers;
}

function buildCatalog(): Sticker[] {
  const catalog: Sticker[] = [];
  let order = 0;

  // Intro stickers (FWC1-FWC9)
  INTRO_STICKERS.forEach((s, i) => {
    order += 1;
    catalog.push({
      code: `FWC${i + 1}`,
      section: "intro",
      type: "intro",
      name: s.name,
      order,
    });
  });

  // FIFA Museum (FWC10-FWC20)
  MUSEUM_STICKERS.forEach((s, i) => {
    order += 1;
    catalog.push({
      code: `FWC${i + 10}`,
      section: "museum",
      type: "museum",
      name: s.name,
      order,
    });
  });

  // Equipos
  TEAMS.forEach((team) => {
    const teamStickers = buildTeamStickers(team, order);
    catalog.push(...teamStickers);
    order += 20;
  });

  return catalog;
}

export const CATALOG: Sticker[] = buildCatalog();

export const CATALOG_BY_CODE: Map<string, Sticker> = new Map(
  CATALOG.map((s) => [s.code, s])
);

export const TEAMS_BY_CODE: Map<string, Team> = new Map(
  TEAMS.map((t) => [t.code, t])
);

export const TOTAL_STICKERS = CATALOG.length;

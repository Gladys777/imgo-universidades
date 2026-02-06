export type Modality = "Presencial" | "Virtual" | "Híbrida";
// Extendido para soportar instituciones no SNIES (plataformas, bootcamps, academias, etc.)
export type InstitutionType =
  | "Pública"
  | "Privada"
  | "Universidad Internacional"
  | "Plataforma"
  | "Bootcamp"
  | "Academia"
  | "Centro";

export type InstitutionCategory =
  | "Nacional"
  | "Internacional"
  | "Plataformas Digitales"
  | "Idiomas e Inmersión";

export type Program = {
  id: string;
  title: string;
  level:
    | "Técnico"
    | "Tecnológico"
    | "Pregrado"
    | "Especialización"
    | "Maestría"
    | "Doctorado"
    | "Curso"
    | "Certificación"
    | "Bootcamp";
  area:
    | "Ingeniería y Tecnología"
    | "Negocios"
    | "Salud"
    | "Derecho"
    | "Ciencias Sociales"
    | "Artes y Humanidades"
    | "Ciencias"
    | "Educación"
    | "Otros";
  durationMonths: number;
  modality: Modality;
  tuitionCOPYear: number;
  // Para mostrar rango + fuente/nota cuando sea aproximado
  tuitionCOPYearMin?: number;
  tuitionCOPYearMax?: number;
  tuitionNote?: string;
  tuitionSource?: string;
  // Para cursos/bootcamps/plataformas: rango de precio estimado (total del curso)
  priceRangeCOP?: {
    min: number;
    max: number;
    billing: "curso" | "mes" | "año";
  };
  requirements: string[];
};

export type Review = {
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

export type University = {
  id: string;
  institutionCode?: string;
  name: string;
  type: InstitutionType;
  category?: InstitutionCategory;
  country?: string;
  city: string;
  department: string;
  website: string;
  websiteStatus?: "unverified" | "valid" | "invalid";
  websiteNote?: string;
  logo?: string;
  image?: string;
  programs: Program[];
  reviews: Review[];
};

export type ProgramHit = {
  id: string;
  university: University;
  program: Program;
};

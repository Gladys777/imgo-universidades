#!/usr/bin/env python3
"""Genera src/data/universities.json desde scripts/in/Programas.xlsx

Uso (desde la raíz del proyecto):
  python scripts/generate_universities_from_programas_xlsx.py
"""
import math, re, json, os
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "scripts", "in", "Programas.xlsx")
OUT = os.path.join(ROOT, "src", "data", "universities.json")
SNIES_FALLBACK = "https://snies.mineducacion.gov.co/portal/consultas/"

def slugify(s: str) -> str:
    s = str(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:80]

def map_mod(mod: str) -> str:
    m = str(mod or "").lower()
    if "virtual" in m or "distancia" in m:
        return "Virtual"
    if "presencial" in m:
        if "virtual" in m:
            return "Híbrida"
        return "Presencial"
    if "dual" in m or "hibr" in m or "híbr" in m:
        return "Híbrida"
    return "Presencial"

def map_level(lvl: str) -> str:
    l = str(lvl or "").lower()
    if "doctor" in l:
        return "Doctorado"
    if "maestr" in l:
        return "Maestría"
    if "especial" in l:
        return "Especialización"
    if "tecnol" in l or "tecnólogo" in l or "tecnologo" in l:
        return "Tecnológico"
    if "técnic" in l or "tecnic" in l:
        return "Técnico"
    if "universit" in l or "profesional" in l or "pregrado" in l:
        return "Pregrado"
    if "posgrado" in l:
        return "Posgrado"
    return str(lvl) if str(lvl).lower() != "nan" else "Pregrado"

def duration_months(periods, periodicidad) -> int:
    if periods is None or (isinstance(periods, float) and math.isnan(periods)):
        return 96
    p = float(periods)
    per = str(periodicidad or "").lower()
    if "sem" in per:
        return int(round(p * 6))
    if "año" in per or "anio" in per:
        return int(round(p * 12))
    if "trim" in per:
        return int(round(p * 3))
    if "cuatr" in per:
        return int(round(p * 4))
    if "bim" in per:
        return int(round(p * 2))
    if "mes" in per:
        return int(round(p))
    if p <= 20:
        return int(round(p * 6))
    return int(round(p))

def main():
    if not os.path.exists(XLSX):
        raise SystemExit(f"No encuentro el archivo: {XLSX}")

    df = pd.read_excel(XLSX)
    df.columns = [c.strip() for c in df.columns]

    # Normalizaciones básicas
    def clean_code(s):
        s = str(s).strip()
        s = re.sub(r"\.0$", "", s)
        return s

    df["CÓDIGO_INSTITUCIÓN"] = df["CÓDIGO_INSTITUCIÓN"].apply(clean_code)
    df["CÓDIGO_SNIES_DEL_PROGRAMA"] = df["CÓDIGO_SNIES_DEL_PROGRAMA"].apply(clean_code)

    df["NOMBRE_INSTITUCIÓN"] = df["NOMBRE_INSTITUCIÓN"].astype(str).str.strip()
    df["SECTOR"] = df["SECTOR"].astype(str).str.strip()
    df["DEPARTAMENTO_OFERTA_PROGRAMA"] = df["DEPARTAMENTO_OFERTA_PROGRAMA"].astype(str).str.strip()
    df["MUNICIPIO_OFERTA_PROGRAMA"] = df["MUNICIPIO_OFERTA_PROGRAMA"].astype(str).str.strip()
    df["NOMBRE_DEL_PROGRAMA"] = df["NOMBRE_DEL_PROGRAMA"].astype(str).str.strip()
    df["NIVEL_DE_FORMACIÓN"] = df["NIVEL_DE_FORMACIÓN"].astype(str).str.strip()
    df["MODALIDAD"] = df["MODALIDAD"].astype(str).str.strip()
    df["ÁREA_DE_CONOCIMIENTO"] = df["ÁREA_DE_CONOCIMIENTO"].astype(str).str.strip()

    df["NÚMERO_PERIODOS_DE_DURACIÓN"] = pd.to_numeric(df["NÚMERO_PERIODOS_DE_DURACIÓN"], errors="coerce")
    df["COSTO_MATRÍCULA_ESTUD_NUEVOS"] = pd.to_numeric(df["COSTO_MATRÍCULA_ESTUD_NUEVOS"], errors="coerce")

    universities = []
    for code, g in df.groupby("CÓDIGO_INSTITUCIÓN", sort=False):
        name = str(g["NOMBRE_INSTITUCIÓN"].iloc[0]).strip()
        sector = str(g["SECTOR"].iloc[0]).lower()
        inst_type = "Pública" if ("oficial" in sector or "public" in sector or "púb" in sector) else "Privada"

        dept = g["DEPARTAMENTO_OFERTA_PROGRAMA"].mode()
        dept = dept.iloc[0] if len(dept) else "N/A"
        city = g["MUNICIPIO_OFERTA_PROGRAMA"].mode()
        city = city.iloc[0] if len(city) else "N/A"

        programs = []
        seen = set()
        for _, row in g.iterrows():
            title = str(row["NOMBRE_DEL_PROGRAMA"]).strip()
            if not title or title.lower() == "nan":
                continue
            pid = str(row["CÓDIGO_SNIES_DEL_PROGRAMA"]).strip()
            prog_id = slugify(f"{code}-{pid}-{title}") or slugify(f"{code}-{title}")
            if prog_id in seen:
                continue
            seen.add(prog_id)

            tuition = row["COSTO_MATRÍCULA_ESTUD_NUEVOS"]
            tuition_int = int(tuition) if (isinstance(tuition, (int, float)) and not math.isnan(tuition)) else 0

            area = str(row["ÁREA_DE_CONOCIMIENTO"]).strip()
            area = area if area.lower() != "nan" and area else "Otros"

            programs.append({
                "id": prog_id,
                "title": title,
                "level": map_level(row["NIVEL_DE_FORMACIÓN"]),
                "area": area,
                "durationMonths": duration_months(row["NÚMERO_PERIODOS_DE_DURACIÓN"], row.get("PERIODICIDAD")),
                "modality": map_mod(row["MODALIDAD"]),
                "tuitionCOPYear": tuition_int,
                "requirements": []
            })

        universities.append({
            "id": slugify(f"{name}-{code}") or f"ies-{code}",
            "institutionCode": str(code),
            "name": name,
            "type": inst_type,
            "city": str(city) if str(city).lower() != "nan" else "N/A",
            "department": str(dept) if str(dept).lower() != "nan" else "N/A",
            "website": SNIES_FALLBACK,
            "logo": "",
            "programs": programs,
            "reviews": []
        })

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(universities, f, ensure_ascii=False)

    print(f"✅ universities.json generado: {OUT}")
    print(f"Instituciones: {len(universities)} | Programas: {sum(len(u['programs']) for u in universities)}")

if __name__ == "__main__":
    main()

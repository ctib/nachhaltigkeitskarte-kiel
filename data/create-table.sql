-- Tabelle gebaeude anlegen
create table gebaeude (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now(),

  -- Inhalt
  name             text not null,
  adresse          text not null,
  lat              float8 not null,
  lng              float8 not null,
  baujahr          int,
  architekt        text,
  stil             text,
  beschreibung     text,
  bewertung_kurz   text,           -- max. 300 Zeichen für Popup

  -- Performanceparameter
  heizlast_kw      float8,         -- kW
  waermebedarf_mwh float8,         -- MWh/a
  embodied_carbon  float8,         -- kgCO2e/m²
  carbon_footprint float8,         -- tCO2e/a

  -- Klassifikation
  modul            text check (modul in ('27210', 'GeschTheorie1')),
  semester         text,           -- z.B. "SoSe 2026"
  kategorie        text[],         -- ['oekologisch', 'oekonomisch', 'sozial']

  -- Assets
  flyer_url        text,           -- Supabase Storage URL
  thumbnail_url    text,

  -- Autoren / Bearbeiter
  autoren          text,

  -- Workflow
  status           text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  dozent_notiz     text
);

-- Row Level Security
alter table gebaeude enable row level security;

-- Öffentlich lesbar: nur approved
create policy "public_read" on gebaeude
  for select using (status = 'approved');

-- Jeder darf inserieren (Upload-Formular ohne Login)
create policy "public_insert" on gebaeude
  for insert with check (status = 'pending');

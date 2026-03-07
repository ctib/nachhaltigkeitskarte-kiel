# Nachhaltigkeitskarte Kiel
### Interaktive Karte nachhaltiger Gebäude in Kiel
**Hochschule für Angewandte Wissenschaften Kiel · Fachbereich Medien / Bauwesen**
**B.A. Architektur · Schwerpunkt Green Building**

---

## Projektkontext

Diese Webanwendung ist das semesterübergreifende Portfolio-Produkt zweier Lehrveranstaltungen im Schwerpunkt Green Building:

| Modul | Semester | Beitrag zur Karte |
|---|---|---|
| **Geschichte & Theorie des nachhaltigen Planens** (27210) | 6. Sem. (SoSe) | Gebäudebewertung + A4-Flyer (grüne Farbwelt) |
| **Geschichte & Theorie der Architektur und Stadt I** | 1. Sem. (WiSe) | Gebäudebewertung + A4-Flyer (blaue Farbwelt) |

Jede Kohorte trägt pro Semester mind. 1 Gebäude mit vollständiger Dokumentation bei. Die Karte wächst damit kontinuierlich und wird zum lebendigen Stadtarchiv nachhaltiger Kieler Architektur.

---

## Funktionale Anforderungen

### Kartenansicht (nach Anmeldung)
- Interaktive Karte von Kiel auf Basis von **Leaflet.js + OpenStreetMap-Kacheln**
- Gebäude als **Marker** mit Farbcodierung nach Herkunftsmodul (grün = Modul 27210 / blau = Sem-1-Modul)
- **Popup** pro Marker mit:
  - Gebäudename, Adresse, Jahr
  - Kurztext Nachhaltigkeitsbewertung
  - Performanceparameter (kW Heizlast, MWh Wärmebedarf, Embodied Carbon, Carbon Footprint)
  - Thumbnail des A4-Flyers (verlinkt auf PDF-Download)
  - Semester / Kohorte
- **Legende** mit Layer-Toggles (Module ein-/ausblenden)
- **Exkursions-Trails** als gestrichelte Polylines auf der Karte
- **Detail-Sidebar** mit Langbeschreibung, Performance-Tabelle, Modul-Info und Flyer-Download
- Vollständig **responsiv** (Desktop + Tablet + Mobile)

### Flyer-Vorlage (Download)
- A4-Doppelseite als Druckvorlage (PDF + Quelldatei)
- Zwei Farbvarianten: **Grün** (Modul 27210) · **Blau** (Sem-1-Modul)
- Einheitliches Layout gemäß bestehendem Template (siehe `/templates/`)

### Upload-Workflow (Studierende)
- Einfaches **Upload-Formular** (kein Login erforderlich):
  - Gebäudedaten (Name, Adresse, Koordinaten via Karten-Picker)
  - Performanceparameter (Formularfelder mit Einheitenangabe)
  - PDF-Upload (A4-Flyer)
  - Semesterangabe + Modulzuordnung
- Einträge landen zunächst im Status `pending` in Supabase
- **Freigabe durch Dozenten** über einfaches Admin-Panel (passwortgeschützt)
- Nach Freigabe erscheint Gebäude automatisch auf der Karte

### Admin-Panel (passwortgeschützt)
- Liste aller `pending` Einträge mit Vorschau
- Freigeben / Ablehnen (mit optionaler Kommentarfunktion)
- Bearbeiten bestehender Einträge
- Export aller Daten als CSV / GeoJSON

---

## Technologie-Stack

```
Frontend       Leaflet.js 1.9+  ·  Vanilla JS (ES Modules)  ·  CSS Custom Properties
Kacheln        OpenStreetMap (tile.openstreetmap.org) – keine API-Kosten
Backend        Supabase (PostgreSQL + Storage + Auth)
Hosting        GitHub Pages (statisches Frontend)
Assets         Supabase Storage (PDF-Flyer, Thumbnails)
Versionierung  Git / GitHub – GeoJSON wächst mit dem Repository
Schrift        Verdana (CD-Ersatzschrift der HAW Kiel, systemweit verfügbar)
```

Bewusst **kein Framework** (kein React, kein Vue) – der Stack soll für Architektur-Studierende
und Lehrende langfristig wartbar und verständlich bleiben.

### DSGVO / Datenschutz

- **Keine Cookies** – die Anwendung setzt keinerlei Cookies
- **Keine externen Fonts** – Verdana als Systemschrift, kein Google Fonts
- **Self-Hosted Vendor-Libs** – Leaflet.js und Supabase.js liegen im `/vendor/`-Ordner, kein CDN-Load
- **OSM-Kacheln**: Einzige externe Datenübermittlung – Kartenkacheln werden von `tile.openstreetmap.org` geladen (IP-Adresse wird übermittelt). Hinweis wird dem Nutzer angezeigt.
- **Supabase**: Gebäudedaten werden von Supabase geladen (Anon Key, öffentlich lesbar, RLS-geschützt)
- **Content Security Policy** – CSP-Meta-Tags in beiden HTML-Dateien (kein Inline-Script, nur `self` + OSM + Supabase)
- **Referrer-Policy** – `strict-origin-when-cross-origin` verhindert Referer-Leaks an Dritte

### Corporate Design

Gestaltung orientiert sich am **CD-Manual der HAW Kiel** (Stand 12/2025):
- Markenfarbe **HAW-Blau** (`#00305D`) im Header
- **Verdana** als Ersatz-/Systemschrift (Hausschrift ITC Officina ist lizenzpflichtig)
- Modulfarben Grün (`#2D6A4F`) und Blau (`#1F4E79`) für Marker-Unterscheidung

---

## Projektstruktur

```
nachhaltigkeitskarte-kiel/
│
├── index.html                  # Landing Page mit Login-Formular
├── map.html                    # Kartenansicht (nach Anmeldung)
│
├── css/
│   ├── main.css                # Globale Styles, Custom Properties, HAW-CD-Farben
│   ├── landing.css             # Styles für Landing Page
│   └── map.css                 # Kartenspezifische Styles, Marker, Popups, Legende
│
├── js/
│   ├── auth.js                 # Supabase-Auth: Login, Session-Check, Logout
│   ├── map.js                  # Leaflet-Init, Marker, Popup, Sidebar, Legende
│   └── supabase-client.js      # Supabase-Client (liest Credentials aus <meta>-Tags)
│
├── vendor/                     # Self-hosted Libs (DSGVO: kein CDN)
│   ├── leaflet.css
│   ├── leaflet.js              # Leaflet 1.9.4
│   ├── supabase.min.js         # @supabase/supabase-js v2
│   └── images/                 # Leaflet-UI-Assets (marker, layers)
│
├── data/
│   ├── seed-gtas1.sql          # Seed-Daten Gesch. & Theorie I
│   └── update-beschreibungen.sql  # Gebäude-Beschreibungen aus Fallstudien
│
├── templates/
│   ├── flyer-gruen-A4.pdf      # Druckvorlage Modul 27210 (grün)
│   ├── flyer-blau-A4.pdf       # Druckvorlage Sem-1-Modul (blau)
│   └── flyer-source/           # Quelldateien
│
├── assets/
│   ├── icons/                  # Marker-Icons (grün / blau / pending)
│   └── haw-logo.svg
│
├── .env.example                # Supabase URL + Anon Key (nie committen!)
├── .gitignore
└── README.md
```

---

## Supabase Datenbankschema

```sql
create table gebaeude (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now(),

  -- Inhalt
  name             text not null,
  adresse          text not null,
  lat              float8 not null,
  lng              float8 not null,
  baujahr          int,
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

-- Admin darf alles (via Service Role Key, nur serverseitig)
```

---

## Umgebungsvariablen

```bash
# .env.example
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...       # Frontend (öffentlich lesbar + insert)
SUPABASE_SERVICE_KEY=eyJ...    # Nur Admin-Panel – niemals ins Frontend-Bundle!
```

---

## Farbsystem

```css
/* HAW Corporate Design (CD-Manual 12/2025) */
--color-haw-blau:           #00305D;   /* Markenfarbe, RGB 0/48/93 */
--color-haw-hellblau:       #85C3DF;   /* Akzent, RGB 133/195/223 */
--color-haw-orange:         #D67B19;   /* Markierung, RGB 214/123/25 */

/* Modul 27210 – Geschichte & Theorie des nachhaltigen Planens */
--color-modul-27210:        #2D6A4F;   /* Dunkelgrün */
--color-modul-27210-light:  #D8F3DC;   /* Hellgrün */

/* Sem-1-Modul – Geschichte & Theorie der Architektur und Stadt I */
--color-modul-sem1:         #1F4E79;   /* HAW-Dunkelblau */
--color-modul-sem1-light:   #D6E4F0;   /* Hellblau */

/* UI neutral */
--color-bg:     #F8F9FA;
--color-text:   #212529;
--color-border: #DEE2E6;
```

---

## Lokale Entwicklung

```bash
git clone https://github.com/ctib/nachhaltigkeitskarte-kiel.git
cd nachhaltigkeitskarte-kiel

npx serve .
# → http://localhost:3000
```

Kein Build-Step nötig – reiner statischer Vanilla-Stack.
Supabase-Credentials stehen direkt in den HTML-Meta-Tags (`<meta name="supabase-url">` / `<meta name="supabase-anon-key">`), keine `.env`-Datei erforderlich.

---

## Deployment (GitHub Pages)

GitHub Pages auf Branch `main` / Root aktivieren:
→ Repository Settings → Pages → Source: main / root

```bash
git add .
git commit -m "feat: neues Gebäude KW26 SoSe2026"
git push origin main
# Seite aktualisiert sich automatisch
```

Der `SUPABASE_ANON_KEY` ist im Frontend sichtbar – das ist by design,
Row-Level-Security schützt die Daten. Der `SERVICE_KEY` bleibt immer lokal.

---

## Roadmap

- [x] v1.0 · Kartenansicht mit Auth, Legende, Exkursions-Trails, Detail-Sidebar, CSP
- [ ] v1.1 · Upload-Formular · Supabase Insert · Koordinaten-Picker
- [ ] v1.2 · Admin-Panel · Freigabe-Workflow
- [ ] v1.3 · Filter + Suche
- [ ] v1.4 · Flyer-Template-Download (beide Farbvarianten)
- [ ] v2.0 · GeoJSON-Export / Backup via GitHub Action
- [ ] v2.1 · Erweiterung auf weitere Module / Kohorten

---

## Kontakt

**Prof. Dr.-Ing. Christoph Göbel**
Hochschule für Angewandte Wissenschaften Kiel · Fachbereich Medien / Bauwesen
christoph.goebel@haw-kiel.de

---

*Lehrprojekt im Rahmen des Schwerpunkts Green Building, B.A. Architektur, HAW Kiel.*
*Stack bewusst schlank und offen gehalten – damit die Karte nicht nur über Nachhaltigkeit redet.*

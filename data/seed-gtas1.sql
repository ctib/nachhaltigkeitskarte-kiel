-- ============================================================
-- GTAS1 WiSe 2025/26 – Komplettes Setup
-- Tabelle anlegen + Seed-Daten einfügen
-- ============================================================

-- 1. Tabelle anlegen (aus README-Schema + neue Felder)
CREATE TABLE IF NOT EXISTS gebaeude (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now(),

  -- Inhalt
  name             text not null,
  adresse          text not null,
  lat              float8 not null,
  lng              float8 not null,
  baujahr          int,
  beschreibung     text,
  bewertung_kurz   text,

  -- Performanceparameter
  heizlast_kw      float8,
  waermebedarf_mwh float8,
  embodied_carbon  float8,
  carbon_footprint float8,

  -- Klassifikation
  modul            text check (modul in ('27210', 'GeschTheorie1')),
  semester         text,
  kategorie        text[],

  -- Assets
  flyer_url        text,
  thumbnail_url    text,

  -- Workflow
  status           text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  dozent_notiz     text,

  -- Neue Felder (Infobox-Template)
  architekt        text,
  stil             text,
  autoren          text
);

-- 2. Row Level Security
ALTER TABLE gebaeude ENABLE ROW LEVEL SECURITY;

-- Öffentlich lesbar: nur approved
CREATE POLICY "public_read" ON gebaeude
  FOR SELECT USING (status = 'approved');

-- Jeder darf inserieren (Upload-Formular ohne Login)
CREATE POLICY "public_insert" ON gebaeude
  FOR INSERT WITH CHECK (status = 'pending');

-- 3. RLS kurz deaktivieren für Seed-Insert mit status='approved'
ALTER TABLE gebaeude DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Gebäudedaten einfügen
-- Quelle: Exkursionspläne 12.12. + 19.12.2025, Fallstudien-PDFs
-- ============================================================

-- FS01 – Altes Arbeitsamt (Stephan-Heinzel-Haus)
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Altes Arbeitsamt (Stephan-Heinzel-Haus)',
  'Stephan-Heinzel-Straße 2, 24116 Kiel',
  54.3231, 10.1217,
  1930,
  'Schroeder & Hahn',
  'Funktionalismus',
  'Der 112 m lange Riegelbau am Wilhelmplatz verbindet funktionalistische Gestaltung mit Einflüssen des Bauhaus und Le Corbusiers – bei Eröffnung das modernste Arbeitsamt Deutschlands.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Felix Köhler, Jacob Lohmann',
  'approved'
);

-- FS02 – Ricarda-Huch-Schule
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Ricarda-Huch-Schule',
  'Hansastraße 69a, 24118 Kiel',
  54.3369, 10.1269,
  1962,
  'Rudolf Schroeder',
  'Funktionalismus',
  'Schulkomplex aus sechs Gebäudeteilen, verbunden durch Laubengänge. Funktionalistisch im Kern, mit ornamentalen Details, die eine rein funktionalistische Einordnung durchbrechen.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Lena Sander, Själla Petong',
  'approved'
);

-- FS03 – Sartori & Berger-Speicher
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Sartori & Berger-Speicher',
  'Wall 47–51, 24103 Kiel',
  54.3217, 10.1427,
  1927,
  'Ernst Stoffers',
  'Backsteinexpressionismus',
  'Ehemaliger Langness-Speicher am Sartorikai. Der Bau fügt sich in die backsteinexpressionistische Formensprache der 1920er Jahre ein – vergleichbar mit Fritz Högers Chilehaus.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Milena Ries, Jule Blöcker',
  'approved'
);

-- FS04 – Pavillons am Europaplatz
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Pavillons am Europaplatz',
  'Europaplatz 2–4, 24103 Kiel',
  54.3207, 10.1327,
  1990,
  'Thomas Hansen',
  'Postmoderne',
  'Drei eingeschossige Pavillons mit aufgesetzter Wellenkonstruktion aus Stahlrohren. Das Gesamtkonzept „Wind und Wellen" ist eine postmoderne Metapher für die historischen Gewässer am Ort.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Moritz Quast, Sebastian Weigert',
  'approved'
);

-- FS05 – IHK-Gebäude Kiel
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'IHK-Gebäude Kiel',
  'Bergstraße 2, 24103 Kiel',
  54.3265, 10.1353,
  2005,
  'Kauffmann Theilig & Partner',
  'Dekonstruktivismus',
  'Siebengeschossiger Bau mit fünfgeschossigem Atrium und gläsernem Aufzug. Die versetzten Geschoss-Grundlinien und die Auskragung über die Bergstraße stützen die dekonstruktivistische Einordnung.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Christin Rieper, Lena Rubach',
  'approved'
);

-- FS06 – Sportforum der CAU
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Sportforum der CAU',
  'Olshausenstraße 74, 24118 Kiel',
  54.3433, 10.1148,
  1976,
  'gmp Architekten',
  'Brutalismus',
  'Abgesenkt an der Olshausenstraße gelegene Hochschulsportanlage, über einen seitlichen Hochweg erschlossen. Sichtbeton und brutalistische Formensprache prägen den Bau.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Henrik Käsler, Yeva Rozhko',
  'approved'
);

-- FS07 – St. Lukas-Kirche
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'St. Lukas-Kirche',
  'Holtenauer Straße 327, 24106 Kiel',
  54.3579, 10.1299,
  1981,
  'Jungjohann + Hoffmann + Klug',
  'Brutalismus / Postmoderne',
  'An der Schnittstelle zwischen Brutalismus und früher Postmoderne: roher Sichtbeton im Innenraum, gefaltete Backsteinfassade außen. Lichtführung von oben als zentrales Gestaltungsmittel.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Ludwig Pfeiffer, Baran Iskender',
  'approved'
);

-- FS08 – KirchenKai
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'KirchenKai',
  'Rathausstraße 5, 24103 Kiel',
  54.3225, 10.1315,
  2005,
  'Manfred Nagel',
  'Minimalismus',
  'Minimalistischer Glasbau als City-Pastoral hinter dem Alten Rathaus. Profilglasfassade, Sichtbeton, Metall – Reduktion macht den Baukörper zum atmosphärischen Lichtträger im urbanen Raum.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Lena Elolf, Freya Muhs',
  'approved'
);

-- FS09 – Werkstatthaus Muthesius Kunsthochschule
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Werkstatthaus Muthesius Kunsthochschule',
  'Legienstraße 35, 24103 Kiel',
  54.3278, 10.1292,
  2012,
  'Schmieder.Dau.Architekten',
  'Minimalismus / Funktionalismus',
  'Kubus von 20×20×21 m mit Profilglasfassade und vertikal gestapelten Werkstätten. BDA-Preis SH 2015. Minimalistische Bauweise stellt den Baukörper zurück – Nutzer und Funktion treten in den Vordergrund.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Stine Mildner, Anna Strecker',
  'approved'
);

-- FS11 – Mensa I der CAU
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Mensa I der CAU',
  'Westring 385, 24118 Kiel',
  54.3375, 10.1228,
  2003,
  'rimpf Architekten',
  'Konstruktive Architektur',
  'Umbau des Innenhofs zur verglasten Piazza mit 1.000 Plätzen. Offengelegtes Stahltragwerk als Stilmittel – konstruktive Logik und gestalterische Vision verschmelzen. Vergleichbar mit Richard Rogers und Norman Foster.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Emma Stöckhardt, Hanna Perkams',
  'approved'
);

-- FS12 – Internationales Begegnungszentrum (IBZ)
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Internationales Begegnungszentrum (IBZ)',
  'Kiellinie 5, 24105 Kiel',
  54.3286, 10.1470,
  1989,
  'Hain & Sye',
  'Postmoderne',
  'Achtgeschossiges Gästehaus der CAU an der Kiellinie. Gestufte Fassade, Backstein, spielerische Lüftungsrohre und geometrische Einkerbungen – kontextbezogene, materialbewusste Postmoderne.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Santina Bertram, Frida Ach',
  'approved'
);

-- FS13 – Studentendorf der CAU
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Studentendorf der CAU',
  'Olshausenstraße 64–68a, 24118 Kiel',
  54.3414, 10.1170,
  1992,
  'Kettner, Werner, Wolf, Wolter',
  'Strukturalismus',
  'Sechs Wohngebäude in U-Form mit begrünten Innenhöfen und Teichen. Gelber Backstein und grau lasiertes Holz – strukturalistische Musterbildung trifft auf partizipative Architektur.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Maria Ehof, Malou Corinth',
  'approved'
);

-- FS14 – Wohnstift Klosterkirchhof
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Wohnstift Klosterkirchhof',
  'Klosterkirchhof 11, 24103 Kiel',
  54.3242, 10.1388,
  1992,
  'Baade & Hoffmann',
  'Postmoderne',
  'Seniorenwohnstift im Herzen der Kieler Altstadt. Architektur als sensible Stadtreparatur – hochwertige Gestaltung und behutsame Einfügung in den urbanen Kontext.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Alina Sagidenova, Hannah Krause',
  'approved'
);

-- FS15 – Finanzamt Kiel
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Finanzamt Kiel',
  'Feldstraße 23, 24105 Kiel',
  54.3333, 10.1391,
  2012,
  'bbp architekten bda',
  'Funktionalismus',
  'Grundinstandsetzung eines 13-geschossigen Hochhauses aus den 1970ern. Innovative Doppelfenster-Fassade mit saisonaler Funktion. BDA-Preis SH 2015, Bauherrenpreis Stadt Kiel 2012.',
  'GeschTheorie1', 'WiSe 2025/26',
  'Nicole Kroll, Jerik Feddersen',
  'approved'
);

-- FS16 – Urban Mining an der CAU
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, modul, semester, autoren, status)
VALUES (
  'Urban Mining an der CAU (Fakultätenblöcke)',
  'Leibnizstraße 4–10, 24118 Kiel',
  54.3450, 10.1103,
  2024,
  'agn Leusmann',
  NULL,
  'GeschTheorie1', 'WiSe 2025/26',
  'Abdullah Kassab, Baran Iskender',
  'approved'
);

-- FS17 – Marine-Intendantur (Finanzministerium SH)
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, modul, semester, autoren, status)
VALUES (
  'Marine-Intendantur (Finanzministerium SH)',
  'Düsternbrooker Weg 64, 24105 Kiel',
  54.3344, 10.1525,
  1940,
  'Hense',
  NULL,
  'GeschTheorie1', 'WiSe 2025/26',
  'Ebrahim Tajik',
  'approved'
);

-- FS18 – Fördetower
INSERT INTO gebaeude (name, adresse, lat, lng, baujahr, architekt, stil, bewertung_kurz, modul, semester, autoren, status)
VALUES (
  'Fördetower',
  'Gablenzstraße 9, 24114 Kiel',
  54.3111, 10.1292,
  1998,
  'Nagel Architekten',
  'Postmoderne',
  'Fünfgeschossiges Bürohaus mit leichter Schräglage, ellipsenförmigem Treppenhaus und lila Stahlfassade. Collagenhafte Formensprache und Farbe als Identitätsmerkmal – „anything goes".',
  'GeschTheorie1', 'WiSe 2025/26',
  'Lina Matthiesen, Carolin Struve',
  'approved'
);

-- 5. RLS wieder aktivieren
ALTER TABLE gebaeude ENABLE ROW LEVEL SECURITY;

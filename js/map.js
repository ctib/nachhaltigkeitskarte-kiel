/**
 * map.js – Leaflet-Karteninitialisierung, Marker, Popups, Detail-Sidebar
 */

import { supabase } from './supabase-client.js';

// ── HTML-Escaping (XSS-Schutz) ─────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Privacy-Dismiss ─────────────────────────────────────────────────
document.getElementById('privacy-dismiss')?.addEventListener('click', function () {
  document.getElementById('privacy-notice').classList.add('hidden');
});

// ── Leaflet: Image-Pfad auf vendor/ setzen ─────────────────────────
L.Icon.Default.imagePath = 'vendor/images/';

// ── Karte initialisieren ───────────────────────────────────────────
const map = L.map('map').setView([54.3233, 10.1228], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
  maxZoom: 19
}).addTo(map);

// ── Layer-Gruppen für Module ─────────────────────────────────────────
const layerNachhaltig  = L.layerGroup().addTo(map);
const layerGeschTheorie = L.layerGroup().addTo(map);

// ── Exkursions-Trails ───────────────────────────────────────────────
// Tag 1 (12.12.): Fördetower → Sartori & Berger → IHK → Werkstatthaus Muthesius
//   → Arbeitsamt → KirchenKai → [Pause] → Wohnstift → Europaplatz → [Bus] → St. Lukas
const trail1Coords = [
  [54.3111, 10.1292], // Fördetower
  [54.3217, 10.1427], // Sartori & Berger
  [54.3265, 10.1353], // IHK
  [54.3278, 10.1292], // Werkstatthaus Muthesius
  [54.3231, 10.1217], // Arbeitsamt
  [54.3225, 10.1315], // KirchenKai
  [54.3242, 10.1388], // Wohnstift
  [54.3207, 10.1327], // Europaplatz
  [54.3579, 10.1299]  // St. Lukas
];

// Tag 2 (19.12.): Marine-Intendantur → IBZ → Finanzamt → Ricarda-Huch-Schule
//   → [Pause] → Mensa CAU → Urban Mining → Studentendorf → Sportforum
const trail2Coords = [
  [54.3344, 10.1525], // Marine-Intendantur
  [54.3286, 10.1470], // IBZ
  [54.3333, 10.1391], // Finanzamt
  [54.3369, 10.1269], // Ricarda-Huch-Schule
  [54.3375, 10.1228], // Mensa CAU
  [54.3450, 10.1103], // Urban Mining
  [54.3414, 10.1170], // Studentendorf
  [54.3433, 10.1148]  // Sportforum
];

const trail1Line = L.polyline(trail1Coords, {
  color: '#D67B19',
  weight: 3,
  opacity: 0.8,
  dashArray: '8, 6',
  interactive: false
});

const trail2Line = L.polyline(trail2Coords, {
  color: '#85C3DF',
  weight: 3,
  opacity: 0.8,
  dashArray: '8, 6',
  interactive: false
});

// ── Legende ────────────────────────────────────────────────────────
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'map-legend');
  L.DomEvent.disableClickPropagation(div);

  div.innerHTML = `
    <h4>WiSe 2025/26</h4>
    <label class="legend-item legend-toggle-item">
      <input type="checkbox" id="layer-nachhaltig" checked>
      <span class="legend-dot gruen"></span>
      Nachhaltiges Planen
    </label>
    <label class="legend-item legend-toggle-item">
      <input type="checkbox" id="layer-geschtheorie" checked>
      <span class="legend-dot blau"></span>
      Gesch. &amp; Theorie I
    </label>
    <label class="legend-item legend-toggle-item">
      <input type="checkbox" id="trail1-toggle">
      <span class="legend-trail" style="border-color: #D67B19"></span>
      Exkursion 12.12.
    </label>
    <label class="legend-item legend-toggle-item">
      <input type="checkbox" id="trail2-toggle">
      <span class="legend-trail" style="border-color: #85C3DF"></span>
      Exkursion 19.12.
    </label>
  `;

  function bindToggle(id, layer) {
    div.querySelector(id).addEventListener('change', function () {
      this.checked ? map.addLayer(layer) : map.removeLayer(layer);
    });
  }

  bindToggle('#layer-nachhaltig', layerNachhaltig);
  bindToggle('#layer-geschtheorie', layerGeschTheorie);
  bindToggle('#trail1-toggle', trail1Line);
  bindToggle('#trail2-toggle', trail2Line);

  return div;
};
legend.addTo(map);

// ── Marker-Icons nach Modul ────────────────────────────────────────
const markerIcons = {
  '27210': L.divIcon({
    className: 'marker-icon marker-27210',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  }),
  'GeschTheorie1': L.divIcon({
    className: 'marker-icon marker-sem1',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  })
};

// ── Sidebar-Elemente ───────────────────────────────────────────────
const sidebarEl = document.getElementById('sidebar');
const sidebarBody = document.getElementById('sidebar-body');
const sidebarCloseBtn = document.getElementById('sidebar-close');

// ── Popup-HTML erzeugen (kompakt) ──────────────────────────────────
function createPopupContent(g) {
  const badgeClass = g.modul === '27210' ? 'modul-27210' : 'modul-sem1';

  const stilBadge = g.stil
    ? `<span class="stil-badge ${badgeClass}">${esc(g.stil)}</span><br>`
    : '';

  const architekt = g.architekt
    ? `<p class="popup-architekt">Arch.: ${esc(g.architekt)}</p>`
    : '';

  const kurztext = g.bewertung_kurz
    ? `<p class="popup-kurztext">${esc(g.bewertung_kurz)}</p>`
    : '';

  return `
    <div class="popup-content">
      <h3 class="popup-title">${esc(g.name)}</h3>
      <p class="popup-address">${esc(g.adresse)}${g.baujahr ? ` &middot; ${g.baujahr}` : ''}</p>
      ${architekt}
      ${stilBadge}
      ${kurztext}
      <a class="popup-details-link" data-gebaeude-id="${g.id}">Details &rarr;</a>
    </div>
  `;
}

// ── Sidebar-HTML erzeugen ──────────────────────────────────────────
function buildSidebarHTML(g) {
  const parts = [];

  // Thumbnail
  if (g.thumbnail_url) {
    parts.push(`<img class="sidebar-thumbnail" src="${g.thumbnail_url}" alt="${esc(g.name)}">`);
  }

  // Titel + Adresse + Architekt
  parts.push(`<h2 class="sidebar-title">${esc(g.name)}</h2>`);
  parts.push(`<p class="sidebar-address">${esc(g.adresse)}${g.baujahr ? ` &middot; ${g.baujahr}` : ''}</p>`);
  if (g.architekt) {
    parts.push(`<p class="sidebar-architekt">${esc(g.architekt)}</p>`);
  }

  // Stil-Badge
  if (g.stil) {
    const badgeClass = g.modul === '27210' ? 'modul-27210' : 'modul-sem1';
    parts.push(`<span class="stil-badge ${badgeClass}">${esc(g.stil)}</span>`);
  }

  // Beschreibung (lang) oder Kurztext als Fallback
  const beschreibungsText = g.beschreibung || g.bewertung_kurz;
  if (beschreibungsText) {
    parts.push(`
      <div class="sidebar-section">
        <div class="sidebar-section-title">Beschreibung</div>
        <p class="sidebar-description">${esc(beschreibungsText)}</p>
      </div>
    `);
  }

  // Performance (nur wenn mindestens ein Wert vorhanden)
  const params = [];
  if (g.heizlast_kw != null)     params.push(['Heizlast', `${g.heizlast_kw} kW`]);
  if (g.waermebedarf_mwh != null) params.push(['Wärmebedarf', `${g.waermebedarf_mwh} MWh/a`]);
  if (g.embodied_carbon != null)  params.push(['Embodied Carbon', `${g.embodied_carbon} kgCO₂e/m²`]);
  if (g.carbon_footprint != null) params.push(['Carbon Footprint', `${g.carbon_footprint} tCO₂e/a`]);

  if (params.length > 0) {
    const rows = params.map(([k, v]) => `<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`).join('');
    parts.push(`
      <div class="sidebar-section">
        <div class="sidebar-section-title">Performance</div>
        <table class="sidebar-params">${rows}</table>
      </div>
    `);
  }

  // Modul
  const modulLabel = g.modul === '27210'
    ? 'Nachhaltiges Planen (27210)'
    : 'Gesch. & Theorie I';
  const dotClass = g.modul === '27210' ? 'modul-27210' : 'modul-sem1';

  parts.push(`
    <div class="sidebar-section">
      <div class="sidebar-section-title">Modul</div>
      <div class="sidebar-modul">
        <span class="sidebar-modul-dot ${dotClass}"></span>
        ${modulLabel}${g.semester ? ` &middot; ${g.semester}` : ''}
      </div>
    </div>
  `);

  // Autoren
  if (g.autoren) {
    parts.push(`
      <div class="sidebar-section">
        <div class="sidebar-section-title">Bearbeitet von</div>
        <p class="sidebar-autoren">${esc(g.autoren)}</p>
      </div>
    `);
  }

  // Flyer-Download
  if (g.flyer_url) {
    parts.push(`<a class="sidebar-download" href="${g.flyer_url}" target="_blank" rel="noopener">Flyer herunterladen (PDF)</a>`);
  }

  return parts.join('');
}

// ── Sidebar öffnen / schließen ─────────────────────────────────────
function openSidebar(g) {
  sidebarBody.innerHTML = buildSidebarHTML(g);
  sidebarEl.classList.remove('hidden');
  // Force reflow so transition fires
  void sidebarEl.offsetWidth;
  sidebarEl.classList.add('open');
  document.getElementById('map').classList.add('sidebar-open');
  map.invalidateSize();
}

function closeSidebar() {
  sidebarEl.classList.remove('open');
  document.getElementById('map').classList.remove('sidebar-open');
  map.invalidateSize();
  // Remove hidden after transition ends
  sidebarEl.addEventListener('transitionend', function handler() {
    if (!sidebarEl.classList.contains('open')) {
      sidebarEl.classList.add('hidden');
    }
    sidebarEl.removeEventListener('transitionend', handler);
  });
}

// Close button
sidebarCloseBtn.addEventListener('click', closeSidebar);

// Click on map closes sidebar
map.on('click', () => {
  if (sidebarEl.classList.contains('open')) {
    closeSidebar();
  }
});

// ── Gebäude laden und Marker setzen ────────────────────────────────
let gebaeudeMap = {};

async function loadGebaeude() {
  const { data, error } = await supabase
    .from('gebaeude')
    .select('*')
    .eq('status', 'approved');

  if (error) {
    console.error('Fehler beim Laden der Gebäude:', error.message);
    document.getElementById('load-status').textContent =
      'Gebäude konnten nicht geladen werden. Supabase ist noch nicht verbunden.';
    return;
  }

  if (!data || data.length === 0) {
    document.getElementById('load-status').textContent =
      'Noch keine freigegebenen Gebäude vorhanden.';
    return;
  }

  document.getElementById('load-status').textContent = '';

  // Index for sidebar lookup
  data.forEach(g => { gebaeudeMap[g.id] = g; });

  data.forEach(g => {
    const icon = markerIcons[g.modul] || markerIcons['27210'];
    const targetLayer = g.modul === 'GeschTheorie1' ? layerGeschTheorie : layerNachhaltig;
    const marker = L.marker([g.lat, g.lng], { icon })
      .addTo(targetLayer)
      .bindPopup(createPopupContent(g), { maxWidth: 260 });

    // Delegate click on "Details →" inside popup
    marker.on('popupopen', () => {
      const link = document.querySelector(`.popup-details-link[data-gebaeude-id="${g.id}"]`);
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          map.closePopup();
          openSidebar(g);
        });
      }
    });
  });
}

loadGebaeude();

/**
 * map.js – Leaflet-Karteninitialisierung, Marker, Popups, Detail-Sidebar
 */

import { supabase } from './supabase-client.js';

// ── Leaflet: Image-Pfad auf vendor/ setzen ─────────────────────────
L.Icon.Default.imagePath = 'vendor/images/';

// ── Karte initialisieren ───────────────────────────────────────────
const map = L.map('map').setView([54.3233, 10.1228], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
  maxZoom: 19
}).addTo(map);

// ── Legende ────────────────────────────────────────────────────────
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'map-legend');
  div.innerHTML = `
    <h4>Module</h4>
    <div class="legend-item"><span class="legend-dot gruen"></span> Nachhaltiges Planen</div>
    <div class="legend-item"><span class="legend-dot blau"></span> Gesch. & Theorie I</div>
  `;
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
    ? `<span class="stil-badge ${badgeClass}">${g.stil}</span><br>`
    : '';

  const architekt = g.architekt
    ? `<p class="popup-architekt">Arch.: ${g.architekt}</p>`
    : '';

  return `
    <div class="popup-content">
      <h3 class="popup-title">${g.name}</h3>
      <p class="popup-address">${g.adresse}${g.baujahr ? ` &middot; ${g.baujahr}` : ''}</p>
      ${architekt}
      ${stilBadge}
      <a class="popup-details-link" data-gebaeude-id="${g.id}">Details &rarr;</a>
    </div>
  `;
}

// ── Sidebar-HTML erzeugen ──────────────────────────────────────────
function buildSidebarHTML(g) {
  const parts = [];

  // Thumbnail
  if (g.thumbnail_url) {
    parts.push(`<img class="sidebar-thumbnail" src="${g.thumbnail_url}" alt="${g.name}">`);
  }

  // Titel + Adresse + Architekt
  parts.push(`<h2 class="sidebar-title">${g.name}</h2>`);
  parts.push(`<p class="sidebar-address">${g.adresse}${g.baujahr ? ` &middot; ${g.baujahr}` : ''}</p>`);
  if (g.architekt) {
    parts.push(`<p class="sidebar-architekt">${g.architekt}</p>`);
  }

  // Stil-Badge
  if (g.stil) {
    const badgeClass = g.modul === '27210' ? 'modul-27210' : 'modul-sem1';
    parts.push(`<span class="stil-badge ${badgeClass}">${g.stil}</span>`);
  }

  // Beschreibung (lang) oder Kurztext als Fallback
  const beschreibungsText = g.beschreibung || g.bewertung_kurz;
  if (beschreibungsText) {
    parts.push(`
      <div class="sidebar-section">
        <div class="sidebar-section-title">Beschreibung</div>
        <p class="sidebar-description">${beschreibungsText}</p>
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
        <p class="sidebar-autoren">${g.autoren}</p>
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
    const marker = L.marker([g.lat, g.lng], { icon })
      .addTo(map)
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

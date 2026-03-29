const map = L.map("map").setView([40.7128, -74.006], 11);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
  subdomains: "abcd",
  maxZoom: 20,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

const boroughFilter = document.getElementById("boroughFilter");
const overlayOnly = document.getElementById("overlayOnly");
const minFar = document.getElementById("minFar");
const minFarLabel = document.getElementById("minFarLabel");
const resetBtn = document.getElementById("resetBtn");
const visibleCountEl = document.getElementById("visibleCount");
const avgFarEl = document.getElementById("avgFar");
const filterPanel = document.getElementById("filterPanel");
const closePanelBtn = document.getElementById("closePanelBtn");
const openPanelBtn = document.getElementById("openPanelBtn");

const styleForFar = (far) => {
  if (far < 4) return "#7bb684";
  if (far < 8) return "#efb055";
  return "#d65f4a";
};

const popupHtml = (p) => `
  <div class="policy-popup">
    <h3>${p.name}</h3>
    <dl>
      <dt>Borough</dt><dd>${p.borough}</dd>
      <dt>Allowed FAR</dt><dd>${p.allowed_far}</dd>
      <dt>Height cap</dt><dd>${p.height_cap_ft} ft</dd>
      <dt>Affordable overlay</dt><dd>${p.affordable_overlay ? "Yes" : "No"}</dd>
      <dt>District</dt><dd>${p.special_district}</dd>
      <dt>Notes</dt><dd>${p.notes}</dd>
    </dl>
  </div>
`;

let sourceData = null;
let geoLayer = null;

function setPanelVisibility(isVisible) {
  filterPanel.classList.toggle("is-hidden", !isVisible);
  filterPanel.setAttribute("aria-hidden", isVisible ? "false" : "true");

  openPanelBtn.classList.toggle("is-visible", !isVisible);
  openPanelBtn.setAttribute("aria-expanded", isVisible ? "true" : "false");

  setTimeout(() => map.invalidateSize(), 20);
}

function applyFilters() {
  if (!sourceData) return;

  const selectedBorough = boroughFilter.value;
  const farThreshold = Number(minFar.value);
  const overlayOnlyOn = overlayOnly.checked;

  const filteredFeatures = sourceData.features.filter(({ properties }) => {
    const boroughOk = selectedBorough === "all" || properties.borough === selectedBorough;
    const farOk = properties.allowed_far >= farThreshold;
    const overlayOk = !overlayOnlyOn || properties.affordable_overlay === true;
    return boroughOk && farOk && overlayOk;
  });

  if (geoLayer) {
    geoLayer.remove();
  }

  geoLayer = L.geoJSON(
    { type: "FeatureCollection", features: filteredFeatures },
    {
      style: ({ properties }) => ({
        color: "#3f4652",
        weight: 1,
        fillColor: styleForFar(properties.allowed_far),
        fillOpacity: 0.56
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(popupHtml(feature.properties));
        layer.on({
          mouseover: () => layer.setStyle({ weight: 3, fillOpacity: 0.72 }),
          mouseout: () => layer.setStyle({ weight: 1, fillOpacity: 0.56 })
        });
      }
    }
  ).addTo(map);

  const visibleCount = filteredFeatures.length;
  const avgFar =
    visibleCount > 0
      ? filteredFeatures.reduce((sum, f) => sum + f.properties.allowed_far, 0) / visibleCount
      : 0;

  visibleCountEl.textContent = String(visibleCount);
  avgFarEl.textContent = avgFar.toFixed(1);

  if (visibleCount > 0) {
    map.fitBounds(geoLayer.getBounds(), { padding: [20, 20], maxZoom: 13 });
  }
}

function resetFilters() {
  boroughFilter.value = "all";
  overlayOnly.checked = false;
  minFar.value = "0";
  minFarLabel.textContent = "0.0";
  applyFilters();
}

boroughFilter.addEventListener("change", applyFilters);
overlayOnly.addEventListener("change", applyFilters);
minFar.addEventListener("input", () => {
  minFarLabel.textContent = Number(minFar.value).toFixed(1);
  applyFilters();
});
resetBtn.addEventListener("click", resetFilters);
closePanelBtn.addEventListener("click", () => setPanelVisibility(false));
openPanelBtn.addEventListener("click", () => setPanelVisibility(true));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setPanelVisibility(false);
  }
});

async function init() {
  const response = await fetch("./data/zoning_context.geojson");
  sourceData = await response.json();
  applyFilters();
  setPanelVisibility(true);
}

init().catch((err) => {
  console.error("Failed to initialize map", err);
  alert("Could not load zoning data. Check data/zoning_context.geojson.");
});

// Leaflet page rendered inside a WebView (native) or an iframe (web). No API key: IGN BD ORTHO aerial photos.
// Messages in:  {type:'flyTo', lat, lon, zoom?} | {type:'outline', ring:[[lon,lat],...] | null}
// Messages out: {type:'ready'} | {type:'moveStart', intended} | {type:'moveEnd', lat, lon, intended}

const ORTHO =
  'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS' +
  '&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg';

export function mapHtml(start: { lat: number; lon: number; zoom: number }, outlineColor: string) {
  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; height: 100%; background: #2b2f2a; }
  .leaflet-control-attribution { font: 10px system-ui, sans-serif; background: rgba(255,254,252,.75) !important; }
</style>
</head><body><div id="map"></div>
<script>
  function send(m) {
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent !== window) window.parent.postMessage({ __locateMap: true, data: s }, '*');
  }
  var map = L.map('map', { zoomControl: false, attributionControl: true, maxZoom: 20 })
    .setView([${start.lat}, ${start.lon}], ${start.zoom});
  map.attributionControl.setPrefix(false);
  L.tileLayer('${ORTHO}', { maxNativeZoom: 19, maxZoom: 20, attribution: '&copy; IGN BD ORTHO' }).addTo(map);
  var outline = null;
  // Only moves the person asked for (drag, pinch, tap, GPS, search) count; a resize or a layout pass does not.
  var intended = false;
  ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) {
    map.getContainer().addEventListener(ev, function () { intended = true; }, { passive: true });
  });
  map.on('movestart', function () { send({ type: 'moveStart', intended: intended }); });
  map.on('moveend', function () {
    var c = map.getCenter();
    send({ type: 'moveEnd', lat: c.lat, lon: c.lng, intended: intended });
    intended = false;
  });
  // "Not your home? Tap another roof": a tap brings that roof under the pin.
  map.on('click', function (e) { intended = true; map.panTo(e.latlng, { animate: true, duration: 0.4 }); });
  window.receive = function (m) {
    if (m.type === 'flyTo') { intended = true; map.flyTo([m.lat, m.lon], m.zoom || 19, { duration: 1.1 }); }
    if (m.type === 'outline') {
      if (outline) { map.removeLayer(outline); outline = null; }
      if (m.ring) outline = L.polygon(m.ring.map(function (c) { return [c[1], c[0]]; }), {
        color: '#FFFEFC', weight: 2, fillColor: '${outlineColor}', fillOpacity: 0.28, interactive: false
      }).addTo(map);
    }
  };
  window.addEventListener('message', function (e) {
    if (e.data && e.data.__locateMapIn) window.receive(e.data.msg);
  });
  send({ type: 'ready' });
</script>
</body></html>`;
}

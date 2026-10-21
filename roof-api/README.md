# Roof material API (MyRain365)

One folder, three Python packages, no API key. Give it an address or a GPS point, get the roof material back.

## Run it
```
pip install -r requirements.txt
python server.py
```
Then open `http://localhost:8000/roof?address=45 rue de l'Epeule, Roubaix`
or `http://localhost:8000/roof?lat=50.6907&lon=3.1624`. On Windows you can double-click `start.bat`.

Command line test without the server: `python roof.py "45 rue de l'Epeule, Roubaix"`

## Answer
```json
{"ok": true, "material": "tiles", "confidence": 0.905, "ask_user": false,
 "probabilities": {"tiles": 0.905, "slate": 0.027, "metal": 0.033, "concrete": 0.035},
 "roof_area_m2": 403.6, "flat_roof": false, "runoff_coefficient": 0.85,
 "building_id": "BATIMENT0000000289245891", "model_version": "round 5 ...", "outline": [[lon, lat], ...]}
```
- `ask_user: false`: fill the roof material in for the user.
- `ask_user: true` (confidence below 0.6 or roof above 1,500 m²): show the material chips with this one preselected.
- `outline`: the building polygon, to draw on the map.

## In the app (React Native / Expo, Flutter works the same way)
```js
const API = "http://192.168.1.20:8000";   // the laptop running server.py, or the hosted URL
async function roofMaterial(lat, lon) {
  const r = await fetch(`${API}/roof?lat=${lat}&lon=${lon}`);
  return r.json();   // { material, confidence, ask_user, roof_area_m2, runoff_coefficient, outline }
}
// after the user confirms the pin on the map:
const roof = await roofMaterial(pin.latitude, pin.longitude);
setRoofArea(roof.roof_area_m2);
setMaterial(roof.material);
setNeedsConfirm(roof.ask_user);
```
For a phone on the same Wi-Fi, use the laptop's local IP (run `ipconfig`), not `localhost`.

## Moving it around
- **To a teammate:** zip this folder (about 20 MB) and send it. They run the two commands above.
- **Hosting:** any free Python host works (Render, Railway, Hugging Face Spaces, a school server). Start command
  `python server.py`, port from the `PORT` variable. A `Dockerfile` is included for hosts that want one.

## What is inside
- `models/convnext.onnx` (8-bit) and `models/efficientnet.onnx`: the two image networks.
- `models/colour_trees.npz`: the colour and texture model, stored as plain numbers.
- `models/meta.json`: classes, ensemble weights, thresholds, runoff coefficients.
- Data comes live from IGN Géoplateforme (geocoding, BD TOPO buildings, BD ORTHO aerial photos), free and keyless.
  Aerial tiles are cached in `tile_cache/`.
- Model: round 5, trained on 74,553 roofs from the Lille metropolis and the Nord department. On areas it never saw it
  names 74.5% of Lille roofs and 64.5% of roofs in four other Nord regions correctly (balanced), and 76% when it is
  at least 60% sure. Full explanation in the MyRain365_roof_material notebook.
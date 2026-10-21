# Roof material model, desktop copy

The app runs the roof material model on the phone (see `../assets/roof-model/`). This folder runs the very same model
files in Python, which is handy to check an answer from a laptop or to process many addresses at once.

```
pip install -r requirements.txt
python roof.py "45 rue de l'Epeule, Roubaix"
python roof.py 50.6907 3.1624
```

`python server.py` serves the same answer over HTTP at `http://localhost:8000/roof?lat=50.6907&lon=3.1624`.

## Answer
```json
{"ok": true, "material": "tiles", "confidence": 0.905, "ask_user": false,
 "probabilities": {"tiles": 0.905, "slate": 0.027, "metal": 0.033, "concrete": 0.035},
 "roof_area_m2": 403.6, "flat_roof": false, "runoff_coefficient": 0.85,
 "building_id": "BATIMENT0000000289245891", "model_version": "round 5 ...", "outline": [[lon, lat], ...]}
```
- `ask_user: false`: the material can be filled in for the user.
- `ask_user: true` (confidence below 0.6 or roof above 1,500 m²): the user should confirm the material.

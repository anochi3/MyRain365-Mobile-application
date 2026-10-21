"""MyRain365 roof material: address or GPS point -> building -> aerial roof crop -> material.

Needs only numpy, pillow, onnxruntime (no scikit-learn, no torch). Data: IGN Géoplateforme (free, no key).
"""
import io
import json
import math
import os
import threading
import urllib.parse
import urllib.request

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(HERE, "models")
META = json.load(open(os.path.join(M, "meta.json")))
CLASSES = META["classes"]
MEAN = np.array(META["mean"], np.float32)
STD = np.array(META["std"], np.float32)
NETS = {name: ort.InferenceSession(os.path.join(M, f"{name}.onnx"), providers=["CPUExecutionProvider"])
        for name in META["sizes"]}
_t = np.load(os.path.join(M, "colour_trees.npz"))
TREES = {k: _t[k] for k in _t.files}          # load once: npz access is slow

Z, TILE, SIZE = 19, 256, 96
CACHE = os.path.join(HERE, "tile_cache")
os.makedirs(CACHE, exist_ok=True)
UA = {"User-Agent": "MyRain365/1.0 (JUNIA student project)"}
GEOCODE = "https://data.geopf.fr/geocodage/search?limit=1&q={q}"
WFS = ("https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=BDTOPO_V3:batiment"
       "&OUTPUTFORMAT=application/json&COUNT=30&BBOX={a},{b},{c},{d},urn:ogc:def:crs:EPSG::4326")
WMTS = ("https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS"
        "&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg")
CODE = {"10": "tiles", "20": "slate", "30": "metal", "40": "concrete"}


def get(url, timeout=60):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()


# ------------------------------------------------------------------ location and building
def geocode(text):
    f = json.loads(get(GEOCODE.format(q=urllib.parse.quote(text))))["features"]
    if not f:
        raise ValueError("address not found")
    lon, lat = f[0]["geometry"]["coordinates"]
    return lat, lon, f[0]["properties"]["label"]


def _inside(x, y, ring):
    c = False
    for i in range(len(ring) - 1):
        (x1, y1), (x2, y2) = ring[i][:2], ring[i + 1][:2]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def _dist(x, y, ring):
    best = 1e9
    for i in range(len(ring) - 1):
        (x1, y1), (x2, y2) = ring[i][:2], ring[i + 1][:2]
        dx, dy = x2 - x1, y2 - y1
        t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy or 1)))
        best = min(best, math.hypot(x - x1 - t * dx, y - y1 - t * dy))
    return best


def building_at(lat, lon):
    e = 0.00025
    feats = json.loads(get(WFS.format(a=lat - e, b=lon - e, c=lat + e, d=lon + e)))["features"]
    feats = [f for f in feats if f["properties"].get("usage_1") != "Annexe"] or feats
    if not feats:
        return None
    def score(f):
        ring = f["geometry"]["coordinates"][0][0]
        return 0 if _inside(lon, lat, ring) else _dist(lon, lat, ring)
    return min(feats, key=score)


# ------------------------------------------------------------------ aerial roof crop
def _px(lon, lat):
    n = 2 ** Z * TILE
    s = math.sin(math.radians(lat))
    return (lon + 180) / 360 * n, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n


_lock = threading.Lock()


def _tile(x, y):
    fn = os.path.join(CACHE, f"{x}_{y}.jpg")
    if not os.path.exists(fn):
        data = get(WMTS.format(z=Z, x=x, y=y))
        if data[:2] != b"\xff\xd8":
            raise IOError("aerial tile not available")
        with _lock:
            open(fn, "wb").write(data)
    return Image.open(fn).convert("RGB")


CONTEXT, MIN_SIDE_PX, DIM, CROP = 1.6, 64, 0.35, 160


def roof_crop(f):
    """Square crop around the building, 1.6 times its larger side, with everything outside the outline dimmed to 35%.
    Returns the crop (RGB), the outline mask, the roof area in m2 and whether the roof is flat."""
    ring = f["geometry"]["coordinates"][0][0]
    lat0 = sum(c[1] for c in ring) / len(ring)
    R = 6371008.8
    xy = [(R * math.radians(c[0]) * math.cos(math.radians(lat0)), R * math.radians(c[1])) for c in ring]
    area = 0.5 * abs(sum(xy[i][0] * xy[i + 1][1] - xy[i + 1][0] * xy[i][1] for i in range(len(xy) - 1)))
    pts = [_px(c[0], c[1]) for c in ring]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    side = max(max(xs) - min(xs), max(ys) - min(ys), MIN_SIDE_PX / CONTEXT) * CONTEXT
    x0, y0, x1, y1 = cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2
    tx0, ty0, tx1, ty1 = int(x0 // TILE), int(y0 // TILE), int(x1 // TILE), int(y1 // TILE)
    canvas = Image.new("RGB", ((tx1 - tx0 + 1) * TILE, (ty1 - ty0 + 1) * TILE))
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            canvas.paste(_tile(tx, ty), ((tx - tx0) * TILE, (ty - ty0) * TILE))
    ox, oy = tx0 * TILE, ty0 * TILE
    box = (int(x0 - ox), int(y0 - oy), int(math.ceil(x1 - ox)), int(math.ceil(y1 - oy)))
    img = canvas.crop(box)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon([(a - ox - box[0], b - oy - box[1]) for a, b in pts], fill=255)
    a = np.asarray(img, np.float32)
    m = np.asarray(mask, np.float32)[..., None] / 255
    crop = Image.fromarray((a * (m + (1 - m) * DIM)).clip(0, 255).astype(np.uint8)).resize((CROP, CROP), Image.BILINEAR)
    mask = mask.resize((CROP, CROP), Image.BILINEAR)
    p = f["properties"]
    tmin, tmax = p.get("altitude_minimale_toit"), p.get("altitude_maximale_toit")
    flat = None if tmin is None or tmax is None else (tmax - tmin) < 0.5
    return crop, mask, area, flat


# ------------------------------------------------------------------ models
def _hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    return np.stack([h, np.where(mx > 0, d / (mx + 1e-6), 0), mx], -1)


def colour_features(crop, mask, area, flat):
    a = np.asarray(crop, dtype=np.float32) / 255
    m = np.asarray(mask, dtype=np.float32) / 255 > 0.5
    p = a[m]
    hsv = _hsv(p)
    f = []
    for arr in (p, hsv):
        f += list(arr.mean(0)) + list(arr.std(0)) + list(np.percentile(arr, [10, 50, 90], axis=0).ravel())
    hue = np.histogram(hsv[:, 0], bins=12, range=(0, 1), weights=hsv[:, 1])[0]
    f += list(hue / (hue.sum() + 1e-6))
    f += list(np.histogram(hsv[:, 2], bins=8, range=(0, 1))[0] / len(p))
    g = a.mean(-1)
    gx, gy = np.zeros_like(g), np.zeros_like(g)
    gx[:, 1:-1], gy[1:-1] = g[:, 2:] - g[:, :-2], g[2:] - g[:-2]
    mag = np.hypot(gx, gy)
    inner = m.copy()
    inner[1:-1, 1:-1] &= m[:-2, 1:-1] & m[2:, 1:-1] & m[1:-1, :-2] & m[1:-1, 2:]
    ok = inner.sum() > 10
    mv = mag[inner] if ok else mag[m]
    f += [mv.mean(), mv.std(), np.percentile(mv, 90)]
    ang = np.arctan2(gy[inner], gx[inner]) % np.pi if ok else np.zeros(1)
    hist = np.histogram(ang, bins=8, range=(0, np.pi), weights=mag[inner] if ok else None)[0]
    f += list(hist / (hist.sum() + 1e-6))
    f += [np.log1p(area), -1.0 if flat is None else float(flat)]
    return np.array(f)


def colour_proba(x):
    t = TREES
    raw = t["baseline"].astype(np.float64).copy()
    for s, k in zip(t["start"], t["cls"]):
        i = s
        while not t["leaf"][i]:
            i = t["left"][i] if x[t["feature"][i]] <= t["threshold"][i] else t["right"][i]
        raw[k] += t["value"][i]
    e = np.exp(raw - raw.max())
    return e / e.sum()


def cnn_proba(name, crop):
    size = META["sizes"][name]
    a = ((np.asarray(crop.resize((size, size), Image.BILINEAR), np.float32) / 255 - MEAN) / STD).transpose(2, 0, 1)
    views = np.ascontiguousarray(np.stack([np.rot90(v, k, (1, 2)) for v in (a, a[:, :, ::-1]) for k in range(4)]))
    lg = NETS[name].run(None, {"image": views.astype(np.float32)})[0]
    e = np.exp(lg - lg.max(1, keepdims=True))
    return (e / e.sum(1, keepdims=True)).mean(0)


# ------------------------------------------------------------------ public entry point
def predict(lat=None, lon=None, address=None):
    label = None
    if address:
        lat, lon, label = geocode(address)
    f = building_at(lat, lon)
    if f is None:
        return {"ok": False, "error": "no building found at this point"}
    crop, mask, area, flat = roof_crop(f)
    w = META["weights"]
    p = w["colour"] * colour_proba(colour_features(crop, mask, area, flat))
    for name in META["sizes"]:
        p = p + w[name] * cnn_proba(name, crop)
    best = int(p.argmax())
    sure = p[best] >= META["ask_below_confidence"] and area <= META["ask_above_roof_m2"]
    code = f["properties"].get("materiaux_de_la_toiture")
    return {
        "ok": True,
        "address": label,
        "lat": round(lat, 6), "lon": round(lon, 6),
        "building_id": f["properties"]["cleabs"],
        "roof_area_m2": round(area, 1),
        "flat_roof": flat,
        "material": CLASSES[best],
        "confidence": round(float(p[best]), 3),
        "ask_user": not sure,
        "probabilities": {c: round(float(v), 3) for c, v in zip(CLASSES, p)},
        "runoff_coefficient": META["runoff"][CLASSES[best]],
        "ign_material": CODE.get(code or ""),
        "model_version": META.get("model_version"),
        "outline": f["geometry"]["coordinates"][0][0],
    }


if __name__ == "__main__":
    import sys
    a = sys.argv[1:]
    try:
        res = predict(float(a[0]), float(a[1])) if len(a) == 2 and a[0].replace(".", "").isdigit() else predict(address=" ".join(a))
    except Exception as e:
        res = {"ok": False, "error": str(e)}
    res.pop("outline", None)
    print(json.dumps(res, indent=1, ensure_ascii=False))

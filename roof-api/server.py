"""Tiny HTTP API for the app. Standard library only (plus roof.py's three packages).

GET /roof?lat=50.6907&lon=3.1624
GET /roof?address=45 rue de l'Epeule, Roubaix
GET /health

python server.py            (port 8000, or PORT=xxxx)
"""
import json
import os
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import roof


class H(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.end_headers()

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = {k: v[0] for k, v in urllib.parse.parse_qs(u.query).items()}
        if u.path == "/health":
            return self._send(200, {"ok": True})
        if u.path != "/roof":
            return self._send(404, {"ok": False, "error": "use /roof?lat=..&lon=.. or /roof?address=.."})
        try:
            if "address" in q:
                res = roof.predict(address=q["address"])
            else:
                res = roof.predict(float(q["lat"]), float(q["lon"]))
            self._send(200 if res.get("ok") else 404, res)
        except (KeyError, ValueError) as e:
            self._send(400, {"ok": False, "error": f"bad request: {e}"})
        except Exception as e:
            self._send(502, {"ok": False, "error": f"data service problem: {e}"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"roof API on http://localhost:{port}/roof?address=45%20rue%20de%20l'Epeule%20Roubaix")
    ThreadingHTTPServer(("0.0.0.0", port), H).serve_forever()

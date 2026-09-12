#!/usr/bin/env python3
"""HIPAA readiness tool — local only. Python stdlib. Port 8755.

Do not store PHI. Assessments hold practice names, vendor names, and checklist answers.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from score import score_assessment  # noqa: E402

PORT = int(os.environ.get("HIPAA_PORT", "8755"))
STORAGE = HERE / "storage"
QUESTIONS = HERE / "data" / "questions.json"
STATIC_NAMES = {
    "",
    "index.html",
    "styles.css",
    "app.js",
    "favicon.ico",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_questions() -> dict:
    return json.loads(QUESTIONS.read_text(encoding="utf-8"))


def safe_id(value: str) -> str:
    cleaned = (value or "").strip()
    if not cleaned or cleaned in {".", ".."} or "/" in cleaned or "\\" in cleaned:
        raise ValueError("invalid id")
    if any(ch not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_" for ch in cleaned):
        raise ValueError("invalid id")
    return cleaned


def assessment_path(aid: str) -> Path:
    return (STORAGE / f"{safe_id(aid)}.json").resolve()


def read_assessment(aid: str) -> dict | None:
    path = assessment_path(aid)
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def write_assessment(doc: dict) -> dict:
    STORAGE.mkdir(parents=True, exist_ok=True)
    path = assessment_path(doc["id"])
    catalog = load_questions()
    doc["score"] = score_assessment(catalog, doc.get("answers") or {})
    doc["updatedAt"] = utc_now()
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)
    return doc


def list_assessments() -> list[dict]:
    STORAGE.mkdir(parents=True, exist_ok=True)
    rows = []
    for path in sorted(STORAGE.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        rows.append(
            {
                "id": doc.get("id"),
                "orgName": doc.get("orgName") or "Untitled practice",
                "orgType": doc.get("orgType") or "",
                "specialty": doc.get("specialty") or "",
                "updatedAt": doc.get("updatedAt"),
                "percent": (doc.get("score") or {}).get("percent"),
                "band": (doc.get("score") or {}).get("band"),
                "complete": (doc.get("score") or {}).get("complete", False),
            }
        )
    return rows


def json_response(handler: SimpleHTTPRequestHandler, payload: object, status: int = 200) -> None:
    body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_body(handler: SimpleHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length") or 0)
    raw = handler.rfile.read(length) if length else b"{}"
    if not raw:
        return {}
    return json.loads(raw.decode("utf-8"))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(HERE), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path == "/api/health":
            return json_response(self, {"ok": True, "tool": "hipaa-readiness", "port": PORT})
        if path == "/api/questions":
            return json_response(self, load_questions())
        if path == "/api/assessments":
            return json_response(self, {"assessments": list_assessments()})
        if path.startswith("/api/assessments/"):
            aid = path.rsplit("/", 1)[-1]
            try:
                doc = read_assessment(aid)
            except ValueError:
                return json_response(self, {"error": "invalid id"}, 400)
            if not doc:
                return json_response(self, {"error": "not found"}, 404)
            return json_response(self, doc)

        name = path.lstrip("/")
        if name in STATIC_NAMES or name in {"styles.css", "app.js"}:
            if name == "":
                self.path = "/index.html"
            return SimpleHTTPRequestHandler.do_GET(self)

        return json_response(self, {"error": "not found"}, 404)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/assessments":
            return json_response(self, {"error": "not found"}, 404)
        try:
            incoming = read_body(self)
        except json.JSONDecodeError:
            return json_response(self, {"error": "invalid json"}, 400)
        doc = {
            "id": uuid.uuid4().hex[:12],
            "createdAt": utc_now(),
            "orgName": str(incoming.get("orgName") or "").strip()[:120],
            "orgType": str(incoming.get("orgType") or "").strip()[:40],
            "specialty": str(incoming.get("specialty") or "").strip()[:80],
            "staffCount": str(incoming.get("staffCount") or "").strip()[:20],
            "notes": str(incoming.get("notes") or "").strip()[:2000],
            "answers": incoming.get("answers") if isinstance(incoming.get("answers"), dict) else {},
            "baas": incoming.get("baas") if isinstance(incoming.get("baas"), list) else [],
        }
        return json_response(self, write_assessment(doc), 201)

    def do_PUT(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/assessments/"):
            return json_response(self, {"error": "not found"}, 404)
        aid = parsed.path.rsplit("/", 1)[-1]
        try:
            existing = read_assessment(aid)
        except ValueError:
            return json_response(self, {"error": "invalid id"}, 400)
        if not existing:
            return json_response(self, {"error": "not found"}, 404)
        try:
            incoming = read_body(self)
        except json.JSONDecodeError:
            return json_response(self, {"error": "invalid json"}, 400)
        for key in ("orgName", "orgType", "specialty", "staffCount", "notes"):
            if key in incoming:
                existing[key] = str(incoming.get(key) or "").strip()
        if isinstance(incoming.get("answers"), dict):
            existing["answers"] = incoming["answers"]
        if isinstance(incoming.get("baas"), list):
            existing["baas"] = incoming["baas"]
        return json_response(self, write_assessment(existing))

    def do_DELETE(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/assessments/"):
            return json_response(self, {"error": "not found"}, 404)
        aid = parsed.path.rsplit("/", 1)[-1]
        try:
            path = assessment_path(aid)
        except ValueError:
            return json_response(self, {"error": "invalid id"}, 400)
        if not path.is_file():
            return json_response(self, {"error": "not found"}, 404)
        path.unlink()
        return json_response(self, {"ok": True})


def main() -> None:
    STORAGE.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"HIPAA readiness tool  http://127.0.0.1:{PORT}", flush=True)
    print("Local only. Do not enter PHI.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)


if __name__ == "__main__":
    main()

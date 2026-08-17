#!/usr/bin/env python3
"""Cesar's Hub — local file dashboard. Python stdlib only. Port 8743."""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import threading
import webbrowser
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

PORT = 8743
HERE = Path(__file__).resolve().parent
HUB_PATH_FILE = HERE / "hub_path.txt"
CONFIG_FILE = HERE / "data" / "businesses.json"


def load_config() -> dict:
    with CONFIG_FILE.open(encoding="utf-8") as fh:
        return json.load(fh)


def storage_root() -> Path:
    if HUB_PATH_FILE.exists():
        raw = HUB_PATH_FILE.read_text(encoding="utf-8").strip()
        if raw:
            path = Path(raw).expanduser()
            path.mkdir(parents=True, exist_ok=True)
            return path.resolve()
    default = (HERE / "storage").resolve()
    default.mkdir(parents=True, exist_ok=True)
    if not HUB_PATH_FILE.exists():
        HUB_PATH_FILE.write_text(str(default) + "\n", encoding="utf-8")
    return default


def ensure_business_tree(root: Path, cfg: dict) -> None:
    for biz in cfg.get("businesses", []):
        biz_dir = root / biz["id"]
        biz_dir.mkdir(parents=True, exist_ok=True)
        for folder in biz.get("folders") or ["Documents", "Marketing", "Photos", "Estimates"]:
            (biz_dir / folder).mkdir(parents=True, exist_ok=True)


def lan_ip() -> str:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(("8.8.8.8", 80))
        ip = sock.getsockname()[0]
        sock.close()
        return ip
    except OSError:
        return "127.0.0.1"


def json_bytes(payload: object, status: int = 200) -> tuple[int, bytes, str]:
    body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
    return status, body, "application/json; charset=utf-8"


def safe_path(root: Path, biz: str, folder: str | None = None, name: str | None = None) -> Path:
    if not biz or biz in (".", "..") or "/" in biz or "\\" in biz:
        raise ValueError("invalid business")
    base = (root / biz).resolve()
    if not str(base).startswith(str(root.resolve())):
        raise ValueError("bad path")
    target = base
    if folder and folder not in ("root", ".", ""):
        if folder in (".", "..") or "/" in folder or "\\" in folder:
            raise ValueError("invalid folder")
        target = (base / folder).resolve()
    if name:
        name = Path(name).name
        if not name or name in (".", ".."):
            raise ValueError("invalid name")
        target = (target / name).resolve()
    if not str(target).startswith(str(base)):
        raise ValueError("bad path")
    return target


def latest_mtime(path: Path) -> str | None:
    latest = None
    if not path.exists():
        return None
    for item in path.rglob("*"):
        if item.is_file() and item.name.startswith("_"):
            continue
        m = item.stat().st_mtime
        if latest is None or m > latest:
            latest = m
    if latest is None:
        return None
    return datetime.fromtimestamp(latest, tz=timezone.utc).isoformat()


class HubHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(HERE), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send(self, status: int, body: bytes, content_type: str, extra: dict | None = None) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _send_json(self, payload: object, status: int = 200) -> None:
        code, body, ctype = json_bytes(payload, status)
        self._send(code, body, ctype)

    def _query(self) -> dict[str, str]:
        parsed = urlparse(self.path)
        raw = parse_qs(parsed.query)
        return {key: unquote(values[0]) if values else "" for key, values in raw.items()}

    def _read_body(self) -> bytes:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return b""
        return self.rfile.read(length)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self._api_get(parsed.path)
            return
        if parsed.path in ("/", "/index.html"):
            html = (HERE / "index.html").read_bytes()
            self._send(200, html, "text/html; charset=utf-8")
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self._api_post(parsed.path)
            return
        self._send_json({"error": "not found"}, 404)

    def _api_get(self, path: str) -> None:
        q = self._query()
        cfg = load_config()
        root = storage_root()
        ensure_business_tree(root, cfg)

        try:
            if path == "/api/lanurl":
                ip = lan_ip()
                self._send_json({"url": f"http://{ip}:{PORT}", "ip": ip, "port": PORT})
                return
            if path == "/api/businesses":
                self._send_json(
                    {
                        "businesses": cfg.get("businesses", []),
                        "info": cfg.get("info", {}),
                        "contacts": cfg.get("contacts", {}),
                        "snippets": cfg.get("snippets", {}),
                    }
                )
                return
            if path == "/api/list":
                folder = q.get("folder") or "root"
                target = safe_path(root, q.get("biz", ""), None if folder == "root" else folder)
                items = []
                if target.exists():
                    for child in sorted(target.iterdir(), key=lambda p: p.name.lower()):
                        if child.name.startswith("."):
                            continue
                        stat = child.stat()
                        items.append(
                            {
                                "name": child.name,
                                "size": stat.st_size,
                                "mtime": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                                "isDir": child.is_dir(),
                            }
                        )
                self._send_json({"files": items})
                return
            if path == "/api/lastupdated":
                biz = q.get("biz", "")
                self._send_json({"lastUpdated": latest_mtime(safe_path(root, biz))})
                return
            if path == "/api/file":
                target = safe_path(root, q.get("biz", ""), q.get("folder"), q.get("name"))
                if not target.is_file():
                    self._send_json({"error": "not found"}, 404)
                    return
                data = target.read_bytes()
                self._send(200, data, "application/octet-stream", {"Content-Disposition": f'attachment; filename="{target.name}"'})
                return
            if path == "/api/json":
                scope = q.get("scope") or "root"
                name = q.get("file") or ""
                target = safe_path(root, q.get("biz", ""), None if scope == "root" else scope, name)
                if not target.is_file():
                    self._send_json(None)
                    return
                self._send_json(json.loads(target.read_text(encoding="utf-8")))
                return
            if path == "/api/openfolder":
                target = safe_path(root, q.get("biz", ""))
                target.mkdir(parents=True, exist_ok=True)
                opened = False
                try:
                    if sys.platform.startswith("win"):
                        os.startfile(str(target))  # type: ignore[attr-defined]
                        opened = True
                    elif sys.platform == "darwin":
                        subprocess.Popen(["open", str(target)])
                        opened = True
                    else:
                        subprocess.Popen(["xdg-open", str(target)])
                        opened = True
                except OSError:
                    opened = False
                self._send_json({"ok": opened, "path": str(target)})
                return
        except ValueError as exc:
            self._send_json({"error": str(exc)}, 400)
            return
        except OSError as exc:
            self._send_json({"error": str(exc)}, 500)
            return
        self._send_json({"error": "not found"}, 404)

    def _api_post(self, path: str) -> None:
        q = self._query()
        cfg = load_config()
        root = storage_root()
        ensure_business_tree(root, cfg)
        body = self._read_body()

        try:
            if path == "/api/upload":
                folder = q.get("folder") or "Documents"
                name = q.get("name") or "upload.bin"
                target = safe_path(root, q.get("biz", ""), folder, name)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(body)
                self._send_json({"ok": True, "name": target.name, "size": len(body)})
                return
            if path == "/api/delete":
                target = safe_path(root, q.get("biz", ""), q.get("folder"), q.get("name"))
                if target.is_file():
                    target.unlink()
                elif target.is_dir():
                    self._send_json({"error": "will not delete folders"}, 400)
                    return
                self._send_json({"ok": True})
                return
            if path == "/api/json":
                scope = q.get("scope") or "root"
                name = q.get("file") or ""
                target = safe_path(root, q.get("biz", ""), None if scope == "root" else scope, name)
                target.parent.mkdir(parents=True, exist_ok=True)
                payload = json.loads(body.decode("utf-8") or "null")
                target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                self._send_json({"ok": True})
                return
        except ValueError as exc:
            self._send_json({"error": str(exc)}, 400)
            return
        except (OSError, json.JSONDecodeError) as exc:
            self._send_json({"error": str(exc)}, 400)
            return
        self._send_json({"error": "not found"}, 404)


def main() -> None:
    cfg = load_config()
    root = storage_root()
    ensure_business_tree(root, cfg)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), HubHandler)
    url = f"http://127.0.0.1:{PORT}/?biz=barber-lounge&production=1"
    print(f"Cesar's Hub  {url}")
    print(f"Phone        http://{lan_ip()}:{PORT}")
    print(f"Storage      {root}")
    if os.environ.get("HUB_NO_BROWSER") != "1":
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()

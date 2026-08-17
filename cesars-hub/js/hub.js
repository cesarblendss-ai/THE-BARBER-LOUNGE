/* Cesar's Hub — local multi-business dashboard. */
(function (global) {
  const Hub = {
    BUSINESSES: (global.HUB_FALLBACK || []).slice(),
    BUSINESS_INFO: {},
    DEFAULT_CONTACTS: {},
    DEFAULT_SNIPPETS: {},
    view: "hub",
    bizId: "",
    query: "",
    files: {},
    lastUpdated: {},
    tracker: { files: {} },
    wizard: null,
    lan: null,
    production: false,

    esc(s) {
      return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },

    currentBiz() {
      return this.BUSINESSES.find((b) => b.id === this.bizId) || this.BUSINESSES[0];
    },

    params() {
      const u = new URL(location.href);
      return u.searchParams;
    },

    syncUrl() {
      const u = new URL(location.href);
      if (this.production) u.searchParams.set("production", "1");
      if (this.view === "hub") {
        u.searchParams.delete("biz");
        u.searchParams.delete("view");
      } else {
        u.searchParams.set("biz", this.bizId);
        if (this.view === "business") u.searchParams.delete("view");
        else u.searchParams.set("view", this.view);
      }
      history.replaceState({}, "", u);
    },

    go(view, bizId) {
      if (bizId) this.bizId = bizId;
      this.view = view;
      if (view === "hub") this.bizId = "";
      this.syncUrl();
      this.paint();
      if (view === "business" && this.bizId) this.refreshBusiness();
      if (view === "tracker" && this.bizId) this.loadTracker();
    },

    toast(msg) {
      const el = document.getElementById("toast");
      if (!el) return;
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(this._toast);
      this._toast = setTimeout(() => el.classList.remove("show"), 2400);
    },

    async api(path, opts) {
      const res = await fetch(path, opts);
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) return res.json();
      if (!res.ok) throw new Error(await res.text());
      return res;
    },

    mergeBusinesses(payload) {
      const server = payload.businesses || [];
      const ui = {};
      (global.HUB_FALLBACK || []).forEach((b) => {
        ui[b.id] = b;
      });
      this.BUSINESSES = server.map((b) => {
        const extra = ui[b.id] || {};
        return { ...extra, ...b };
      });
      if (!server.length) this.BUSINESSES = (global.HUB_FALLBACK || []).slice();
      this.BUSINESS_INFO = payload.info || {};
      this.DEFAULT_CONTACTS = payload.contacts || {};
      this.DEFAULT_SNIPPETS = payload.snippets || {};
    },

    async boot() {
      const q = this.params();
      this.production = q.get("production") === "1";
      this.bizId = q.get("biz") || "";
      this.view = q.get("view") || (this.bizId ? "business" : "hub");
      try {
        const payload = await this.api("/api/businesses");
        this.mergeBusinesses(payload);
      } catch {
        this.mergeBusinesses({ businesses: global.HUB_FALLBACK || [] });
      }
      this.paint();
      this.loadLan();
      if (this.bizId) this.refreshBusiness();
      if (this.view === "tracker") this.loadTracker();
    },

    async loadLan() {
      try {
        this.lan = await this.api("/api/lanurl");
        const chip = document.getElementById("lanChip");
        const label = document.getElementById("lanLabel");
        const qr = document.getElementById("lanQr");
        const big = document.getElementById("qrBig");
        const modal = document.getElementById("qrModal");
        if (!this.lan || !chip) return;
        const url = this.lan.url;
        const src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(url)}`;
        label.textContent = url.replace(/^https?:\/\//, "");
        qr.src = src;
        big.src = src;
        chip.hidden = false;
        qr.onclick = () => modal.classList.add("open");
        modal.onclick = () => modal.classList.remove("open");
      } catch {
        /* local-only */
      }
    },

    setBizColor(biz) {
      document.documentElement.style.setProperty("--biz", (biz && biz.color) || "#c9a227");
    },

    paint() {
      const app = document.getElementById("app");
      if (!app) return;
      const biz = this.currentBiz();
      this.setBizColor(this.view === "hub" ? null : biz);
      if (this.view === "hub") app.innerHTML = this.renderHub();
      else if (this.view === "estimates") app.innerHTML = this.renderEstimates(biz);
      else if (this.view === "wizard") app.innerHTML = global.HubWizard.render(this, biz);
      else if (this.view === "tracker") app.innerHTML = this.renderTracker(biz);
      else app.innerHTML = this.renderBusiness(biz);
      this.bindUploads();
    },

    renderHub() {
      const q = (this.query || "").toLowerCase();
      const list = this.BUSINESSES.filter((b) => !q || `${b.name} ${b.role}`.toLowerCase().includes(q));
      const seo = list.filter((b) => b.seoClient);
      const rest = list.filter((b) => !b.seoClient);
      const ordered = [...rest, ...seo];
      const n = ordered.length || 1;
      const nodes = ordered
        .map((b, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const left = 50 + Math.cos(angle) * 34;
          const top = 48 + Math.sin(angle) * 36;
          const initial = b.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
          return `<a class="hub-node" href="?biz=${encodeURIComponent(b.id)}${this.production ? "&production=1" : ""}" style="left:${left}%;top:${top}%" onclick="event.preventDefault();Hub.go('business','${b.id}')">
            <div class="orb" style="background:${b.color}">${this.esc(initial)}</div>
            <div class="name">${this.esc(b.name)}</div>
            <div class="role">${this.esc(b.role || "")}</div>
            ${b.seoClient ? '<div class="badge">SEO client</div>' : ""}
          </a>`;
        })
        .join("");
      const mobile = ordered
        .map((b) => {
          const initial = b.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
          return `<a class="card biz-row" href="?biz=${encodeURIComponent(b.id)}" onclick="event.preventDefault();Hub.go('business','${b.id}')">
            <div class="orb" style="background:${b.color}">${this.esc(initial)}</div>
            <div><strong>${this.esc(b.name)}</strong><div class="small muted">${this.esc(b.role || "")}</div>${b.seoClient ? '<span class="badge">SEO client</span>' : ""}</div>
          </a>`;
        })
        .join("");
      return `
        <input class="search" placeholder="Filter businesses…" value="${this.esc(this.query)}" oninput="Hub.query=this.value;Hub.paint()" />
        <div class="hub-graph">
          <div class="hub-center"><div><strong>CESAR'S<br/>HUB</strong><div class="small muted">local</div></div></div>
          ${nodes}
        </div>
        <div class="hub-list">${mobile}</div>
      `;
    },

    renderBusiness(biz) {
      if (!biz) return "<p>Unknown business.</p>";
      const folders = biz.folders || ["Documents", "Marketing", "Photos", "Estimates"];
      const cards = folders
        .map((folder) => {
          const files = (this.files[folder] || []).filter((f) => !f.isDir && !f.name.startsWith("_"));
          const rows = files
            .slice(0, 8)
            .map(
              (f) => `<li><a href="/api/file?biz=${encodeURIComponent(biz.id)}&folder=${encodeURIComponent(folder)}&name=${encodeURIComponent(f.name)}">${this.esc(f.name)}</a>
                <button class="ghost" onclick="Hub.removeFile('${folder}','${this.esc(f.name)}')">×</button></li>`
            )
            .join("");
          const photo = folder === "Photos" || folder === "Marketing";
          return `<article class="card" data-folder="${this.esc(folder)}">
            <h3>${this.esc(folder)}</h3>
            <p class="small muted">${files.length} file${files.length === 1 ? "" : "s"}</p>
            <div class="drop" data-folder="${this.esc(folder)}">${photo ? "Tap or drop photos here" : "Drop files or tap to upload"}
              <input type="file" ${photo ? "accept='image/*,video/*' capture='environment'" : ""} multiple hidden />
            </div>
            <div class="progress"><span></span></div>
            <ul class="file-list">${rows || "<li class='muted'>Empty</li>"}</ul>
          </article>`;
        })
        .join("");
      const links = [];
      if (biz.instagram) links.push(`<a class="btn" href="${this.esc(biz.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
      if (biz.google) links.push(`<a class="btn" href="${this.esc(biz.google)}" target="_blank" rel="noopener">Website</a>`);
      const updated = this.lastUpdated[biz.id];
      return `
        <p><button class="ghost" onclick="Hub.go('hub')">← All businesses</button></p>
        <h1 style="color:${biz.color}">${this.esc(biz.name)}</h1>
        <p class="muted">${this.esc(biz.role || "")}${updated ? " · updated " + new Date(updated).toLocaleString() : ""}</p>
        <div class="quick-row">
          ${biz.hasEstimates ? `<button class="primary" onclick="HubWizard.start(Hub.currentBiz())">New Estimate</button>` : ""}
          ${biz.hasEstimates ? `<button class="btn" onclick="Hub.go('estimates')">Freeform estimate</button>` : ""}
          <button class="btn" onclick="document.querySelector('[data-folder=Photos] input')?.click()">Upload Photos</button>
          <button class="btn" onclick="Hub.openFolder()">Open Folder</button>
          ${biz.hasEstimates ? `<button class="btn" onclick="Hub.go('tracker')">Estimates Tracker</button>` : ""}
        </div>
        <div class="link-row" style="margin-top:10px">${links.join("")}</div>
        <div class="folder-grid">${cards}</div>
      `;
    },

    renderEstimates(biz) {
      const cats = this.DEFAULT_SNIPPETS[biz.id] || {};
      const buttons = Object.entries(cats)
        .flatMap(([cat, items]) =>
          items.map(
            (sn) =>
              `<button class="chip" type="button" onclick="Hub.insertSnippet(${JSON.stringify(sn.text)})">${this.esc(cat)} · ${this.esc(sn.text)}</button>`
          )
        )
        .join("");
      return `
        <p><button class="ghost" onclick="Hub.go('business')">← ${this.esc(biz.name)}</button>
           ${biz.hasEstimates ? `<button class="primary" onclick="HubWizard.start(Hub.currentBiz())">Guided wizard</button>` : ""}</p>
        <h1>Estimate</h1>
        <div class="chips">${buttons}</div>
        <div class="field" style="margin-top:12px"><textarea id="freeform" rows="16" placeholder="Write the estimate…"></textarea></div>
        <button class="primary" onclick="Hub.saveFreeform()">Save .txt</button>
      `;
    },

    renderTracker(biz) {
      const files = Object.entries(this.tracker.files || {});
      const rows = files
        .map(([name, meta]) => {
          const st = meta.status || "saved";
          return `<tr>
            <td><a href="/api/file?biz=${encodeURIComponent(biz.id)}&folder=Estimates&name=${encodeURIComponent(name)}">${this.esc(name)}</a></td>
            <td>${this.esc(st)}</td>
            <td>
              <button class="ghost" onclick="Hub.trackEstimate('${biz.id}','${this.esc(name)}','saved').then(()=>Hub.loadTracker())">saved</button>
              <button class="ghost" onclick="Hub.trackEstimate('${biz.id}','${this.esc(name)}','sent').then(()=>Hub.loadTracker())">sent</button>
              <button class="ghost" onclick="Hub.trackEstimate('${biz.id}','${this.esc(name)}','opened').then(()=>Hub.loadTracker())">opened</button>
            </td>
          </tr>`;
        })
        .join("");
      return `
        <p><button class="ghost" onclick="Hub.go('business')">← ${this.esc(biz.name)}</button></p>
        <h1>Estimates tracker</h1>
        <p class="muted">Saved / sent / opened — backfilled from the Estimates folder.</p>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th align="left">File</th><th align="left">Status</th><th></th></tr></thead>
          <tbody>${rows || "<tr><td class='muted'>No estimates yet.</td></tr>"}</tbody>
        </table>
      `;
    },

    bindUploads() {
      document.querySelectorAll(".drop").forEach((drop) => {
        const input = drop.querySelector("input");
        const folder = drop.getAttribute("data-folder");
        const card = drop.closest(".card");
        const bar = card && card.querySelector(".progress span");
        const wrap = card && card.querySelector(".progress");
        const pick = () => input && input.click();
        drop.onclick = pick;
        drop.ondragover = (e) => {
          e.preventDefault();
          drop.classList.add("hot");
        };
        drop.ondragleave = () => drop.classList.remove("hot");
        drop.ondrop = (e) => {
          e.preventDefault();
          drop.classList.remove("hot");
          this.uploadList(folder, e.dataTransfer.files, wrap, bar);
        };
        if (input) {
          input.onchange = () => this.uploadList(folder, input.files, wrap, bar);
        }
      });
    },

    async uploadList(folder, fileList, wrap, bar) {
      const files = Array.from(fileList || []);
      if (!files.length) return;
      if (wrap) wrap.style.display = "block";
      for (let i = 0; i < files.length; i++) {
        if (bar) bar.style.width = `${Math.round(((i + 1) / files.length) * 100)}%`;
        await this.uploadBlob(this.bizId, folder, files[i].name, files[i]);
      }
      this.toast("Uploaded");
      this.refreshBusiness();
    },

    async uploadBlob(biz, folder, name, blob) {
      const res = await fetch(
        `/api/upload?biz=${encodeURIComponent(biz)}&folder=${encodeURIComponent(folder)}&name=${encodeURIComponent(name)}`,
        { method: "POST", body: blob }
      );
      if (!res.ok) throw new Error("upload failed");
      return res.json();
    },

    async removeFile(folder, name) {
      if (!confirm(`Delete ${name}?`)) return;
      await fetch(
        `/api/delete?biz=${encodeURIComponent(this.bizId)}&folder=${encodeURIComponent(folder)}&name=${encodeURIComponent(name)}`,
        { method: "POST" }
      );
      this.refreshBusiness();
    },

    async refreshBusiness() {
      const biz = this.currentBiz();
      if (!biz) return;
      const folders = biz.folders || [];
      const next = {};
      await Promise.all(
        folders.map(async (folder) => {
          try {
            const data = await this.api(`/api/list?biz=${encodeURIComponent(biz.id)}&folder=${encodeURIComponent(folder)}`);
            next[folder] = data.files || [];
          } catch {
            next[folder] = [];
          }
        })
      );
      this.files = next;
      try {
        const lu = await this.api(`/api/lastupdated?biz=${encodeURIComponent(biz.id)}`);
        this.lastUpdated[biz.id] = lu.lastUpdated;
      } catch {
        /* ignore */
      }
      if (this.view === "business") this.paint();
    },

    async openFolder() {
      try {
        const data = await this.api(`/api/openfolder?biz=${encodeURIComponent(this.bizId)}`);
        this.toast(data.ok ? "Opened on this computer" : data.path);
      } catch (err) {
        this.toast(err.message);
      }
    },

    async saveFreeform() {
      const ta = document.getElementById("freeform");
      const text = (ta && ta.value.trim()) || "";
      if (!text) return this.toast("Write something first");
      const name = `${global.HubPdf.stamp()}-estimate.txt`;
      await this.uploadBlob(this.bizId, "Estimates", name, new Blob([text], { type: "text/plain" }));
      await this.trackEstimate(this.bizId, name, "saved");
      this.toast("Saved " + name);
    },

    insertSnippet(text) {
      const ta = document.getElementById("freeform");
      if (!ta) return;
      ta.value = (ta.value ? ta.value + "\n" : "") + text;
      ta.focus();
    },

    async loadTracker() {
      const biz = this.currentBiz();
      let status = { files: {} };
      try {
        const data = await this.api(
          `/api/json?biz=${encodeURIComponent(biz.id)}&scope=Estimates&file=_status.json`
        );
        if (data && data.files) status = data;
      } catch {
        /* empty */
      }
      try {
        const list = await this.api(`/api/list?biz=${encodeURIComponent(biz.id)}&folder=Estimates`);
        (list.files || []).forEach((f) => {
          if (f.isDir || f.name.startsWith("_")) return;
          if (!status.files[f.name]) status.files[f.name] = { status: "saved", savedAt: f.mtime };
        });
      } catch {
        /* ignore */
      }
      this.tracker = status;
      await fetch(
        `/api/json?biz=${encodeURIComponent(biz.id)}&scope=Estimates&file=_status.json`,
        { method: "POST", body: JSON.stringify(status) }
      );
      if (this.view === "tracker") this.paint();
    },

    async trackEstimate(bizId, name, status) {
      let data = { files: {} };
      try {
        const existing = await this.api(
          `/api/json?biz=${encodeURIComponent(bizId)}&scope=Estimates&file=_status.json`
        );
        if (existing && existing.files) data = existing;
      } catch {
        /* ignore */
      }
      const now = new Date().toISOString();
      data.files[name] = { ...(data.files[name] || {}), status, [`${status}At`]: now };
      await fetch(`/api/json?biz=${encodeURIComponent(bizId)}&scope=Estimates&file=_status.json`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      this.tracker = data;
    },
  };

  global.Hub = Hub;
  document.addEventListener("DOMContentLoaded", () => Hub.boot());
})(window);

/* HIPAA readiness — local SPA. Practice metadata + checklist only. No PHI. */
(function () {
  const state = {
    catalog: null,
    list: [],
    doc: null,
    sectionId: "",
    view: "home",
  };

  const $ = (sel) => document.querySelector(sel);
  const main = () => $("#main");

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2400);
  }

  async function api(path, opts) {
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  function hashParts() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    const [route, id, extra] = raw.split("/").filter(Boolean);
    return { route: route || "home", id: id || "", extra: extra || "" };
  }

  function go(hash) {
    location.hash = hash.startsWith("#") ? hash : `#${hash}`;
  }

  function bandClass(id) {
    return `band-${id || "empty"}`;
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  function currentSection() {
    const sections = state.catalog?.sections || [];
    return sections.find((s) => s.id === state.sectionId) || sections[0];
  }

  function answeredCount(doc) {
    const answers = doc?.answers || {};
    return (state.catalog?.sections || []).reduce((n, s) => {
      return n + s.questions.filter((q) => answers[q.id]).length;
    }, 0);
  }

  function totalQuestions() {
    return (state.catalog?.sections || []).reduce((n, s) => n + s.questions.length, 0);
  }

  function renderHome() {
    const rows = state.list
      .map((item) => {
        const pct = item.percent == null ? "—" : `${item.percent}%`;
        return `<li>
          <div>
            <a href="#/assess/${esc(item.id)}">${esc(item.orgName)}</a>
            <div class="small muted">${esc(item.orgType || "Practice")} ${item.specialty ? "· " + esc(item.specialty) : ""} · ${esc(formatDate(item.updatedAt))}</div>
          </div>
          <div class="row">
            <strong class="${bandClass(item.band?.id)}">${esc(pct)}</strong>
            <button class="ghost" type="button" data-del="${esc(item.id)}">Delete</button>
          </div>
        </li>`;
      })
      .join("");

    main().innerHTML = `
      <section class="hero">
        <h1>HIPAA readiness tool</h1>
        <p class="muted">Walk a clinic, therapist, dentist, or med spa through Privacy Rule, Security Rule, BAAs, and breach response. Saves on this machine only.</p>
        <p class="disclaimer">${esc(state.catalog.disclaimer)}</p>
        <div class="row" style="margin-top:16px">
          <button class="primary" type="button" id="newBtn">New assessment</button>
        </div>
      </section>
      <section class="card">
        <h2>Saved assessments</h2>
        <ul class="list">${rows || '<li class="muted">None yet. Start one for a healthcare client or your own test practice.</li>'}</ul>
      </section>
    `;
    $("#newBtn").onclick = newAssessment;
    main().querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = () => deleteAssessment(btn.getAttribute("data-del"));
    });
  }

  function renderProfile() {
    const doc = state.doc;
    main().innerHTML = `
      <p class="no-print"><a class="ghost" href="#/">← All assessments</a></p>
      <section class="card">
        <h1>Practice profile</h1>
        <p class="muted">Use the legal or DBA name. Do not list patients.</p>
        <div class="grid two">
          <div class="field"><label for="orgName">Practice name</label>
            <input id="orgName" value="${esc(doc.orgName)}" maxlength="120" /></div>
          <div class="field"><label for="orgType">Type</label>
            <select id="orgType">
              <option value="covered-entity" ${doc.orgType === "covered-entity" ? "selected" : ""}>Covered entity (clinic / provider)</option>
              <option value="business-associate" ${doc.orgType === "business-associate" ? "selected" : ""}>Business associate (vendor)</option>
              <option value="hybrid" ${doc.orgType === "hybrid" ? "selected" : ""}>Hybrid / unsure</option>
            </select></div>
          <div class="field"><label for="specialty">Specialty</label>
            <input id="specialty" value="${esc(doc.specialty)}" placeholder="Dental, therapy, med spa…" maxlength="80" /></div>
          <div class="field"><label for="staffCount">Workforce size</label>
            <input id="staffCount" value="${esc(doc.staffCount)}" placeholder="e.g. 8" maxlength="20" /></div>
        </div>
        <div class="field"><label for="notes">Internal notes (no PHI)</label>
          <textarea id="notes" rows="3" maxlength="2000">${esc(doc.notes)}</textarea></div>
        <div class="row">
          <button class="primary" type="button" id="saveProfile">Save and start checklist</button>
        </div>
      </section>
    `;
    $("#saveProfile").onclick = async () => {
      await saveDoc({
        orgName: $("#orgName").value,
        orgType: $("#orgType").value,
        specialty: $("#specialty").value,
        staffCount: $("#staffCount").value,
        notes: $("#notes").value,
      });
      go(`#/assess/${doc.id}`);
    };
  }

  function renderAssess() {
    const doc = state.doc;
    const section = currentSection();
    const score = doc.score || {};
    const nav = (state.catalog.sections || [])
      .map((s) => {
        const on = s.id === section.id ? "on" : "";
        return `<button type="button" class="${on}" data-sec="${esc(s.id)}">${esc(s.title)}</button>`;
      })
      .join("");

    const questions = section.questions
      .map((q) => {
        const val = (doc.answers || {})[q.id] || "";
        const choices = state.catalog.answers
          .map(
            (a) => `<label><input type="radio" name="${esc(q.id)}" value="${esc(a.id)}" ${val === a.id ? "checked" : ""} /> ${esc(a.label)}</label>`
          )
          .join("");
        return `<article class="question">
          <h3>${esc(q.text)} <span class="priority ${esc(q.priority)}">${esc(q.priority)}</span></h3>
          <p class="small muted">${esc(q.help)}</p>
          <div class="choices">${choices}</div>
        </article>`;
      })
      .join("");

    const done = answeredCount(doc);
    const total = totalQuestions();
    const pct = score.percent == null ? 0 : score.percent;

    main().innerHTML = `
      <p class="no-print row">
        <a class="ghost" href="#/">← All assessments</a>
        <a class="ghost" href="#/profile/${esc(doc.id)}">Edit profile</a>
        <a class="ghost" href="#/baas/${esc(doc.id)}">BAA register</a>
        <a class="primary" href="#/report/${esc(doc.id)}">Report</a>
      </p>
      <section class="card">
        <div class="score-ring">
          <div class="num ${bandClass(score.band?.id)}">${esc(String(pct))}%</div>
          <div>
            <h1>${esc(doc.orgName || "Untitled practice")}</h1>
            <p class="muted">${esc(score.band?.label || "Not started")} · ${done} / ${total} answered</p>
          </div>
        </div>
        <div class="progress" aria-hidden="true"><span style="width:${Math.min(100, (done / total) * 100)}%"></span></div>
        <nav class="section-nav" aria-label="Checklist sections">${nav}</nav>
        <h2>${esc(section.title)}</h2>
        <p class="muted">${esc(section.blurb)}</p>
        ${questions}
      </section>
    `;
    main().querySelectorAll("[data-sec]").forEach((btn) => {
      btn.onclick = () => {
        state.sectionId = btn.getAttribute("data-sec");
        renderAssess();
      };
    });
    main().querySelectorAll(".choices input").forEach((input) => {
      input.onchange = () => {
        doc.answers = doc.answers || {};
        doc.answers[input.name] = input.value;
        saveDoc({ answers: doc.answers }).catch((err) => toast(err.message));
      };
    });
  }

  function renderBaas() {
    const doc = state.doc;
    const rows = (doc.baas || [])
      .map((b, i) => `<tr>
        <td>${esc(b.vendor)}</td>
        <td>${esc(b.purpose)}</td>
        <td>${esc(b.signed)}</td>
        <td>${esc(b.date)}</td>
        <td class="no-print"><button class="ghost" type="button" data-rm="${i}">Remove</button></td>
      </tr>`)
      .join("");
    main().innerHTML = `
      <p class="no-print row">
        <a class="ghost" href="#/assess/${esc(doc.id)}">← Checklist</a>
        <a class="primary" href="#/report/${esc(doc.id)}">Report</a>
      </p>
      <section class="card">
        <h1>Business Associate register</h1>
        <p class="muted">Vendors that create, receive, maintain, or transmit PHI. No patient names.</p>
        <div class="grid two">
          <div class="field"><label for="vendor">Vendor</label><input id="vendor" placeholder="EHR, billing, IT…" /></div>
          <div class="field"><label for="purpose">What they touch</label><input id="purpose" placeholder="Hosting, claims, backups…" /></div>
          <div class="field"><label for="signed">Signed BAA</label>
            <select id="signed"><option>No</option><option>Yes</option><option>In progress</option></select></div>
          <div class="field"><label for="date">Date</label><input id="date" type="date" /></div>
        </div>
        <button class="primary no-print" type="button" id="addBaa">Add vendor</button>
        <table style="margin-top:16px">
          <thead><tr><th>Vendor</th><th>Purpose</th><th>BAA</th><th>Date</th><th class="no-print"></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5" class="muted">None yet.</td></tr>'}</tbody>
        </table>
      </section>
    `;
    $("#addBaa").onclick = async () => {
      const vendor = $("#vendor").value.trim();
      if (!vendor) return toast("Add a vendor name.");
      doc.baas = doc.baas || [];
      doc.baas.push({
        vendor,
        purpose: $("#purpose").value.trim(),
        signed: $("#signed").value,
        date: $("#date").value,
      });
      await saveDoc({ baas: doc.baas });
      renderBaas();
    };
    main().querySelectorAll("[data-rm]").forEach((btn) => {
      btn.onclick = async () => {
        doc.baas.splice(Number(btn.getAttribute("data-rm")), 1);
        await saveDoc({ baas: doc.baas });
        renderBaas();
      };
    });
  }

  function renderReport() {
    const doc = state.doc;
    const score = doc.score || {};
    const sections = (score.sections || [])
      .map((s) => `<li><strong>${esc(s.title)}</strong> — ${s.percent == null ? "—" : s.percent + "%"} (${s.earned}/${s.possible})</li>`)
      .join("");
    const gaps = (score.gaps || [])
      .map(
        (g) => `<li>
          <span class="priority ${esc(g.priority)}">${esc(g.priority)}</span>
          <strong>${esc(g.sectionTitle)}</strong>
          <div>${esc(g.text)}</div>
          <div class="small muted">Answered ${esc(g.answer)}. ${esc(g.help)}</div>
        </li>`
      )
      .join("");
    const baas = (doc.baas || [])
      .map((b) => `<li>${esc(b.vendor)} — ${esc(b.purpose || "PHI access")} — BAA: ${esc(b.signed)}${b.date ? " (" + esc(b.date) + ")" : ""}</li>`)
      .join("");

    main().innerHTML = `
      <p class="no-print row">
        <a class="ghost" href="#/assess/${esc(doc.id)}">← Checklist</a>
        <button class="primary" type="button" onclick="window.print()">Print / save PDF</button>
      </p>
      <article class="card">
        <h1>HIPAA readiness report</h1>
        <p><strong>${esc(doc.orgName || "Untitled practice")}</strong>
          · ${esc(doc.orgType || "")} ${doc.specialty ? "· " + esc(doc.specialty) : ""}
          ${doc.staffCount ? "· workforce " + esc(doc.staffCount) : ""}</p>
        <p class="muted">Updated ${esc(formatDate(doc.updatedAt))}</p>
        <div class="score-ring">
          <div class="num ${bandClass(score.band?.id)}">${esc(String(score.percent ?? 0))}%</div>
          <div>
            <h2>${esc(score.band?.label || "Not started")}</h2>
            <p>${esc(score.band?.blurb || "")}</p>
          </div>
        </div>
        <h2>By domain</h2>
        <ul>${sections || "<li class='muted'>No scored answers yet.</li>"}</ul>
        <h2>Priority gaps</h2>
        <ul class="gap-list">${gaps || "<li class='muted'>No open gaps on answered items.</li>"}</ul>
        <h2>Business associates on file</h2>
        <ul>${baas || "<li class='muted'>None recorded.</li>"}</ul>
        <h2>What this is not</h2>
        <p class="disclaimer">${esc(state.catalog.disclaimer)} This report is a working document for the practice and its counsel. Do not advertise “HIPAA certified” or “lawsuit-proof.”</p>
      </article>
    `;
  }

  async function newAssessment() {
    const doc = await api("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgName: "", orgType: "covered-entity", answers: {}, baas: [] }),
    });
    state.doc = doc;
    go(`#/profile/${doc.id}`);
  }

  async function saveDoc(patch) {
    Object.assign(state.doc, patch);
    state.doc = await api(`/api/assessments/${state.doc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.doc),
    });
    return state.doc;
  }

  async function deleteAssessment(id) {
    if (!confirm("Delete this assessment? This cannot be undone.")) return;
    await api(`/api/assessments/${id}`, { method: "DELETE" });
    toast("Deleted.");
    await loadList();
    renderHome();
  }

  async function loadList() {
    const data = await api("/api/assessments");
    state.list = data.assessments || [];
  }

  async function loadDoc(id) {
    state.doc = await api(`/api/assessments/${id}`);
    if (!state.sectionId) state.sectionId = state.catalog.sections[0].id;
  }

  async function route() {
    if (!state.catalog) state.catalog = await api("/api/questions");
    const { route, id } = hashParts();
    try {
      if (route === "home" || !route) {
        await loadList();
        renderHome();
        return;
      }
      if (!id) {
        go("#/");
        return;
      }
      await loadDoc(id);
      if (route === "profile") renderProfile();
      else if (route === "baas") renderBaas();
      else if (route === "report") renderReport();
      else renderAssess();
    } catch (err) {
      main().innerHTML = `<section class="card"><h1>Could not load</h1><p>${esc(err.message)}</p><p><a href="#/">Back home</a></p></section>`;
    }
  }

  window.addEventListener("hashchange", route);
  route();
})();

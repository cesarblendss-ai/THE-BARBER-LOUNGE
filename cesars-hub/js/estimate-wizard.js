/* Cesar's Hub — guided estimate wizard. */
(function (global) {
  const STEPS = ["client", "category", "tasks", "morejobs", "prices", "review", "done"];

  function emptyWizard(biz) {
    return {
      bizId: biz.id,
      step: "client",
      lang: biz.bilingual ? "en" : "en",
      clientName: "",
      clientPhone: "",
      address: "",
      notes: "",
      jobs: [],
      currentCategory: "",
      picked: {},
      addressHits: [],
    };
  }

  function t(w, biz, en, es) {
    return biz.bilingual && w.lang === "es" ? es : en;
  }

  function snippetsFor(hub, bizId) {
    return (hub.DEFAULT_SNIPPETS && hub.DEFAULT_SNIPPETS[bizId]) || {};
  }

  function infoFor(hub, bizId) {
    return (hub.BUSINESS_INFO && hub.BUSINESS_INFO[bizId]) || { legalName: "", contact: "", phone: "", email: "", address: "" };
  }

  function contactsFor(hub, bizId) {
    return (hub.DEFAULT_CONTACTS && hub.DEFAULT_CONTACTS[bizId]) || [];
  }

  function currentItems(w) {
    return w.jobs.flatMap((job) => job.items);
  }

  function money(n) {
    const v = Number(n) || 0;
    return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
  }

  function totalOf(w) {
    return currentItems(w).reduce((sum, item) => {
      if (item.type === "Note") return sum;
      return sum + (Number(item.qty) || 0) * (Number(item.price) || 0);
    }, 0);
  }

  function estimateText(hub, biz, w) {
    const info = infoFor(hub, biz.id);
    const lines = [];
    lines.push(info.legalName || biz.name);
    if (info.contact) lines.push(info.contact);
    if (info.phone && info.phone !== "TBD") lines.push(info.phone);
    if (info.email && info.email !== "TBD") lines.push(info.email);
    lines.push("");
    lines.push(`Estimate for: ${w.clientName || "—"}`);
    if (w.clientPhone) lines.push(`Phone: ${w.clientPhone}`);
    if (w.address) lines.push(`Job site: ${w.address}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push("");
    currentItems(w).forEach((item) => {
      const amt = item.type === "Note" ? "" : `  ${money((Number(item.qty) || 0) * (Number(item.price) || 0))}`;
      lines.push(`- [${item.type}] ${item.text}${item.qty && item.type !== "Note" ? `  x${item.qty}` : ""}${amt}`);
    });
    lines.push("");
    lines.push(`Total: ${money(totalOf(w))}`);
    if (w.notes) {
      lines.push("");
      lines.push("Notes:");
      lines.push(w.notes);
    }
    lines.push("");
    lines.push("This is an estimate, not a contract. Prices may change after site inspection.");
    return lines.join("\n");
  }

  function renderSteps(w) {
    return `<div class="steps">${STEPS.map((s) => `<span class="${s === w.step ? "on" : ""}">${s}</span>`).join("")}</div>`;
  }

  function renderClient(hub, biz, w) {
    const contacts = contactsFor(hub, biz.id);
    const hits = (w.addressHits || [])
      .map(
        (hit, i) =>
          `<button type="button" class="chip" onclick="HubWizard.pickAddress(${i})">${hub.esc(hit.display_name)}</button>`
      )
      .join("");
    const saved = contacts
      .map(
        (c, i) =>
          `<button type="button" class="chip" onclick="HubWizard.pickContact(${i})">${hub.esc(c.name)}</button>`
      )
      .join("");
    return `
      ${renderSteps(w)}
      <h2>${t(w, biz, "Who is this for?", "¿Para quién es?")}</h2>
      ${biz.bilingual ? `<p class="small"><button class="ghost" type="button" onclick="HubWizard.setLang('${w.lang === "es" ? "en" : "es"}')">${w.lang === "es" ? "English" : "Español"}</button></p>` : ""}
      <div class="field"><label>${t(w, biz, "Client name", "Nombre")}</label>
        <input id="wName" value="${hub.esc(w.clientName)}" oninput="HubWizard.patch({clientName:this.value})" /></div>
      <div class="field"><label>${t(w, biz, "Phone", "Teléfono")}</label>
        <input id="wPhone" value="${hub.esc(w.clientPhone)}" oninput="HubWizard.patch({clientPhone:this.value})" /></div>
      <div class="field"><label>${t(w, biz, "Job address", "Dirección del trabajo")}</label>
        <input id="wAddr" value="${hub.esc(w.address)}" oninput="HubWizard.patch({address:this.value})" onblur="HubWizard.lookupAddress()" /></div>
      <div class="chips">${hits}</div>
      ${saved ? `<p class="small muted">${t(w, biz, "Saved contacts", "Contactos")}</p><div class="chips">${saved}</div>` : ""}
      <p style="margin-top:16px"><button class="primary" onclick="HubWizard.go('category')">${t(w, biz, "Next", "Siguiente")}</button></p>
    `;
  }

  function renderCategory(hub, biz, w) {
    const cats = Object.keys(snippetsFor(hub, biz.id));
    if (!cats.length) {
      return `${renderSteps(w)}<p>No snippet categories yet. Use the freeform estimate builder.</p>
        <button class="ghost" onclick="HubWizard.go('client')">Back</button>`;
    }
    const chips = cats
      .map(
        (c) =>
          `<button type="button" class="chip ${w.currentCategory === c ? "picked" : ""}" onclick="HubWizard.pickCategory('${hub.esc(c)}')">${hub.esc(c)}</button>`
      )
      .join("");
    return `
      ${renderSteps(w)}
      <h2>${t(w, biz, "What kind of job?", "¿Qué tipo de trabajo?")}</h2>
      <div class="chips">${chips}</div>
      <p style="margin-top:16px">
        <button class="ghost" onclick="HubWizard.go('client')">Back</button>
        <button class="primary" onclick="HubWizard.go('tasks')" ${w.currentCategory ? "" : "disabled"}>${t(w, biz, "Next", "Siguiente")}</button>
      </p>
    `;
  }

  function renderTasks(hub, biz, w) {
    const list = (snippetsFor(hub, biz.id)[w.currentCategory] || []);
    const rows = list
      .map((sn, i) => {
        const label = biz.bilingual && w.lang === "es" && sn.textEs ? sn.textEs : sn.text;
        const on = !!w.picked[i];
        return `<label class="task"><input type="checkbox" ${on ? "checked" : ""} onchange="HubWizard.toggleTask(${i}, this.checked)" /><span>${hub.esc(label)}</span></label>`;
      })
      .join("");
    return `
      ${renderSteps(w)}
      <h2>${hub.esc(w.currentCategory)}</h2>
      ${rows || "<p class='muted'>No canned tasks in this category.</p>"}
      <div class="field"><label>${t(w, biz, "Custom line", "Línea extra")}</label>
        <input id="wCustom" placeholder="${t(w, biz, "Add your own…", "Agregar…")}" /></div>
      <button class="ghost" type="button" onclick="HubWizard.addCustom()">${t(w, biz, "Add line", "Agregar")}</button>
      <p style="margin-top:16px">
        <button class="ghost" onclick="HubWizard.go('category')">Back</button>
        <button class="primary" onclick="HubWizard.commitJob()">${t(w, biz, "Add these tasks", "Agregar tareas")}</button>
      </p>
    `;
  }

  function renderMore(hub, biz, w) {
    const jobs = w.jobs.map((j) => `<li>${hub.esc(j.category)} — ${j.items.length} item(s)</li>`).join("");
    return `
      ${renderSteps(w)}
      <h2>${t(w, biz, "Another job on this estimate?", "¿Otro trabajo?")}</h2>
      <ul>${jobs}</ul>
      <p>
        <button class="ghost" onclick="HubWizard.go('category')">${t(w, biz, "Add another category", "Otra categoría")}</button>
        <button class="primary" onclick="HubWizard.go('prices')">${t(w, biz, "Set prices", "Precios")}</button>
      </p>
    `;
  }

  function renderPrices(hub, biz, w) {
    const rows = currentItems(w)
      .map((item, i) => {
        return `<tr>
          <td>${hub.esc(item.text)}</td>
          <td><input type="number" min="0" step="1" value="${item.qty}" onchange="HubWizard.setItem(${i},'qty',this.value)" style="width:70px" /></td>
          <td><input type="number" min="0" step="0.01" value="${item.price}" onchange="HubWizard.setItem(${i},'price',this.value)" style="width:100px" /></td>
        </tr>`;
      })
      .join("");
    return `
      ${renderSteps(w)}
      <h2>${t(w, biz, "Quantities and prices", "Cantidad y precios")}</h2>
      <table class="file-list" style="width:100%"><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="muted">Total ${money(totalOf(w))}</p>
      <p>
        <button class="ghost" onclick="HubWizard.go('morejobs')">Back</button>
        <button class="primary" onclick="HubWizard.go('review')">${t(w, biz, "Review", "Revisar")}</button>
      </p>
    `;
  }

  function renderReview(hub, biz, w) {
    const info = infoFor(hub, biz.id);
    const rows = currentItems(w)
      .map((item, i) => {
        const amt = item.type === "Note" ? "—" : money((Number(item.qty) || 0) * (Number(item.price) || 0));
        return `<tr>
          <td><select onchange="HubWizard.wizardReviewSetType(${i}, this.value)">
            ${["Service", "Product", "Note"].map((tp) => `<option ${item.type === tp ? "selected" : ""}>${tp}</option>`).join("")}
          </select></td>
          <td>${hub.esc(item.text)}</td>
          <td>${item.type === "Note" ? "—" : item.qty}</td>
          <td>${amt}</td>
        </tr>`;
      })
      .join("");
    return `
      ${renderSteps(w)}
      <h2>${t(w, biz, "Review", "Revisar")}</h2>
      <div class="doc-preview" id="docPreview">
        <h3 style="margin:0">${hub.esc(info.legalName || biz.name)}</h3>
        <p style="margin:4px 0 16px">${hub.esc([info.contact, info.phone !== "TBD" ? info.phone : "", info.email !== "TBD" ? info.email : ""].filter(Boolean).join(" · "))}</p>
        <p><strong>${t(w, biz, "Prepared for", "Preparado para")}:</strong> ${hub.esc(w.clientName || "—")}<br/>
        ${w.address ? hub.esc(w.address) + "<br/>" : ""}
        ${new Date().toLocaleDateString()}</p>
        <table>
          <thead><tr><th>Item</th><th>${t(w, biz, "Description", "Descripción")}</th><th>Qty</th><th>${t(w, biz, "Amount", "Monto")}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right;font-weight:700">${t(w, biz, "Total", "Total")}: ${money(totalOf(w))}</p>
        ${w.notes ? `<p>${hub.esc(w.notes)}</p>` : ""}
        <p style="font-size:12px;color:#555">This is an estimate, not a contract.</p>
      </div>
      <div class="field" style="margin-top:14px"><label>Notes</label>
        <textarea oninput="HubWizard.patch({notes:this.value})">${hub.esc(w.notes)}</textarea></div>
      <p>
        <button class="ghost" onclick="HubWizard.go('prices')">Back</button>
        <button class="primary" onclick="HubWizard.save()">${t(w, biz, "Save estimate", "Guardar")}</button>
      </p>
    `;
  }

  function renderDone(hub, biz, w) {
    const gmail = biz.gmail;
    const subject = encodeURIComponent(`Estimate from ${biz.name}`);
    const body = encodeURIComponent(estimateText(hub, biz, w));
    const mail = gmail
      ? `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;
    return `
      ${renderSteps(w)}
      <h2>${t(w, biz, "Saved", "Guardado")}</h2>
      <p class="muted">${hub.esc(w.savedName || "estimate.txt")}${w.savedPdf ? " + PDF" : ""}</p>
      <p>
        ${biz.hasGmail ? `<a class="primary" href="${mail}" target="_blank" rel="noopener" onclick="HubWizard.markSent()">Email via Gmail</a>` : ""}
        <button class="ghost" onclick="Hub.go('tracker')">Tracker</button>
        <button class="ghost" onclick="Hub.go('business')">Back to ${hub.esc(biz.name)}</button>
      </p>
    `;
  }

  const api = {
    start(biz) {
      hub().wizard = emptyWizard(biz);
      hub().bizId = biz.id;
      hub().view = "wizard";
      hub().syncUrl();
      hub().paint();
    },
    patch(partial) {
      Object.assign(hub().wizard, partial);
    },
    setLang(lang) {
      hub().wizard.lang = lang;
      hub().paint();
    },
    go(step) {
      hub().wizard.step = step;
      hub().paint();
    },
    pickContact(i) {
      const biz = hub().currentBiz();
      const c = contactsFor(hub(), biz.id)[i];
      if (!c) return;
      hub().wizard.clientName = c.name || "";
      hub().wizard.address = c.address || "";
      hub().paint();
    },
    pickAddress(i) {
      const hit = (hub().wizard.addressHits || [])[i];
      if (!hit) return;
      hub().wizard.address = hit.display_name;
      hub().wizard.addressHits = [];
      hub().paint();
    },
    async lookupAddress() {
      const q = hub().wizard.address;
      if (!q || q.length < 5) return;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        hub().wizard.addressHits = await res.json();
        if (hub().wizard.step === "client") hub().paint();
      } catch {
        /* offline / blocked */
      }
    },
    pickCategory(name) {
      hub().wizard.currentCategory = name;
      hub().wizard.picked = {};
      hub().paint();
    },
    toggleTask(i, on) {
      hub().wizard.picked[i] = on;
    },
    addCustom() {
      const input = document.getElementById("wCustom");
      const text = (input && input.value.trim()) || "";
      if (!text) return;
      const w = hub().wizard;
      const snips = snippetsFor(hub(), w.bizId)[w.currentCategory] || [];
      const idx = snips.length + Object.keys(w.picked).length + 1;
      w.picked["c" + idx] = { text, type: "Service", qty: 1, price: 0 };
      if (input) input.value = "";
      hub().toast("Line added");
    },
    commitJob() {
      const hubState = hub();
      const w = hubState.wizard;
      const biz = hubState.currentBiz();
      const snips = snippetsFor(hubState, biz.id)[w.currentCategory] || [];
      const items = [];
      snips.forEach((sn, i) => {
        if (!w.picked[i]) return;
        const text = biz.bilingual && w.lang === "es" && sn.textEs ? sn.textEs : sn.text;
        items.push({ text, type: "Service", qty: 1, price: 0 });
      });
      Object.keys(w.picked).forEach((key) => {
        if (key.startsWith("c") && w.picked[key] && w.picked[key].text) items.push(w.picked[key]);
      });
      if (!items.length) {
        hubState.toast("Pick at least one task");
        return;
      }
      w.jobs.push({ category: w.currentCategory, items });
      w.picked = {};
      w.currentCategory = "";
      w.step = "morejobs";
      hubState.paint();
    },
    setItem(i, field, value) {
      const items = currentItems(hub().wizard);
      const item = items[i];
      if (!item) return;
      item[field] = field === "qty" || field === "price" ? Number(value) : value;
    },
    wizardReviewSetType(i, type) {
      const items = currentItems(hub().wizard);
      if (!items[i]) return;
      items[i].type = type;
      if (type === "Note") {
        items[i].qty = 0;
        items[i].price = 0;
      } else if (!items[i].qty) {
        items[i].qty = 1;
      }
      hub().paint();
    },
    async save() {
      const hubState = hub();
      const biz = hubState.currentBiz();
      const w = hubState.wizard;
      const text = estimateText(hubState, biz, w);
      const preview = document.getElementById("docPreview");
      try {
        const saved = await global.HubPdf.saveEstimateFiles({
          bizId: biz.id,
          clientName: w.clientName,
          text,
          previewEl: preview,
          upload: hubState.uploadBlob.bind(hubState),
        });
        w.savedName = saved.txtName;
        w.savedPdf = saved.pdfName;
        await hubState.trackEstimate(biz.id, saved.txtName, "saved");
        if (saved.pdfName) await hubState.trackEstimate(biz.id, saved.pdfName, "saved");
        w.step = "done";
        hubState.paint();
        hubState.toast("Estimate saved");
      } catch (err) {
        hubState.toast("Could not save: " + err.message);
      }
    },
    async markSent() {
      const hubState = hub();
      const w = hubState.wizard;
      if (w.savedName) await hubState.trackEstimate(w.bizId, w.savedName, "sent");
    },
    render(hubState, biz) {
      const w = hubState.wizard;
      if (!w) return "<p>No wizard.</p>";
      const map = {
        client: renderClient,
        category: renderCategory,
        tasks: renderTasks,
        morejobs: renderMore,
        prices: renderPrices,
        review: renderReview,
        done: renderDone,
      };
      const fn = map[w.step] || renderClient;
      return `<section class="wizard">${fn(hubState, biz, w)}</section>`;
    },
  };

  function hub() {
    return global.Hub;
  }

  global.HubWizard = api;
})(window);

/* Cesar's Hub — save the on-screen estimate preview as PDF (html2canvas + jsPDF). */
(function (global) {
  function stamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  }

  function safeName(name) {
    return String(name || "client")
      .replace(/[<>:"/\\|?*]+/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40) || "client";
  }

  async function capturePdfBlob(el) {
    if (!el) throw new Error("no preview");
    if (!global.html2canvas || !global.jspdf) throw new Error("pdf libs missing");
    const canvas = await global.html2canvas(el, {
      scale: 2,
      backgroundColor: "#f7f4ee",
      useCORS: true,
    });
    const { jsPDF } = global.jspdf;
    const pdf = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;
    const img = canvas.toDataURL("image/jpeg", 0.92);
    let y = margin;
    let remaining = imgH;
    let srcY = 0;
    const fullH = canvas.height;
    const ratio = canvas.width / imgW;

    if (imgH <= pageH - margin * 2) {
      pdf.addImage(img, "JPEG", margin, margin, imgW, imgH);
    } else {
      while (remaining > 0) {
        const sliceH = Math.min(pageH - margin * 2, remaining);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.max(1, Math.round(sliceH * ratio));
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          Math.round(srcY * ratio),
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        );
        const slice = sliceCanvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(slice, "JPEG", margin, margin, imgW, sliceH);
        remaining -= sliceH;
        srcY += sliceH;
        if (remaining > 4) pdf.addPage();
      }
    }
    return pdf.output("blob");
  }

  async function saveEstimateFiles({ bizId, clientName, text, previewEl, upload }) {
    const base = `${stamp()}-${safeName(clientName)}-estimate`;
    const txtName = `${base}.txt`;
    await upload(bizId, "Estimates", txtName, new Blob([text], { type: "text/plain" }));
    let pdfName = null;
    try {
      const blob = await capturePdfBlob(previewEl);
      pdfName = `${base}.pdf`;
      await upload(bizId, "Estimates", pdfName, blob);
    } catch (err) {
      console.warn("PDF save skipped:", err);
    }
    return { txtName, pdfName };
  }

  global.HubPdf = { capturePdfBlob, saveEstimateFiles, stamp, safeName };
})(window);

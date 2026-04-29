const root = () => document.getElementById("modal-root");

export function openModal(id) {
  document.getElementById(id)?.classList.add("open");
}
export function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
}

export function buildModal({
  id,
  title,
  confirmLabel = "Create",
  confirmClass = "btn-primary",
  fields,
  onConfirm,
}) {
  const fieldHtml = fields
    .map((f) => {
      const fid = `${id}__${f.key}`;
      if (f.type === "select") {
        const opts = (f.options ?? [])
          .map((o) => `<option value="${o.value}">${o.label}</option>`)
          .join("");
        return `<div class="form-group">
        <label for="${fid}">${f.label}</label>
        <select id="${fid}">${opts}</select>
      </div>`;
      }
      if (f.type === "textarea") {
        return `<div class="form-group">
        <label for="${fid}">${f.label}</label>
        <textarea id="${fid}" placeholder="${f.placeholder ?? ""}"></textarea>
      </div>`;
      }
      return `<div class="form-group">
      <label for="${fid}">${f.label}</label>
      <input id="${fid}" type="${f.type ?? "text"}" placeholder="${f.placeholder ?? ""}" />
    </div>`;
    })
    .join("");

  root().insertAdjacentHTML(
    "beforeend",
    `
    <div id="${id}" class="modal-overlay">
      <div class="modal">
        <h2>${title}</h2>
        ${fieldHtml}
        <div class="modal-footer">
          <button class="btn btn-ghost" id="${id}__cancel">Cancel</button>
          <button class="btn ${confirmClass}" id="${id}__confirm">${confirmLabel}</button>
        </div>
      </div>
    </div>`,
  );

  document
    .getElementById(`${id}__cancel`)
    .addEventListener("click", () => closeModal(id));

  document
    .getElementById(`${id}__confirm`)
    .addEventListener("click", async () => {
      const values = {};
      fields.forEach((f) => {
        values[f.key] =
          document.getElementById(`${id}__${f.key}`)?.value?.trim() ?? "";
      });
      try {
        await onConfirm(values);
        closeModal(id);
        // Reset fields
        fields.forEach((f) => {
          const el = document.getElementById(`${id}__${f.key}`);
          if (!el) return;
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        });
      } catch (err) {
        alert("Error: " + err.message);
      }
    });

  // Close on overlay click
  document.getElementById(id).addEventListener("click", (e) => {
    if (e.target.id === id) closeModal(id);
  });

  return {
    open: () => openModal(id),
    close: () => closeModal(id),
    getValue: (key) => document.getElementById(`${id}__${key}`)?.value ?? "",
    setValue: (key, val) => {
      const el = document.getElementById(`${id}__${key}`);
      if (el) el.value = val;
    },
    setOptions: (key, opts) => {
      const el = document.getElementById(`${id}__${key}`);
      if (el)
        el.innerHTML = opts
          .map((o) => `<option value="${o.value}">${o.label}</option>`)
          .join("");
    },
  };
}

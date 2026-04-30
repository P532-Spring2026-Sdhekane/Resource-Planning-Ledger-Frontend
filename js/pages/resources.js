import { api } from '../api/client.js'
import { buildModal } from '../components/modal.js'
import { kindBadge } from '../components/badge.js'

const newModal = buildModal({
  id: 'rt-create-modal',
  title: 'Create Resource Type',
  fields: [
    { key: 'name', label: 'Name', placeholder: 'e.g., Engineers' },
    { key: 'kind', label: 'Kind', type: 'select',
      options: [{ value: 'CONSUMABLE', label: 'CONSUMABLE' }, { value: 'ASSET', label: 'ASSET' }] },
    { key: 'unitOfMeasure', label: 'Unit of Measure', placeholder: 'e.g., person-days' },
  ],
  onConfirm: async ({ name, kind, unitOfMeasure }) => {
    if (!name || !unitOfMeasure) throw new Error('Name and unit are required')
    await api.createResourceType({ name, kind, unitOfMeasure })
    await refresh()
  }
})

export async function renderResources(el) {
  el.innerHTML = `
    <div class="row between mb-16">
      <h2 style="margin-bottom:0">Resource Types</h2>
      <button class="btn btn-primary btn-sm" id="btn-new-rt">+ New Resource Type</button>
    </div>
    <div class="card table-wrap">
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Kind</th><th>Unit</th><th>Pool Account</th><th>Balance</th></tr>
        </thead>
        <tbody id="rt-tbody"></tbody>
      </table>
    </div>`

  document.getElementById('btn-new-rt').onclick = () => newModal.open()
  await refresh()
}

async function refresh() {
  const result = await api.getResourceTypes()
  const rts    = Array.isArray(result) ? result : []
  const tbody  = document.getElementById('rt-tbody')
  if (!tbody) return

  tbody.innerHTML = rts.length === 0
    ? `<tr><td colspan="6" class="empty">No resource types yet.</td></tr>`
    : rts.map(r => {
        const bal = parseFloat(r.poolAccount?.balance ?? 0)
        return `<tr>
          <td>${r.id}</td>
          <td><strong>${r.name}</strong></td>
          <td>${kindBadge(r.kind)}</td>
          <td>${r.unitOfMeasure}</td>
          <td>${r.poolAccount?.name ?? '—'}</td>
          <td style="color:${bal < 0 ? 'var(--danger)' : 'var(--success)'}">
            ${r.poolAccount?.balance ?? '—'}
          </td>
        </tr>`
      }).join('')
}

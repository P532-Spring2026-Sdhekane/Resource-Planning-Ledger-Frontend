import { api } from '../api/client.js'

export async function renderAudit(el) {
  el.innerHTML = `
    <h2>Audit Log</h2>
    <div class="card table-wrap">
      <table>
        <thead>
          <tr><th>Timestamp</th><th>Event</th><th>Action ID</th><th>Account ID</th><th>Details</th></tr>
        </thead>
        <tbody id="audit-tbody"></tbody>
      </table>
    </div>`

  const logs  = await api.getAuditLog()
  const tbody = document.getElementById('audit-tbody')
  if (!tbody) return

  tbody.innerHTML = logs.length === 0
    ? `<tr><td colspan="5" class="empty">No audit entries yet.</td></tr>`
    : [...logs].reverse().map(l => `
        <tr>
          <td style="font-size:.8rem;color:var(--muted);white-space:nowrap">
            ${l.timestamp?.replace('T',' ').slice(0,19) ?? '—'}
          </td>
          <td><span class="badge badge-IN_PROGRESS">${l.event}</span></td>
          <td>${l.actionId  ?? '—'}</td>
          <td>${l.accountId ?? '—'}</td>
          <td style="font-size:.85rem">${l.details ?? '—'}</td>
        </tr>`).join('')
}

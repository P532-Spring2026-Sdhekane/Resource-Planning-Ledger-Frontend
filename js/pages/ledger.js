import { api } from '../api/client.js'
import { entryBadge } from '../components/badge.js'

export async function renderLedger(el) {
  el.innerHTML = `
    <h2>Ledger</h2>
    <div class="grid col-2">
      <div class="card">
        <h3>All Accounts</h3>
        <div class="table-wrap mt-8">
          <table>
            <thead><tr><th>Name</th><th>Kind</th><th>Balance</th></tr></thead>
            <tbody id="accounts-tbody"></tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <h3>Entries — <span id="selected-acct" style="color:var(--muted);font-weight:400;text-transform:none;letter-spacing:0">click an account</span></h3>
        <div class="table-wrap mt-8">
          <table>
            <thead><tr><th>Type</th><th>Amount</th><th>Charged At</th><th>Booked At</th><th>Notes</th></tr></thead>
            <tbody id="entries-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>`

  await loadAccounts()
}

async function loadAccounts() {
  const result   = await api.getAccounts()
  const accounts = Array.isArray(result) ? result : []
  const tbody    = document.getElementById('accounts-tbody')
  if (!tbody) return

  tbody.innerHTML = accounts.length === 0
    ? `<tr><td colspan="3" class="empty">No accounts yet.</td></tr>`
    : accounts.map(a => {
        const neg = parseFloat(a.balance) < 0
        return `<tr class="clickable-row" data-acct-id="${a.id}" data-acct-name="${a.name}">
          <td>${a.name}</td>
          <td><span class="badge badge-${a.kind}">${a.kind}</span></td>
          <td style="color:${neg ? 'var(--danger)' : 'var(--success)'};font-weight:600">${a.balance}</td>
        </tr>`
      }).join('')

  tbody.querySelectorAll('[data-acct-id]').forEach(row => {
    row.onclick = () => loadEntries(parseInt(row.dataset.acctId), row.dataset.acctName)
  })
}

async function loadEntries(accountId, name) {
  document.getElementById('selected-acct').textContent = name
  const result  = await api.getEntries(accountId)
  const entries = Array.isArray(result) ? result : []
  const tbody   = document.getElementById('entries-tbody')
  if (!tbody) return

  tbody.innerHTML = entries.length === 0
    ? `<tr><td colspan="5" class="empty">No entries for this account.</td></tr>`
    : entries.map(e => {
        const neg = parseFloat(e.amount) < 0
        return `<tr>
          <td>${entryBadge(e.entryType)}</td>
          <td style="color:${neg ? 'var(--danger)' : 'var(--success)'};font-weight:600">${e.amount}</td>
          <td style="font-size:.8rem">${e.chargedAt?.replace('T',' ').slice(0,19) ?? '—'}</td>
          <td style="font-size:.8rem">${e.bookedAt?.replace('T',' ').slice(0,19)  ?? '—'}</td>
          <td style="font-size:.8rem;color:var(--muted)">${e.notes ?? '—'}</td>
        </tr>`
      }).join('')
}

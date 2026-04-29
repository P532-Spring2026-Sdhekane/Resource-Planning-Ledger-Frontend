import { api } from '../api/client.js'
import { badge } from '../components/badge.js'

export async function renderDashboard(el) {
  el.innerHTML = `
    <h2>Dashboard</h2>
    <div id="dash-alerts" class="mb-16"></div>
    <div class="grid col-3 mb-16" id="dash-stats"></div>
    <div class="grid col-2">
      <div class="card">
        <h3>Quick Actions</h3>
        <div class="action-btns mt-8">
          <button class="btn btn-primary btn-sm" id="dash-goto-plans">+ New Plan</button>
          <button class="btn btn-primary btn-sm" id="dash-goto-protocols">+ New Protocol</button>
          <button class="btn btn-primary btn-sm" id="dash-goto-resources">+ Resource Type</button>
        </div>
      </div>
      <div class="card">
        <h3>Pool Account Balances</h3>
        <div class="table-wrap mt-8"><div id="dash-pools"></div></div>
      </div>
    </div>`

  document.getElementById('dash-goto-plans').onclick     = () => window.__navigate('plans')
  document.getElementById('dash-goto-protocols').onclick = () => window.__navigate('protocols')
  document.getElementById('dash-goto-resources').onclick = () => window.__navigate('resources')

  const accounts = await api.getAccounts()
  const pools    = accounts.filter(a => a.kind === 'POOL')
  const alerts   = pools.filter(a => parseFloat(a.balance) < 0)

  document.getElementById('dash-alerts').innerHTML =
    alerts.map(a => `<div class="alert-bar">⚠ "${a.name}" is below zero: ${a.balance}</div>`).join('')

  document.getElementById('dash-stats').innerHTML = `
    <div class="card"><h3>Total Accounts</h3><div class="stat blue">${accounts.length}</div></div>
    <div class="card"><h3>Pool Accounts</h3><div class="stat">${pools.length}</div></div>
    <div class="card"><h3>In Alert</h3>
      <div class="stat ${alerts.length ? 'red' : 'green'}">${alerts.length}</div>
    </div>`

  document.getElementById('dash-pools').innerHTML = pools.length === 0
    ? '<div class="empty">No pool accounts yet.</div>'
    : `<table>
        <thead><tr><th>Account</th><th>Balance</th><th>Status</th></tr></thead>
        <tbody>${pools.map(a => {
          const neg = parseFloat(a.balance) < 0
          return `<tr>
            <td>${a.name}</td>
            <td style="color:${neg ? 'var(--danger)' : 'var(--success)'}">${a.balance}</td>
            <td>${neg
              ? '<span class="badge badge-ABANDONED">ALERT</span>'
              : '<span class="badge badge-COMPLETED">OK</span>'}</td>
          </tr>`
        }).join('')}</tbody>
      </table>`
}

import { renderDashboard } from './pages/dashboard.js'
import { renderProtocols }  from './pages/protocols.js'
import { renderResources }  from './pages/resources.js'
import { renderPlans }      from './pages/plans.js'
import { renderLedger }     from './pages/ledger.js'
import { renderAudit }      from './pages/audit.js'

const PAGES = {
  dashboard: renderDashboard,
  protocols: renderProtocols,
  resources: renderResources,
  plans:     renderPlans,
  ledger:    renderLedger,
  audit:     renderAudit,
}

const main = document.getElementById('main-content')
let current = null

async function navigate(page) {
  if (!PAGES[page]) return
  current = page

  // Update nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page)
  })

  // Render
  main.innerHTML = ''
  try {
    await PAGES[page](main)
  } catch (err) {
    main.innerHTML = `<div class="card" style="color:var(--danger)">
      Failed to load: ${err.message}
    </div>`
    console.error(err)
  }
}

// Expose globally so pages can trigger navigation (e.g. dashboard quick-action buttons)
window.__navigate = navigate

// Nav button clicks
document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page))
})

// Boot
navigate('dashboard')

import { API_BASE } from '../config.js'

async function request(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== null) opts.body = JSON.stringify(body)
  const res = await fetch(API_BASE + path, opts)
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({ error: res.statusText }))
  if (!res.ok) throw new Error(data.error ?? res.statusText)
  return data
}

export const api = {
  // Protocols
  getProtocols:       ()         => request('/api/protocols'),
  createProtocol:     (b)        => request('/api/protocols', 'POST', b),
  updateProtocol:     (id, b)    => request(`/api/protocols/${id}`, 'PUT', b),
  deleteProtocol:     (id)       => request(`/api/protocols/${id}`, 'DELETE'),
  addStep:            (id, b)    => request(`/api/protocols/${id}/steps`, 'POST', b),

  // Resource types
  getResourceTypes:   ()         => request('/api/resource-types'),
  createResourceType: (b)        => request('/api/resource-types', 'POST', b),
  deleteResourceType: (id)       => request(`/api/resource-types/${id}`, 'DELETE'),

  // Plans
  getPlans:           ()         => request('/api/plans'),
  getPlan:            (id)       => request(`/api/plans/${id}`),
  createPlan:         (b)        => request('/api/plans', 'POST', b),
  getPlanReport:      (id)       => request(`/api/plans/${id}/report`),
  addActionToPlan:    (id, b)    => request(`/api/plans/${id}/actions`, 'POST', b),

  // Actions
  getAction:          (id)       => request(`/api/actions/${id}`),
  implement:          (id)       => request(`/api/actions/${id}/implement`, 'POST', {}),
  complete:           (id)       => request(`/api/actions/${id}/complete`,  'POST', {}),
  suspend:            (id, r)    => request(`/api/actions/${id}/suspend`,   'POST', { reason: r }),
  resume:             (id)       => request(`/api/actions/${id}/resume`,    'POST', {}),
  abandon:            (id)       => request(`/api/actions/${id}/abandon`,   'POST', {}),
  addAllocation:      (id, b)    => request(`/api/actions/${id}/allocations`, 'POST', b),

  // Ledger
  getAccounts:        ()         => request('/api/accounts'),
  getEntries:         (id)       => request(`/api/accounts/${id}/entries`),
  getAuditLog:        ()         => request('/api/audit-log'),
}

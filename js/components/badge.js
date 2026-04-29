export const badge = (value) =>
  `<span class="badge badge-${value ?? 'PROPOSED'}">${value ?? 'PROPOSED'}</span>`

export const kindBadge = (kind) =>
  `<span class="badge badge-${kind}">${kind}</span>`

export const entryBadge = (type) =>
  `<span class="badge badge-${type}">${type}</span>`

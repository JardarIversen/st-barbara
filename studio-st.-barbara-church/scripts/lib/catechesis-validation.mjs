const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value

export function catechesisErrors(value) {
  if (value == null) return []
  const errors = []
  if (!Array.isArray(value.groups) || !value.groups.length) return ['Katekese mangler aldersgrupper.']
  function contact(item) {
    if (item && (!item.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email ?? ''))) errors.push('Kontaktpersonen må ha navn og gyldig offentlig e-post.')
  }
  function keys(items) {
    if (items.some(item => !item._key || !item.title) || new Set(items.map(item => item._key)).size !== items.length) errors.push('Grupper og tilbud må ha tittel og unike _key-verdier.')
  }
  keys(value.groups)
  for (const group of value.groups) {
    contact(group.contact)
    if (!Array.isArray(group.sessions) || !group.sessions.length) {errors.push('Aldersgruppen mangler undervisningstider.'); continue}
    keys(group.sessions)
    for (const session of group.sessions) {
      if (!timePattern.test(session.startTime ?? '') || !timePattern.test(session.endTime ?? '') || session.endTime <= session.startTime) errors.push('Undervisningstiden må ha gyldig start og slutt samme dag.')
      if (session.massTime && !timePattern.test(session.massTime)) errors.push('Ugyldig messetid.')
      if (session.communionDate && !validDate(session.communionDate)) errors.push('Ugyldig kommunionsdato.')
      if (session.communionYear != null && (!Number.isInteger(session.communionYear) || session.communionYear < 2000 || session.communionYear > 2100)) errors.push('Ugyldig kommunionsår.')
      if (session.communionDate && session.communionYear && !session.communionDate.startsWith(String(session.communionYear))) errors.push('Kommunionsår og dato er motstridende.')
    }
    if (group.sessionDates !== undefined && (!Array.isArray(group.sessionDates) || group.sessionDates.some(date => !validDate(date)) || new Set(group.sessionDates).size !== group.sessionDates.length)) errors.push('Samlingsdatoer må være gyldige, unike datoer.')
  }
  if (value.otherOfferings !== undefined && !Array.isArray(value.otherOfferings)) errors.push('Andre tilbud må være en liste.')
  else {keys(value.otherOfferings ?? []); for (const item of value.otherOfferings ?? []) contact(item.contact)}
  return errors
}

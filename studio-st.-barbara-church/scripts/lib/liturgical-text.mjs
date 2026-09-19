const types = new Set(['refrain', 'verse', 'acclamation'])
const nonempty = value => typeof value === 'string' && value.trim().length > 0

export function liturgicalTextErrors(value) {
  const errors = []
  for (const [index, item] of (Array.isArray(value) ? value : [value]).entries()) {
    if (!item || typeof item !== 'object' || item._type === 'block' || !('type' in item)) continue
    const prefix = `Tekstblokk ${index + 1}`
    if (!types.has(item.type)) {
      errors.push(`${prefix}: ukjent teksttype «${item.type}».`)
      continue
    }
    const allowed = item.type === 'refrain' ? ['type', 'text']
      : item.type === 'verse' ? ['type', 'lines'] : ['type', 'response', 'lines']
    for (const field of Object.keys(item)) {
      if (!allowed.includes(field)) errors.push(`${prefix}: feltet ${field} støttes ikke for ${item.type}.`)
    }
    if (item.type === 'refrain' && !nonempty(item.text)) {
      errors.push(`${prefix}: omkvedet må ha text.`)
    }
    if (item.type !== 'refrain' && (!Array.isArray(item.lines) || !item.lines.length ||
      item.lines.some(line => !nonempty(line) || /[\r\n]/u.test(line)))) {
      errors.push(`${prefix}: lines må inneholde én ikke-tom tekststreng per verslinje.`)
    }
    if (item.type === 'acclamation' && item.response !== undefined && !nonempty(item.response)) {
      errors.push(`${prefix}: response må være tekst eller utelates når kilden ikke har omkved.`)
    }
    const texts = [item.text, item.response, ...(Array.isArray(item.lines) ? item.lines : [])]
    if (texts.some(text => typeof text === 'string' && /[℟℣]/u.test(text))) {
      errors.push(`${prefix}: ikke skriv ℟ eller ℣ selv; importeren setter inn tegnene automatisk.`)
    }
  }
  return errors
}

// Converted to ordinary Portable Text spans, editable in Studio.
export function liturgicalParagraph(item) {
  if (item?.type === 'refrain') {
    return {style: 'normal', spans: [{text: `℟ ${item.text}`, marks: ['strong', 'em']}]}
  }
  if (item?.type === 'verse') {
    return {style: 'normal', spans: [
      {text: `${item.lines.join('\n')}\n`, marks: []},
      {text: '℟', marks: ['strong']},
    ]}
  }
  if (item?.type === 'acclamation') {
    const cue = text => ({text, marks: ['strong', 'em']})
    const text = text => ({text, marks: ['em']})
    return {style: 'acclamation', spans: [
      ...(item.response ? [cue('℟'), text(` ${item.response} `)] : []),
      cue('℣'),
      text(` ${item.lines.join('\n')}`),
      ...(item.response ? [text(' '), cue('℟'), text(` ${item.response}`)] : []),
    ]}
  }
}

export function massTextFormattingWarnings(manifest) {
  const warnings = []
  for (const item of manifest.massTexts ?? []) {
    const blocks = Array.isArray(item.body) ? item.body : [item.body]
    for (const block of blocks) {
      const text = typeof block === 'string' ? block : block?.text
      if (typeof text === 'string' && text.includes('℟') && !text.includes('\n')) {
        warnings.push(`${item.sourceKey}: liturgisk tekst ligger på én linje. Bruk refrain/verse eller acclamation og kontroller linjedelingen mot PDF-en.`)
      }
    }
  }
  return warnings
}

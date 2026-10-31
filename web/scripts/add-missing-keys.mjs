import fs from 'node:fs/promises'
import path from 'node:path'

const LOCALES_DIR = path.resolve('src/i18n/locales')

function stableStringify(obj) {
  return JSON.stringify(obj, null, 2) + '\n'
}

const newKeys = {
  en: {
    Weak: 'Weak',
    Medium: 'Medium',
    Strong: 'Strong',
    'Very strong': 'Very strong',
  },
  zh: {
    Weak: '弱',
    Medium: '中等',
    Strong: '强',
    'Very strong': '非常强',
  },
  'zh-TW': {
    Weak: '弱',
    Medium: '中等',
    Strong: '強',
    'Very strong': '非常強',
  },
  fr: {
    Weak: 'Faible',
    Medium: 'Moyen',
    Strong: 'Fort',
    'Very strong': 'Très fort',
  },
  ja: {
    Weak: '弱い',
    Medium: '中程度',
    Strong: '強い',
    'Very strong': '非常に強い',
  },
  ru: {
    Weak: 'Слабый',
    Medium: 'Средний',
    Strong: 'Сильный',
    'Very strong': 'Очень сильный',
  },
  vi: {
    Weak: 'Yếu',
    Medium: 'Trung bình',
    Strong: 'Mạnh',
    'Very strong': 'Rất mạnh',
  },
}

async function main() {
  let totalAdded = 0

  for (const [locale, trans] of Object.entries(newKeys)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    const json = JSON.parse(await fs.readFile(filePath, 'utf8'))

    let count = 0
    for (const [key, value] of Object.entries(trans)) {
      if (!Object.prototype.hasOwnProperty.call(json.translation, key)) {
        json.translation[key] = value
        count++
      } else if (json.translation[key] !== value) {
        json.translation[key] = value
        count++
      }
    }

    if (count > 0) {
      json.translation = Object.fromEntries(
        Object.entries(json.translation).sort(([a], [b]) => a.localeCompare(b))
      )
      await fs.writeFile(filePath, stableStringify(json), 'utf8')
    }

    console.log(`${locale}: ${count} translations applied`)
    totalAdded += count
  }

  console.log(`\nTotal: ${totalAdded} translations applied`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

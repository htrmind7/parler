import { readFile, writeFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { parseContent } from '../src/content/loader.ts'
import { assertValidatedUnchanged } from '../src/content/review.ts'

const THEMES_PATH = resolve('content/themes.json')
const CARDS_PATH = resolve('content/cards.json')

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf-8')
}

/** Local-only API used by the review screen to read and save content/cards.json. */
export function cardsPlugin(): Plugin {
  return {
    name: 'review-cards-api',
    configureServer(server) {
      server.middlewares.use('/api/content', async (req, res) => {
        try {
          const themes: unknown = JSON.parse(
            await readFile(THEMES_PATH, 'utf-8'),
          )
          const current: unknown = JSON.parse(
            await readFile(CARDS_PATH, 'utf-8'),
          )

          if (req.method === 'PUT') {
            const incoming: unknown = JSON.parse(await readBody(req))
            const { cards } = parseContent(themes, incoming)
            assertValidatedUnchanged(parseContent(themes, current).cards, cards)
            await writeFile(
              CARDS_PATH,
              JSON.stringify(cards, null, 2) + '\n',
              'utf-8',
            )
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ cards }))
            return
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(parseContent(themes, current)))
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: (error as Error).message }))
        }
      })
    },
  }
}

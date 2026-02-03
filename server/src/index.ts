import { createApp } from './app'
import { connectToDb } from './db/connect'
import { env } from './config/env'

async function main() {
  await connectToDb()
  const app = createApp()
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error', err)
  process.exit(1)
})


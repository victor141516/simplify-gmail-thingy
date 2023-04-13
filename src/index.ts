import express from 'express'
import { getPatched } from './patcher'

const app = express()

app.get('/', async (_, res) => {
  res
    .setHeader('Content-Type', 'application/zip')
    .setHeader('Content-Disposition', 'attachment; filename="simplify.zip"')
    .send(await getPatched())
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Listening on port', PORT)
})

const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const app = express()
const port = 3000
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
async function initDb() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
      )  
    `)

    const result = await pool.query(`SELECT COUNT(*) FROM tasks`)
    const count = Number (result.rows[0].count)
    
if (count === 0) {
    await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)',
      ['Learn Express', false, 'Build CRUD API', false, 'Push to GitHub', false]
    )
  }

  console.log('Database ready')
}

initDb().catch(err => console.error('initDb failed:', err))
    

app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/',(req, res) => {
    res.json({name : 'Task API', version: '1.0', endpoints: ['/tasks']})
})

app.get('/health',(req,res) => {
    res.json({status:'ok'})
})


app.get('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id)
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    const task = result.rows[0]
    if (task) {
        res.status(200).json(task)
    } else {
        res.status(404).json({ error: `Task ${id} not found` })
    }
})

app.get('/tasks', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks')
    res.json(result.rows)
})

app.post('/tasks', async (req, res) => {
    const title = req.body.title
    if (!title) {
        return res.status(400).json({ error: 'Title is required.' })
    }
    const result = await pool.query(
        'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
        [title, false]
    )
    res.status(201).json(result.rows[0])
})

app.put('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id)
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    const task = existing.rows[0]
    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found` })
    }
    const { title, done } = req.body
    if (title === undefined && done === undefined) {
        return res.status(400).json({ error: 'Provide title or done' })
    }
    const newTitle = title !== undefined ? title : task.title
    const newDone = done !== undefined ? done : task.done

    const result = await pool.query(
        'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
        [newTitle, newDone, id]
    )
    res.json(result.rows[0])
})

app.delete('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id)
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id])
    if (result.rowCount === 0) {
        return res.status(404).json({ error: `Task ${id} not found` })
    }
    res.status(204).end()
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
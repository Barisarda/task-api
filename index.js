
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const app = express()
const port = 3000
const Database = require('better-sqlite3')
const db = new Database('tasks.db')
const { Pool } = require('pg')
console.log('DATABASE_URL:', process.env.DATABASE_URL)
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
    
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`)

const count = db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c

if(count === 0){
    const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)')
    insert.run('Learn Express', 0)
    insert.run('Build CRUD API', 0)
    insert.run('Push to Github', 0)
}


console.log('Tasks in DB:', db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c)

app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/',(req, res) => {
    res.json({name : 'Task API', version: '1.0', endpoints: ['/tasks']})
})

app.get('/health',(req,res) => {
    res.json({status:'ok'})
})



app.get('/tasks/:id',(req,res) => {
    const id = Number(req.params.id)
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    if (task) {
        res.status(200).json(task)
    } else {
        res.status(404).json({ error: `Task ${id} not found`})
    }
    
})

app.get('/tasks', (req, res) => {
const rows = db.prepare('SELECT * FROM tasks').all()
res.json(rows)
})

app.post('/tasks',(req,res) => {
    const title = req.body.title
    if (!title){
       return res.status(400).json({error: 'Title is required.'})
    }
    const result = db.prepare('INSERT INTO tasks (title, done)VALUES (?, ?)').run(title, 0)
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newTask)
})

app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id)
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found` })
    }
    const { title, done } = req.body
    if (title === undefined && done === undefined) {
        return res.status(400).json({ error: 'Provide title or done' })
    }
    const newTitle = title !== undefined ? title : task.title 
    const newDone = done !== undefined ? (done ? 1:0) : task.done
    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id)

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    res.json(task)
}) 

app.delete('/tasks/:id',(req,res) => {
    const id = Number(req.params.id)
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    if (result.changes === 0){
        return res.status(404).json({ error : `Task ${id} not found`})
    }
    res.status(204).end()
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
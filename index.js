
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const app = express()
const port = 3000
const Database = require('better-sqlite3')
const db = new Database('tasks.db')
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


let tasks = [
  { id: 1, title: 'Learn Express', done: false },
  { id: 2, title: 'Build CRUD API', done: false },
  { id: 3, title: 'Push to GitHub', done: false }
]

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
    const newTask = {id:tasks.length + 1,title:title, done:false}
    tasks.push(newTask)
    res.status(201).json(newTask)
})

app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id)
    const task = tasks.find(t => t.id === id)
    if (!task) {
        return res.status(404).json({ error: `Task ${id} not found` })
    }
    const { title, done } = req.body
    if (title === undefined && done === undefined) {
        return res.status(400).json({ error: 'Provide title or done' })
    }
    if (title !== undefined) task.title = title
    if (done !== undefined) task.done = done
    res.json(task)
}) 

app.delete('/tasks/:id',(req,res) => {
    const id = Number(req.params.id)
    const index = tasks.findIndex(t => t.id === id)
    if (index === -1){
        return res.status(404).json({ error : `Task ${id} not found`})
    }
    tasks.splice(index, 1)
    res.status(204).end()
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
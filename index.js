const __webpack_exports__ = require('create-expo-app')
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const app = express()
const port = 3000
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

app.get('/health',(req,res) =>{
    res.json({status:'ok'})
})

app.listen(port, () => {
    console.log('Server listening on port ${port}')
})

app.get('/tasks/:id',(req,res) =>{
    const id = Number(req.params.id)
    const task = tasks.find(t => t.id === id)
    if (task) {
        res.status(200).json(task)
    } else {
        res.status(404).json({ error: `Task ${id} not found`})
    }
    
})

app.get('/tasks', (req, res) => {
res.json(tasks)
})

app.post('/tasks',(req,res) =>{
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

app.delete('/tasks/:id',(req,res)=>{
    const id = Number(req.params.id)
    const index = tasks.findIndex(t => t.id == id)
    if (index === -1){
        return res.status(404).json({ error : 'Task ${id} not found'})
    }
    tasks.splice(index, 1)
    res.status(204).end()
})


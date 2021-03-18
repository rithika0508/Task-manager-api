const express = require('express')
const app = express()
const authentication = require('../middleware/authentication.js')
const router = new express.Router()

const task = require('../models/tasks.js')

app.use(express.json())

//creating task
router.post('/tasks', authentication,async (req, res) => {  

    const Tasks = new task({
        ...req.body,
        owner: req.user._id
        
    })
    
    try {
        await Tasks.save()
        
        res.status(200).send(Tasks)
    } catch (error) {
        res.status(400).send(error)
    }

})




//fetching data for tasks
//tasks?(completed/description)=____
//tasks?limit=_&skip=_
//tasks?sortBy=createdAt:(asc/des)
router.get('/tasks', authentication, async (req, res) => {
    const match = {}
    const sorts = {}
    if(req.query.completed) {
        match.completed = req.query.completed
    }
    
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        console.log(parts[0])
        if(parts[1] === 'des') {
            parts[1] = -1
        }
        else {
            parts[1] === 1
        }
        sorts[parts[0]] = parts[1]
    }
    
    try {
        // console.log(req.query)
        const tasks = await task.find({ 
            owner: req.user._id,
            ...match
        }).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(sorts)
        console.log(tasks)
        
        res.status(200).send(tasks)

    } catch (error) {
        res.status(500).send(error)
    }
    
})

router.get('/tasks/:id', authentication, async (req, res) => {
    const _id = req.params.id
    try {
       
        const tasks = await task.findOne({ _id, owner: req.user._id})
        if (!tasks) {
            return res.status(404).send(tasks)
        }

        res.status(200).send(tasks)
    } catch (error) {
        res.status(500).send()
    }

})



// for updating tasks
router.patch('/tasks/:id', authentication, async (req, res) => {
    const updates = Object.keys(req.body)   //this is an array of properties of obj provided
    const default_updates = ['description', 'completed']
    const verify = updates.every((update) => { return default_updates.includes(update) })
    if (!verify) {
        return res.status(404).send()
    }
    try {
        
        const Task = await task.findOne({ _id: req.params.id, owner: req.user._id})
        // const Task = await task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        updates.forEach((update) => {
            Task[update] = req.body[update]
        })
        
        await Task.save()

        if (!Task) {
            res.status(404).send()
        }
        res.send(Task)
    } catch (error) {
        res.status(500).send()
    }

})

//for deleting a task
router.delete('/tasks/:id', authentication, async (req, res) => {
    try {
        const Task = await task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!Task) {
            return res.status(404).send()
        }
        return res.send(Task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
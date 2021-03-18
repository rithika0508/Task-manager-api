const express = require('express');
const multer = require('multer')

const app = express();


require('./db/mongoose.js')
const PORT = process.env.PORT


const userRouter = require('../src/routers/user.js')
const taskRouter = require('../src/routers/task.js')

app.use(express.json())      //its gng to parse incoming json to object used for req.body
app.use(userRouter)
app.use(taskRouter)


// app.use((req, res, next) => {  //mentioning next is middleware and it will run if next is provided 
//     if (req.method === 'GET') {
//         res.send('Get requests are disabled')  //when someone tries to get users , we cant allow them so next is not provided
//     } else {
//         next() //post, delete and create are allowed , so next is provided
//     }
// })

// set up middle ware function for maintance
// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down')
// })



app.listen(PORT, () => {
    console.log('server is on port ' + PORT)
})


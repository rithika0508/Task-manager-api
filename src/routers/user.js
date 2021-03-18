const express = require('express')
const app = express()
const multer = require('multer')
const User = require('../models/user.js')
const authentication = require('../middleware/authentication.js')
const sharp = require('sharp')
const { sendWelcomeMail, sendCancelMail } = require('../emails/account.js')

const router = new express.Router()

app.use(express.json())
//sign up
router.post('/users',async (req, res) => {   //for creating data

    const user = new User(req.body);
    try {
        await user.save()
        sendWelcomeMail(user.email, user.name)
        console.log('hey1')
        const token = await user.generateAuthToken()
        console.log('hey2')
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
    
})





//login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) 
        
        const token = await user.generateAuthToken()
        
        res.send({ user, token})  //short hand syntax
    } catch (error) {
        res.status(400).send()
    }
})




//log out
router.post('/users/logout', authentication, async (req, res) => {
    try {
        
        req.user.tokens = req.user.tokens.filter((token) => {
            console.log(token.token)
            return token.token !== req.token
        })
    
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }

})




//logout of all devices
router.post('/users/logoutAll', authentication, async (req, res) => {

    try {
        req.user.tokens = []
        
        await req.user.save()
        console.log(req.user)
        res.send()
    } catch (error) {
        res.status(500).send('erroorr')
    }
})






//fetching data for users

// reading profile
router.get('/users/me', authentication ,async ( req, res) => {   //for reading data
    
    res.send(req.user)

   
 })






router.patch('/users/me', authentication, async (req, res) => {  //for updating data
    const updates = Object.keys(req.body)  //array of properties
    const allowed = ['name', 'email', 'password', 'age']
    const isValidoperation = updates.every((update) => {
        return allowed.includes(update)
    })
    
    if(!isValidoperation) {
        return res.status(400).send('Invalid update')
    }
    
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        
        await req.user.save()
        
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})









//deleting a user 
router.delete('/users/me', authentication, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        await user.save()
        
        sendCancelMail(req.user.email, req.user.name)
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const avatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, cb) {
        if(!file.originalname.match('.[jpg|jpeg|png]$')) {
            return cb(new Error('Upload jpg, jpeg, png'))
        }
        cb(undefined, true)
    }
})

// avatar uploading
router.post('/users/me/avatar' ,authentication, avatar.single('avatar'),async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send('avatar uploaded ;) ')
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})


router.delete('/users/me/avatar', authentication, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// for seeing avatars
router.get('/users/:id/avatar', async (req, res) => {
    const user = await User.findById(req.params.id)
    console.log(user)
    try {
        if(!user || !user.avatar) {
            throw new Error()
        }
        
        res.set('Content-type', 'image/png')
        console.log('1')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})
module.exports = router
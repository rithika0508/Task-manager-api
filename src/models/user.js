const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({  //schema is used for hashing password
    name: {
        type: String,
        required: true,   //its required to give name byt age is optional
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        },
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('password cannot contain password');
            }
        }        
        
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
   
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}

userSchema.methods.generateAuthToken = async function () {
    
    const user = this
    console.log(process.env.JWT_SECRET)
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)  //user._id.toString()
    console.log('2')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}


// for matching email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    
    if(!user) {
        throw new Error()
    }
    const pass_match =await bcrypt.compare(password, user.password)
    if(!pass_match) {
        throw new Error('')
    }
    return user
}

const task = require('./tasks.js')

userSchema.pre('remove', async function(next) {
    const user = this
    await task.remove({ owner: user._id })
    next()
})
// hashing the plain text password
userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()
})
const User = mongoose.model('User', userSchema)



module.exports = User
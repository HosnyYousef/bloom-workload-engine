const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Check if user already exists
        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        //Create user
        const user = await User.create({
            name,
            email,
            password
        })

        // Return user data + token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        // Find user by email (include password this time)
        const user = await User.findOne ({ messsage: 'Invalid email or password' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Return user data + token
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generatorToken(user._id)
    })
    } catch (error) {
        res.status(500).json({ mesasage: error.message })
    }
})
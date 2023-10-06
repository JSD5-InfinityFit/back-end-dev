const bcrypt = require('bcryptjs')
const User = require('../models/User.js')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    try{
        // Check user
        const {username, password} = req.body
        let user = await User.findOne({username})
        if (user) {
            return res.status(400).send('User Already Exists')
        }
        const salt = await bcrypt.genSalt(10)
        user = new User({
            username, 
            password
        })
        // encrypt
        user.password = await bcrypt.hash(password, salt)
        await user.save()
        res.send('Register Success')
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.login = async (req, res) => {
    try{
        const {username, password} = req.body
        let user = await User.findOneAndUpdate({username}, {new: true})
        if (user && user.enabled) {
            //check password
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).send('Password Invalid')
            }
            // payload
            const payload = {
                user: {
                    username: user.username,
                    role: user.role
                }
            }
            // generate token
            jwt.sign(payload, 'jwtSecret', {expiresIn: 3600}, (err, token)=>{
                if(err) throw err
                res.json({token, payload})
            } )

            // console.log(isMatch)
            // res.send('Hello login')
        } else {
            return res.status(400).send('User not found!!')
        }
    } catch(err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.currentUser = async (req, res) => {
    try {
        // console.log(req.user)
        const user = await User.findOne({username: req.user.username})
        .select('-password').exec()
        res.send(user)
        // console.log(user)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.listUser = async (req, res) => {
    try{
        res.send('List Get User')
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.editUser = async (req, res) => {
    try{
        res.send('Edit User')
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.deleteUser = async (req, res) => {
    try{
        res.send('Delete User')
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}
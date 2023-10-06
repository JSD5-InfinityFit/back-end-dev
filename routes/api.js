const express = require('express')
const router = express.Router()

// controller
const {register, login, listUser, editUser, deleteUser, currentUser} = require('../controllers/auth.js')

// middleware
const {auth} = require('../middleware/auth.js')

router.post('/register', register)
router.post('/login', login)
router.post('/current-user', auth, currentUser)
router.get('/auth',listUser)
router.put('/auth', editUser)
router.delete('/auth', deleteUser)

module.exports = router
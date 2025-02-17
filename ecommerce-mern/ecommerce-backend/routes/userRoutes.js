const express = require('express');
const { addUser, searchUser, deleteUser, updateUser } = require("../controllers/userController");
const { requireSignIn } = require('../middlewares/authMiddleware');
const router = express.Router();


//addUser user
router.post('/addUser', requireSignIn, addUser);

//search User
router.get('/searchUser', requireSignIn, searchUser);

//delete user
router.delete('/deleteUser/:id', requireSignIn, deleteUser);

// Update user
router.put('/updateUser/:id', requireSignIn, updateUser);

module.exports = router;
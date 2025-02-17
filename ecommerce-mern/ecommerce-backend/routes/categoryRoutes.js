// routes/categoryRoutes.js
const express = require('express');
const { requireSignIn, isAdmin } = require('../middlewares/authMiddleware');
const {
    addCategory,
    updateCategory,
    getCategory,
    searchCetegory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Create category route
router.post('/create-category', requireSignIn, isAdmin, addCategory);

// Update category route
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategory);

// Get all categories route
router.get('/get-categories', getCategory);

// Get single category route
router.get('/get-category/:slug', searchCetegory);

// Delete category route
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategory);

module.exports = router;
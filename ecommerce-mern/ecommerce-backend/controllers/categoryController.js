// controllers/categoryController.js
const categoryModel = require('../models/categoryModel');
const slugify = require('slugify');

// Create category controller
// api = http://localhost:5000/api/category/create-category
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(401).send({ message: "Name is required" });
        }
        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(200).send({
                success: false,
                message: "Category Already Exists",
            });
        }
        const category = await new categoryModel({
            name,
            slug: slugify(name),
        }).save();
        res.status(201).send({
            success: true,
            message: "New category created",
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in Category",
        });
    }
};

// Update category controller
// api = http://localhost:5000/api/category/update-category/:id
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const category = await categoryModel.findByIdAndUpdate(
            id,
            { name, slug: slugify(name) },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: "Category Updated Successfully",
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while updating category",
        });
    }
};

// Get all categories controller
// api = http://localhost:5000/api/category/get-categories
const getCategory = async (req, res) => {
    try {
        const category = await categoryModel.find({});
        res.status(200).send({
            success: true,
            message: "All Categories List",
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while getting all categories",
        });
    }
};

// Get single category controller
// api = http://localhost:5000/api/category/get-category/:slug
const searchCetegory = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug });
        if (!category) {
            res.status(404).send({
                success: false,
                message: "Category not found",
                category,
            });
        } else {
            res.status(200).send({
                success: true,
                message: "Get Single Category Successfully",
                category,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while getting single category",
        });
    }
};

// Delete category controller
// api = http://localhost:5000/api/category/delete-category/:id
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Category Deleted Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while deleting category",
            error,
        });
    }
};

module.exports = {
    addCategory,
    updateCategory,
    getCategory,
    searchCetegory,
    deleteCategory
};
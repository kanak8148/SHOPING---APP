const userModel = require('../models/userModel');

// add User
// api = http://localhost:5000/api/user/addUser
const addUser = async (req, res) => {
    try {
        console.log('User data === > ', req.body)
        const { name, email, password, phone, address, answer } = req.body;
        //validation
        if (!name) {
            return res.send({ message: "name is required" });
        }
        if (!email) {
            return res.send({ message: "email is required" });
        }
        if (!password) {
            return res.send({ message: "password is required" });
        }
        if (!phone) {
            return res.send({ message: "phone is required" });
        }
        if (!address) {
            return res.send({ message: "address is required" });
        }
        if (!answer) {
            return res.send({ message: "answer is required" });
        }

        const existingUser = await userModel.findOne({ email });
        // existing user
        if (existingUser) {
            return res.status(200).send({
                success: true,
                message: "Already Added, please login"
            });
        }

        // Save user
        const user = await new userModel({ name, email, phone, address, password, answer }).save();

        res.status(201).send({
            success: true,
            message: "User Added Successfully",
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in User Adding",
            error
        });
    }
};

// Search User
// api = http://localhost:5000/api/user/searchUser
const searchUser = async (req, res) => {
    try {
        const { query } = req.body; // Search criteria from the request body

        let users;
        if (query) {
            // If a query is provided, search for users matching the query
            users = await userModel.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } }, // case-insensitive search for name
                    { email: { $regex: query, $options: 'i' } }, // case-insensitive search for email
                    { phone: { $regex: query, $options: 'i' } }  // case-insensitive search for phone
                ]
            });
        } else {
            // If no query is provided, return all users
            users = await userModel.find();
        }

        if (users.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No users found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Users found successfully",
            users
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in searching users",
            error
        });
    }
};


// Delete User
// api = http://localhost:5000/api/user/deleteUser/:id
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id; // Get the user ID from the URL parameters
        const deletedUser = await userModel.findByIdAndDelete(userId); // Delete the user

        if (!deletedUser) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in deleting user",
            error
        });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;
        
        const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true });
        
        if (!updatedUser) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in updating user",
            error
        });
    }
};


module.exports = {
    addUser,
    searchUser,
    deleteUser,
    updateUser
};
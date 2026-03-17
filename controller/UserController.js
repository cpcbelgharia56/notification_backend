const express = require('express');
const User = require('../model/User');
const bcrypt = require('bcrypt');

const router = express.Router();


// ================== HOME ==================
router.get('/', function (req, res) {
    res.send("This is User Home Page....!!!");
});


// ================== REGISTER USER ==================
router.post('/register_user', async function (req, res) {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const new_user = new User({
            userid: req.body.userid,
            name: req.body.name,
            password: hashedPassword,  // save hashed password
            contact: req.body.contact,
            fcmToken: req.body.fcmToken
        });

        console.log(28, new_user)

        const dataToSave = await new_user.save();

        res.status(201).json({
            status: true,
            message: "User registered successfully",
            user: dataToSave
        });

    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
});


// ================== GET ALL USERS ==================
router.get('/get_all_users', async function (req, res) {
    try {
        const users = await User.find();
        res.status(200).json({ status: true, users: users });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


// ================== GET USER BY ID ==================
router.get('/get_user_by_id/:id', async function (req, res) {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        res.status(200).json({ status: true, user: user });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


// ================== UPDATE USER ==================
router.put('/update_user/:id', async function (req, res) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                userid: req.body.userid,
                name: req.body.name,
                password: req.body.password,
                contact: req.body.contact
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        res.status(200).json({ status: true, user: updatedUser });

    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
});


// ================== DELETE USER ==================
router.delete('/delete_user/:id', async function (req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        res.status(200).json({ status: true, message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


// ================== LOGIN USER ==================
router.post('/login_user', async function (req, res) {
    try {
        const { userid, password } = req.body;

        const user = await User.findOne({ userid: userid });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "Invalid password"
            });
        }

        res.status(200).json({
            status: true,
            message: "Login successful",
            user: user
        });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


module.exports = router;
const express = require('express');
const Admin = require('../model/Admin');
const bcrypt = require('bcrypt');
const User = require('../model/User')

const admin = require("firebase-admin");

const serviceAccount = require("../firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const router = express.Router();


// ================== HOME ==================
router.get('/', function (req, res) {
    res.send("This is User Home Page....!!!");
});


// ================== REGISTER USER ==================
router.post('/register_admin', async function (req, res) {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const new_user = new Admin({
            adminid: req.body.adminid,
            name: req.body.name,
            password: hashedPassword,  // save hashed password
            contact: req.body.contact
        });

        const dataToSave = await new_user.save();

        res.status(201).json({
            status: true,
            message: "Admin registered successfully",
            user: dataToSave
        });

    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
});


// ================== GET USER BY ID ==================
router.get('/get_admin_by_id/:id', async function (req, res) {
    try {
        const user = await Admin.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        res.status(200).json({ status: true, user: user });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


// ================== UPDATE USER ==================
router.put('/update_admin/:id', async function (req, res) {
    try {
        const updatedUser = await Admin.findByIdAndUpdate(
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
router.delete('/delete_admin/:id', async function (req, res) {
    try {
        const deletedUser = await Admin.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        res.status(200).json({ status: true, message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


// ================== LOGIN USER ==================
router.post('/login_admin', async function (req, res) {
    console.log(103, req.body)
    try {
        const { adminid, password } = req.body;

        const user = await Admin.findOne({ adminid: adminid });

        if (!user) {
            return res.status(200).json({
                status: false,
                message: "Admin not found"
            });
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(200).json({
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
        res.status(200).json({ status: false, message: error.message });
    }
});

router.post("/send-notification", async (req,res)=>{

try{

const users = await User.find();

const tokens = users.map(u => u.fcmToken);

console.log('All tokens: ', tokens)

const message = {
  notification:{
    title:req.body.title,
    body:req.body.message
  },
  tokens:tokens
};

const response = await admin.messaging().sendEachForMulticast(message);

res.json({
   message:"Notification Sent",
   success:response.successCount
});

}catch(error){

console.log(error);

res.json({
   message:"Error sending notification"
});

}

});


module.exports = router;
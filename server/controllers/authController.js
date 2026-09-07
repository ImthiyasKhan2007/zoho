const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // 3. Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Change password for logged-in user
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new password are required",
            });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update logged-in user's name/email
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user._id);

        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already in use",
                });
            }
            user.email = email;
        }

        if (name) user.name = name;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Toggle email notification preference
// @route   PUT /api/auth/notifications
const updateNotificationPreference = async (req, res) => {
    try {
        const { emailNotifications } = req.body;
        const user = await User.findById(req.user._id);
        user.emailNotifications = emailNotifications;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Notification preference updated",
            emailNotifications: user.emailNotifications,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    // @desc    Delete the logged-in user's account and all their data
    // @route   DELETE /api/auth/account
    const deleteAccount = async (req, res) => {
        try {
            const Monitor = require("../models/Monitor");
            const Check = require("../models/Check");
            const Server = require("../models/Server");
            const ServerStat = require("../models/ServerStat");

            const userId = req.user._id;

            // Delete all monitors and their check history
            const monitors = await Monitor.find({ user: userId });
            const monitorIds = monitors.map((m) => m._id);
            await Check.deleteMany({ monitor: { $in: monitorIds } });
            await Monitor.deleteMany({ user: userId });

            // Delete all servers and their stat history
            const servers = await Server.find({ user: userId });
            const serverIds = servers.map((s) => s._id);
            await ServerStat.deleteMany({ server: { $in: serverIds } });
            await Server.deleteMany({ user: userId });

            // Finally, delete the user
            await User.findByIdAndDelete(userId);

            res.status(200).json({
                success: true,
                message: "Account and all associated data deleted",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };
};
// @desc    Delete the logged-in user's account and all their data
// @route   DELETE /api/auth/account
const deleteAccount = async (req, res) => {
    try {
        const Monitor = require("../models/Monitor");
        const Check = require("../models/Check");
        const Server = require("../models/Server");
        const ServerStat = require("../models/ServerStat");

        const userId = req.user._id;

        // Delete all monitors and their check history
        const monitors = await Monitor.find({ user: userId });
        const monitorIds = monitors.map((m) => m._id);
        await Check.deleteMany({ monitor: { $in: monitorIds } });
        await Monitor.deleteMany({ user: userId });

        // Delete all servers and their stat history
        const servers = await Server.find({ user: userId });
        const serverIds = servers.map((s) => s._id);
        await ServerStat.deleteMany({ server: { $in: serverIds } });
        await Server.deleteMany({ user: userId });

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "Account and all associated data deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
module.exports = { registerUser, loginUser, getMe, changePassword, updateProfile, updateNotificationPreference, deleteAccount };

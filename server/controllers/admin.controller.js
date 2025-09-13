const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const Project = require('../models/project.model');

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Apply search filters
        const filter = {};

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { username: searchRegex },
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex }
            ];
        }

        if (req.query.role) {
            filter.role = req.query.role;
        }

        if (req.query.active !== undefined) {
            filter.active = req.query.active === 'true';
        }

        // Get users with pagination
        const users = await User.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const total = await User.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            results: users.length,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get user by ID
 */
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Create user (admin only)
 */
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: existingUser.email === email
                    ? 'Email already in use'
                    : 'Username already taken'
            });
        }

        // Create new user
        const newUser = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            role: role || 'user'
        });

        // Create profile for the user
        await Profile.create({
            userId: newUser._id,
            contactEmail: email
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update user
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Fields that should not be updated directly
        const restrictedFields = ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'];

        // Filter out restricted fields
        const filteredBody = Object.keys(req.body).reduce((obj, key) => {
            if (!restrictedFields.includes(key)) {
                obj[key] = req.body[key];
            }
            return obj;
        }, {});

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            filteredBody,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete user's profile
        await Profile.findOneAndDelete({ userId: id });

        // Delete user's projects
        await Project.deleteMany({ userId: id });

        // Delete user
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get platform statistics
 */
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalRegularUsers = totalUsers - totalAdmins;

        const totalProjects = await Project.countDocuments();
        const publicProjects = await Project.countDocuments({ visible: true });

        const newUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const newProjects = await Project.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        res.status(200).json({
            status: 'success',
            data: {
                users: {
                    total: totalUsers,
                    admins: totalAdmins,
                    regularUsers: totalRegularUsers,
                    newUsersLast30Days: newUsers
                },
                projects: {
                    total: totalProjects,
                    public: publicProjects,
                    private: totalProjects - publicProjects,
                    newProjectsLast30Days: newProjects
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

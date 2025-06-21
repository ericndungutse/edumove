import { User, Transporter, School } from '../model/user.model.js';
import sendEmail from '../utils/email.js';

// Generic function to handle errors
const handleError = (res, error) => res.status(500).json({ error: error.message });

// User Controller
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    handleError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
};

const createUser = async (req, res) => {
  try {
    const body = req.body;
    if (!body.password) body.password = process.env.DEFAULT_PASSWORD;
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    handleError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
};

const updatePassword = async (req, res) => {
  try {
    // 1) Get User from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Get body data
    const { currentPassword, newPassword } = req.body;

    // 3) Check if user exist and currentPassword is correct
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect Password' });
    }

    // 4) Update user password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

// Specific Controllers for Transporter, School
const createTransporter = async (req, res) => {
  try {
    const body = req.body;
    const defaultPassword = process.env.DEFAULT_PASSWORD;
    if (!body.password) body.password = defaultPassword;
    const transporter = new Transporter(body);
    await transporter.save();

    // send welcome email
    try {
      await sendEmail({
        to: transporter.email,
        subject: 'Welcome to EduMove',
        body: `
        <h1>Welcome, ${transporter.name}!</h1>
        <p>Your account has been created successfully.</p>
        <p>You can now login to your account using the following credentials:</p>
        <p>Email: ${transporter.email}</p>
        <p>Password: ${defaultPassword}</p>
        `,
      });
    } catch (e) {
      console.log('failed to send email', e.message);
    }

    res.status(201).json(transporter);
  } catch (error) {
    handleError(res, error);
  }
};

const createSchool = async (req, res) => {
  try {
    const body = req.body;
    const defaultPassword = process.env.DEFAULT_PASSWORD;
    if (!body.password) body.password = defaultPassword;
    const school = new School(body);
    await school.save();
    // send welcome email
    try {
      await sendEmail({
        to: school.email,
        subject: 'Welcome to EduMove',
        body: `
        <h1>Welcome, ${school.name}!</h1>
        <p>Your account has been created successfully.</p>
        <p>You can now login to your account using the following credentials:</p>
        <p>Email: ${school.email}</p>
        <p>Password: ${defaultPassword}</p>
        `,
      });
    } catch (e) {
      console.log('failed to send email', e.message);
    }
    res.status(201).json(school);
  } catch (error) {
    handleError(res, error);
  }
};

const getAllTransporters = async (req, res) => {
  try {
    const transporters = await Transporter.find();
    res.json(transporters);
  } catch (error) {
    handleError(res, error);
  }
};

const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools);
  } catch (error) {
    handleError(res, error);
  }
};

export {
  getAllSchools,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
  createTransporter,
  createSchool,
  getAllTransporters,
};

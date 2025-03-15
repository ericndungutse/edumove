import { User, Transporter, School } from '../model/user.model.js';

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
    if (!body.password) body.password = process.env.DEFAULT_PASSWORD;
    const transporter = new Transporter(body);
    await transporter.save();
    res.status(201).json(transporter);
  } catch (error) {
    handleError(res, error);
  }
};

const createSchool = async (req, res) => {
  try {
    const body = req.body;
    if (!body.password) body.password = process.env.DEFAULT_PASSWORD;
    const school = new School(body);
    await school.save();
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

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createTransporter,
  createSchool,
  getAllTransporters,
};

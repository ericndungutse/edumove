import Travel from '../model/travel.model.js'; // Adjust the path to your model
import { validationResult } from 'express-validator';

// Create a new travel record
export const createTravel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const travel = new Travel(req.body);
    await travel.save();

    res.status(201).json(travel);
  } catch (error) {
    console.error('Error creating travel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all travel records
export const getAllTravels = async (req, res) => {
  try {
    const travels = await Travel.find().populate('school');
    res.status(200).json(travels);
  } catch (error) {
    console.error('Error fetching travels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single travel record by ID
export const getTravelById = async (req, res) => {
  try {
    const travel = await Travel.findById(req.params.id).populate('school');
    if (!travel) {
      return res.status(404).json({ message: 'Travel not found' });
    }
    res.status(200).json(travel);
  } catch (error) {
    console.error('Error fetching travel by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing travel record by ID
export const updateTravel = async (req, res) => {
  try {
    const updatedTravel = await Travel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!updatedTravel) {
      return res.status(404).json({ message: 'Travel not found' });
    }

    res.status(200).json(updatedTravel);
  } catch (error) {
    console.error('Error updating travel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a travel record by ID
export const deleteTravel = async (req, res) => {
  try {
    const deletedTravel = await Travel.findByIdAndDelete(req.params.id);
    if (!deletedTravel) {
      return res.status(404).json({ message: 'Travel not found' });
    }
    res.status(200).json({ message: 'Travel deleted successfully' });
  } catch (error) {
    console.error('Error deleting travel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

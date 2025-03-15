import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  destinations: {
    type: [String], // Array of destinations/sites/districts
    required: true,
  },
  province: {
    type: String,
    enum: ['south', 'north', 'east', 'west', 'kigali city'], // Example privacy levels
    default: 'public', // Default privacy setting
  },
});

const Plan = mongoose.model('Plan', PlanSchema);

export default Plan;

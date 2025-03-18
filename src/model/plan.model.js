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
});

const Plan = mongoose.model('Plan', PlanSchema);

export default Plan;

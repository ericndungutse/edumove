import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    slots: { type: Number, required: true },
  },
  {
    _id: false,
  }
);

const scheduleSchema = new mongoose.Schema(
  {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },

    departure: { type: String, required: true },

    destination: { type: String, required: true },

    price: {
      type: Number,
      required: true,
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transporter',
      required: true,
    },
    timeSlots: [slotSchema],
  },
  { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;

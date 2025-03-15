import mongoose from 'mongoose';

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
    timeSlots: [
      {
        time: { type: String, required: true },
        slots: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;

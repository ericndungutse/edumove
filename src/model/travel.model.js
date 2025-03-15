import mongoose from 'mongoose';

const PaymentDetailsSchema = new mongoose.Schema(
  {
    transactionNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // Matches the trip's price
    paymentMethod: { type: String, required: true },
  },
  { _id: false }
);

const TravelSchema = new mongoose.Schema(
  {
    tripDetails: {
      plan: {
        name: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true }, // Date of the travel plan
      },

      departure: { type: String, required: true },
      destination: { type: String, required: true },
      price: { type: Number, required: true },

      transporter: {
        name: { type: String, required: true },
        contact: { type: String, required: true },
        vehicleNumber: { type: String, required: true },
      },

      departureTime: { type: String, required: true }, // Overall trip time

      paymentDetails: {
        type: PaymentDetailsSchema,
      },
    },

    guardian: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
    },

    student: {
      name: { type: String, required: true },
    },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },

    destinationArrivalTime: {
      type: Date,
      required: true,
    },

    schoolArrivalTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'In Transit', 'Completed', 'Cancelled'],
    },

    travelNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Travel = mongoose.model('Travel', TravelSchema);

export default Travel;

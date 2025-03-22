import mongoose from 'mongoose';

const PaymentDetailsSchema = new mongoose.Schema(
  {
    transactionNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // Matches the trip's price
    paymentMethod: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed'],
    },
  },
  { _id: false }
);

const TravelSchema = new mongoose.Schema(
  {
    travelDetails: {
      plan: {
        date: { type: Date, required: true }, // Date of the travel plan
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
      },

      departure: { type: String, required: true },
      destination: { type: String, required: true },
      price: { type: Number, required: true },

      transporter: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        contact: { type: String, required: true },
        bussNumber: { type: String, required: true },
      },
      departureTime: { type: String, required: true }, // Departure time of the trip

      expectedArrivalTime: {
        type: Date,
        required: true,
      },

      paymentDetails: {
        type: PaymentDetailsSchema,
        required: false,
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
      ref: 'User',
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

// Generate a unique travel number before saving and should be unique and human readable
TravelSchema.pre('save', async function (next) {
  if (this.isNew) {
    let travelNumber;
    let isDuplicate = true;

    // Keep regenerating the travel number until it is unique
    while (isDuplicate) {
      // Get the last 6 digits of the timestamp and generate a random 4-digit number
      const shortTimestamp = Date.now().toString().slice(-6); // Take the last 6 digits of the timestamp
      travelNumber = `TR-${shortTimestamp}-${Math.floor(Math.random() * 10000)}`;

      // Check if the generated travel number already exists in the database
      const existingTravel = await this.constructor.findOne({ travelNumber });
      if (!existingTravel) {
        isDuplicate = false; // If it's unique, stop regenerating
      }
    }

    this.travelNumber = travelNumber;
  }
  next();
});

const Travel = mongoose.model('Travel', TravelSchema);

export default Travel;

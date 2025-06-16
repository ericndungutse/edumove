import Travel from '../model/travel.model.js'; // Adjust the path to your model
import { validationResult } from 'express-validator';
import paypack from '../utils/paypack.js';
import {
  notifyGuardianOfTravelStatusChange,
  notifySchoolOfTravelStatusChange,
  notifyGuardianOfTravelCreation,
} from '../utils/notificationService.js';
import Schedule from '../model/schedule.model.js';

const findTransaction = async (ref) => {
  let {
    data: { transactions },
  } = await paypack.events({
    transaction_ref: ref,
  });

  let data = transactions.find(({ data }) => data.ref === ref && data.status === 'successful');

  return data;
};

// Create a new travel record
export const createTravel = async (req, res) => {
  try {
    let timeOut = 0;
    // Request for payment
    const checkout = await paypack.cashin({
      number: req.body.paymentNumber,
      amount: req.body.travelDetails.price,
      environment: process.env.NODE_ENV,
    });

    // Create a new travel record
    const travel = new Travel(req.body);
    await travel.save();

    // Waiting for paymentrespose.data.id;
    let data = await findTransaction(checkout.data.ref);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const intervalId = setInterval(() => {
      timeOut += 1000;
    }, 1000);

    while (!data) {
      if (timeOut === 20000) {
        clearInterval(intervalId);
        return res.status(400).json({
          status: 'fail',
          message: 'Payment not completed.',
        });
      }
      data = await findTransaction(checkout.data.ref);
    }

    // Update the travel record with payment details

    travel.travelDetails.paymentDetails.data.ref = data.data.ref;
    travel.travelDetails.paymentDetails.data.amount = data.data.amount;
    travel.travelDetails.paymentDetails.data.client = data.data.client;
    travel.travelDetails.paymentDetails.data.provider = data.data.provider;
    travel.travelDetails.paymentDetails.data.status = data.data.status;
    travel.travelDetails.paymentDetails.data.created_at = data.data.created_at;

    await travel.save({ validateBeforeSave: false });

    clearInterval(intervalId);

    // Send Email Containing Travel Details
    await notifyGuardianOfTravelCreation(travel);

    // Payment successfull
    res.status(200).json({
      status: 'success',
      message: 'payment was successful',
      data: {
        travel,
      },
    });
  } catch (error) {
    console.error('Error creating travel:', error);
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Will be required if user did not pay for the travel
// export const webhook = async (req, res) => {
//   //Extract X-Paypack-Signature headers from the request
//   const requestHash = req.get('X-Paypack-Signature');

//   //secret which you can find on your registered webhook
//   const secret = process.env.WEBHOOK_SECRET_KEY;

//   //Create a hash based on the parsed body
//   const hash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('base64');

//   // Compare the created hash with the value of the X-Paypack-Signature headers
//   if (!(hash === requestHash || req.Method != 'HEAD')) return res.send({});

//   // Update Order Products
//   // Find Order By Transaction Reference

//   // Check if transaction was successfull
//   if (req?.body?.data?.status !== 'successful') return res.send({});

//   // Update Order and product qunatities

//   const order = await Order.findOne({
//     tx_ref: req.body.data.ref,
//   });
//   await updateOrderAndProducts(order);

//   res.send({});
// };

// Get all travel records
// ...existing code...

// Get all travel records with filtering
export const getAllTravels = async (req, res) => {
  try {
    const { destination, date, timeSlot, scheduleId } = req.query;

    // Base query - filter by transporter if user is a transporter
    let query = {};
    if (req.user && req.user.role === 'transporter') {
      query['travelDetails.transporter.id'] = req.user._id;
    }

    // Add destination filter
    if (destination) {
      query['travelDetails.destination'] = { $regex: destination, $options: 'i' };
    }

    // Add date filter - filter by plan date
    if (date) {
      // Parse the date string and create start and end of day in UTC
      const [year, month, day] = date.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

      query['travelDetails.plan.date'] = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Add time slot filter
    if (timeSlot) {
      query['travelDetails.departureTime'] = timeSlot;
    }

    // Add schedule ID filter
    if (scheduleId) {
      query['travelDetails.schedule'] = scheduleId;
    }

    // Execute query with population
    const travels = await Travel.find(query).populate('school').populate('travelDetails.plan.id');

    res.status(200).json({
      status: 'success',
      results: travels.length,
      data: travels,
    });
  } catch (error) {
    console.error('Error fetching travels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ...existing code...

// Get a single travel record by ID
export const getTravelByTravelNumber = async (req, res) => {
  try {
    const travel = await Travel.findOne({ travelNumber: req.params.travelNumber }).populate('school');
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

// Confirm student boarded the bus
export const confirmBoarding = async (req, res) => {
  try {
    const { travelNumber } = req.params;

    // Find the travel by ID and check if it's available
    const travel = await Travel.findOne({ travelNumber }).populate('school');

    if (!travel) {
      return res.status(404).json({ message: 'Travel not found' });
    }

    // Ensure that only the transporter can confirm the boarding and for which the travel is associated with

    if (req.user._id.toString() !== travel.travelDetails.transporter.id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to confirm boarding for this travel',
      });
    }

    // Update the status of the travel to 'Boarded'
    travel.status = 'Boarded';

    // Save the updated travel document
    const updatedTravel = await travel.save({ validateBeforeSave: false });

    await notifyGuardianOfTravelStatusChange(travel);

    await notifySchoolOfTravelStatusChange(travel);

    res.status(200).json({
      status: 'success',
      data: {
        travel: updatedTravel,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};

// Mark all travels of a schedule as "Arrived At Destination"
export const markArrivedAtDestination = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { timeSlot } = req.query;

    // Find the schedule by ID and check if it's available
    const schedule = await Schedule.findById(scheduleId).populate('transporter');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Ensure that only the transporter associated with the schedule can mark travels as "Arrived At Destination"
    if (req.user._id.toString() !== schedule.transporter._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to mark travels for this schedule',
      });
    }

    // Build the query to filter travels by schedule and optionally by time slot
    const query = { 'travelDetails.schedule': scheduleId, 'travelDetails.departureTime': timeSlot };

    // Update the status of all travels matching the query
    const updatedTravels = await Travel.updateMany(query, { $set: { status: 'Arrived At Destination' } });

    // Notify guardians and schools for each travel
    const travels = await Travel.find(query).populate('school');
    for (const travel of travels) {
      await notifyGuardianOfTravelStatusChange(travel);
      await notifySchoolOfTravelStatusChange(travel);
    }

    res.status(200).json({
      status: 'success',
      message: 'All travels for the schedule and specified time slot have been marked as "Arrived At Destination"',
      data: {
        updatedTravels,
      },
    });
  } catch (error) {
    console.error('Error marking travels as "Arrived At Destination":', error);
    res.status(500).json({ message: error.message });
  }
};

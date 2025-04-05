import Travel from '../model/travel.model.js'; // Adjust the path to your model
import { validationResult } from 'express-validator';
import paypack from '../utils/paypack.js';

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
    // Payment successfull
    res.status(200).json({
      status: 'sucess',
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

export const checkout = async (req, res, next) => {};

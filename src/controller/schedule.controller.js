import Schedule from '../model/schedule.model.js';

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const newSchedule = new Schedule(req.body);
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    // If there is an authenticated user and is a transporter, get schedules for that user
    // Otherwise, get schedules for the specified transporter ID
    const transporterId = req.user && req.user.role === 'transporter' ? req.user._id : req.params.transporterId;

    const schedules = await Schedule.find({ transporter: transporterId });
    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: {
        schedules,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('plan').populate('transporter');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a schedule by ID
export const updateSchedule = async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('plan')
      .populate('transporter');
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a schedule by ID
export const deleteSchedule = async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Schedules by plan ID
export const getSchedulesByPlanId = async (req, res) => {
  try {
    const schedules = await Schedule.find({ plan: req.params.planId }).populate('plan').populate('transporter');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Schedules by transporter ID
export const getSchedulesByTransporterId = async (req, res) => {
  try {
    const schedules = await Schedule.find({ transporter: req.params.transporterId })
      .populate('plan')
      .populate('transporter');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');

router.post('/', async (req, res) => {
  try {
    // Destructure required fields from req.body
    const { doctorId, patientId, problem, symptoms, doctorName, patientName } = req.body;

    // Validate that required fields are present in the request body
    if (!doctorId || !patientId || !problem || !symptoms || !doctorName || !patientName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Create a session of consultation
    const newSession = new Consultation({
      patientId: patientId,
      doctorId: doctorId,
      doctorName,
      patientName,
      startTime: new Date(),
      endTime: '',
      status: 'Pending',
      problem,
      symptoms,
    });

    // Save the new session to the database
    await newSession.save();

    // Return the newly added session
    res.status(201).json(newSession);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

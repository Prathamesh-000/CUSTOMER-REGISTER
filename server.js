const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Customer = require('./models/Customer');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// POST route for customer registration
app.post('/register', async (req, res) => {
  const { name, email, phone, password, gender } = req.body;

  // Basic validation for required fields
  if (!name || !email || !phone || !password || !gender) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Email validation using regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    // Check if the email is already registered
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new customer to the database
    const newCustomer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
      gender,
    });

    await newCustomer.save();
    res.status(201).json({ message: 'Customer registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

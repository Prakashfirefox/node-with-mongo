const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const { exec } = require('child_process');
const connectDB = require('./src/config/db');
const organizations = require('./src/routes/organizations');
const users = require('./src/routes/users');
const cors = require('cors');



const app = express();

// Allow requests from all origins
app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Passport middleware
app.use(passport.initialize());

// Passport config
require('./src/midleware/passport')(passport);

// Use Routes
app.use('/api/organizations', organizations);
app.use('/api/users', users);


const startServer = async () => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
};

startServer();

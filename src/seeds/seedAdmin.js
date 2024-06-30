require('dotenv').config();
const faker = require('faker');
const connectDB = require('../config/db');
const User = require('../models/User');
const Organization = require('../models/Organization');

const seedAdmin = async () => {
  try {
    await connectDB();
    const org = new Organization({
      name: faker.company.companyName(),
      address: faker.address.streetAddress()
    });

    await org.save();

    const firstname = faker.name.firstName();
    const lastname = faker.name.lastName();
    const email = faker.internet.email(firstname, lastname);
    const phone = faker.phone.phoneNumber();
    const adminPassword = 'admin123';

    const admin = new User({
      firstname,
      lastname,
      email,
      phone,
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      organization: org._id
    });

    await admin.save();

    console.log('Admin user seeded');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();

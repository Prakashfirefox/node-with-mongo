const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const keys = require('../config/keys');
const User = require('../models/User');

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).json({status:false, data:[], message:"unauthorized"});
  }
  try {
    const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

    if (existingUser) {
      const errors = {};
      if (existingUser.username === req.body.username) {
        return res.status(200).json({status:false, data:[], message:"username already exists"});
      }
      if (existingUser.email === req.body.email) {
        return res.status(200).json({status:false, data:[], message:"email already exists"});
      }
      
    } else {
      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        organization: req.body.organization
      });

      const savedUser = await newUser.save();
      res.status(200).json({status:true, data:savedUser, message:"user added successfully"});
    }
  } catch (err) {
    res.status(200).json({status:false, data:err, message:"Somthing worng"});
  }
});


// @route   POST api/users/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ username, is_deleted:false, deletedAt:null }).then(user => {
    if (!user) {
      return res.status(200).json({status:false, data:[], message: 'Username not found' });
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user.id,
          username: user.username,
          role: user.role,
          organization: user.organization
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 31556926 }, // 1 year in seconds
          (err, token) => {
            res.json({
              user:user,
              status: true,
              token: 'Bearer ' + token
            });
          }
        );
      } else {
        return res.status(200).json({status:false, data:[], message: 'Password incorrect' });
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
    organization: req.user.organization
  });
});

// @route   GET api/users
// @desc    Get all users
// @access  Private (admin only)
router.get('/userlist/:orgId', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).json({status:false, data:[], message: 'Forbidden' });
  }

  const orgId = req.params.orgId;

  User.find({ organization: orgId, is_deleted:false, deletedAt:null })
    .populate('organization') // If you want to populate organization details
    .then(users => res.status(200).json({status:true, data:users, message: 'No users found' }))
    .catch(err => res.status(200).json({status:false, data:[], message: 'No users found' }));
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(200).json({status:true, data:[], message: 'Forbidden' });
  }
  User.findById(req.params.id)
    .populate('organization')
    .then(user => res.status(200).json({status:true, data:user, message: '' }))
    .catch(err => res.status(200).json({status:false, data:[], message: 'No user found with that ID' }));
});

// @route   PUT api/users/:id
// @desc    Update user by ID
// @access  Private (admin only)
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).json({status:false, data:[], message: 'Forbidden' });
  }
  req.body.updatedAt = new Date();

  if(req.body.password)
    delete req.body.password;
  User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(user => res.status(200).json({status:true, message:"user updated successfully", data:user }))
    .catch(err => res.status(200).json({status:false, data:err}));
});

// @route   DELETE api/users/:id
// @desc    Delete user by ID
// @access  Private (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).json({status:false,data:[], message: 'Forbidden' });
  }
  User.findByIdAndUpdate(
    req.params.id,
    {
      deletedAt: new Date(),
      is_deleted: true,
      updatedAt : new Date()
    },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return res.status(200).json({status:false, data:[], message: 'No user found with that ID' });
      }
      res.json({ status: true, data:[], message: 'user deleted successfully' });
    })
    .catch(err => res.status(200).json({status: false, data:[], message: 'No user found with that ID' }));
});

module.exports = router;

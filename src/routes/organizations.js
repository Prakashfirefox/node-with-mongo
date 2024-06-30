const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Organization = require('../models/Organization');

// @route   POST api/organizations
// @desc    Create an organization
// @access  Private (admin only)
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).json({status:false,data:[], message: 'unauthorized' });
  }
  const newOrg = new Organization({
    name: req.body.name,
    address: req.body.address
  });

  newOrg.save()
    .then(org => res.status(200).json({status:true,data:org, message: 'Organization added successfully' }))
    .catch(err => res.status(200).json({status:false,data:err, message: 'something went worng' }));
});

// @route   GET api/organizations/:id
// @desc    Get organization by ID
// @access  Private (admin only)
router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  Organization.findOne({ _id: req.params.id, is_deleted: false, deletedAt: null })
  .then(org => {
    if (!org) {
      return res.status(404).json({ status:false,data:[], message: 'No organization found with that ID' });
    }
    res.json({ status:true,data:org, message: 'No organization found with that ID' });
  })
  .catch(err => res.status(200).json({ status:false,data:[], message: 'No organization found with that ID' }));
});

// @route   GET api/organizations
// @desc    Get all organizations
// @access  Private (admin only)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(200).json({status:false, data:[], message: 'Forbidden' });
    }

    const orgs = await Organization.find({ is_deleted: false, deletedAt: null })
      .populate('users'); // Populate the 'users' field

    if (!orgs || orgs.length === 0) {
      return res.status(404).json({status:false, data:[], message: 'No organizations found' });
    }

    res.json({status:true, data:orgs, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status:false, data:[],message: 'Internal server error' });
  }
});



// @route   PUT api/organizations/:id
// @desc    Update organization by ID
// @access  Private (admin only)
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).json({status:false, data:[],  message: 'Forbidden' });
  }
 // Add updatedAt field to the request body
 req.body.updatedAt = new Date();

  Organization.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(org => res.status(200).json({status:true, data:org, message:'' }))
    .catch(err => res.status(200).json({status:false, data:err, message:"organization not found" }));
});

// @route   DELETE api/organizations/:id
// @desc    Delete organization by ID
// @access  Private (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).json({status:false, data:[], message: 'Forbidden' });
  }
  Organization.findByIdAndUpdate(
    req.params.id,
    {
      deletedAt: new Date(),
      is_deleted: true,
      updatedAt : new Date()
    },
    { new: true }
  )
    .then(org => {
      if (!org) {
        return res.status(200).json({status:false, data:[], message: 'No organization found with that ID' });
      }
      res.json({ success: true, data:[], message: 'organization deleted successfuly' });
    })
    .catch(err => res.status(200).json({status:false, data:[], message: 'No organization found with that ID' }));
});

module.exports = router;

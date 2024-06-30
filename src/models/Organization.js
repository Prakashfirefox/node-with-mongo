const mongoose = require('mongoose');

const OrganiztionSchema = new mongoose.Schema({
    name :{type:String, required: true, unique: true },
    address :{type:String, default: null},
    createdAt:{type: Date, default: Date.now},
    updatedAt:{type: Date, default: null},
    deletedAt: { type: Date, default: null },
    is_deleted: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
})

module.exports = mongoose.model('Organization', OrganiztionSchema)

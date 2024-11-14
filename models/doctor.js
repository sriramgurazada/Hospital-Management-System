
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  qualification: { type: String, required: true },
  description: String,
  hospital: String,
  department: String,
  specialisation: String,
  languagesSpoken: [String],
  research: String, 
});

module.exports = mongoose.model('Doctor', doctorSchema);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const patientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  height: { type: String, required: true },
  weight: { type: String, required: true },
  bloodPressure: { type: String, required: true },
  temperature: { type: Number, required: true },
  vaccinationStatus: { type: String },
  cold: { type: Boolean, required: true },
  cough: { type: Boolean, required: true },
  phoneNumber: { type: Number, required: true },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor', 
  },
  doctorFeedback: String, 

});


module.exports = mongoose.model('Patient', patientSchema);

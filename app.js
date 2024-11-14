const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Patient = require('./models/patient');
const Doctor = require('./models/doctor');
const cors = require('cors'); // Import the CORS module
const PORT = process.env.PORT || 8000;

const app = express();
app.use(bodyParser.json());


app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
  type Patient {
    _id: ID!
    firstName: String!
    lastName: String!
    height: String!
    weight: String!
    bloodPressure: String!
    temperature: Float!
    vaccinationStatus: String
    cold: Boolean!
    cough: Boolean!
    phoneNumber: Float!
    description: String
    doctor: Doctor
    doctorFeedback: String
  }
  

  input PatientInput {
    firstName: String!
    lastName: String!
    height: String!
    weight: String!
    bloodPressure: String!
    temperature: Float!
    vaccinationStatus: String
    cold: Boolean!
    cough: Boolean!
    phoneNumber: Float!
    doctorId: ID
    doctorFeedback: String
  }

  type Doctor {
    _id: ID!
    firstName: String
    lastName: String
    qualification: String
    description: String
    hospital: String
    department: String
    specialisation: String
    languagesSpoken: [String]
    research: String
    doctorFeedback: String
    patients: [Patient]
  }
      
      input DoctorInput {
        firstName: String!
        lastName: String!
        qualification: String!
        description: String
        hospital: String
        department: String
        specialisation: String
        languagesSpoken: [String]
        research: String
        doctorId: ID
        doctorFeedback: String
      }
      

    type RootQuery {
        patients: [Patient!]!
        patient(_id: ID!): Patient
        searchPatients(cold: Boolean, cough: Boolean): [Patient!]!
        doctors: [Doctor!]!
        doctor(_id: ID!): Doctor
        searchDoctors(name: String, specialisation: String, hospital: String): [Doctor!]!
        patientsByDoctor(doctorId: ID!): [Patient!]!
    }

    type RootMutation {
      createPatient(patientInput: PatientInput): Patient
      updatePatient(_id: ID!, patientInput: PatientInput): Patient
      deletePatient(_id: ID!): String
      createDoctor(doctorInput: DoctorInput): Doctor
      updateDoctor(_id: ID!, doctorInput: DoctorInput): Doctor
      deleteDoctor(_id: ID!): String

    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    patients: () => {
      return Patient.find().populate('doctor')
        .then(patients => patients.map(patient => {
          return {
            ...patient._doc,
            doctor: patient.doctor ? { ...patient.doctor._doc } : null
          };
        }))
        .catch(err => { throw err; });
    },
    patient: ({ _id }) => {
      return Patient.findById(_id).populate('doctor')
        .then(patient => {
          if (!patient) throw new Error('No patient found');
          return {
            ...patient._doc,
            doctor: patient.doctor ? { ...patient.doctor._doc } : null
          };
        })
        .catch(err => { throw err; });
    },
    createPatient: async ({ patientInput }) => {
      if (patientInput.doctorId) {
        const doctor = await Doctor.findById(patientInput.doctorId);
        if (!doctor) {
          throw new Error('Doctor not found');
        }
      }
      const patient = new Patient({
        ...patientInput,
        doctor: patientInput.doctorId
      });
      try {
        const result = await patient.save();
        return {
          ...result._doc,
          doctor: result.doctor ? await Doctor.findById(result.doctor) : null
        };
      } catch (err) {
        throw err;
      }
    },
    updatePatient: async ({ _id, patientInput }) => {
      if (patientInput.doctorId) {
        const doctorExists = await Doctor.findById(patientInput.doctorId);
        if (!doctorExists) {
          throw new Error('Doctor not found');
        }
        patientInput.doctor = patientInput.doctorId;
      }
      return Patient.findByIdAndUpdate(_id, { ...patientInput }, { new: true }).populate('doctor')
        .then(result => ({
          ...result._doc,
          doctor: result.doctor ? { ...result.doctor._doc } : null
        }))
        .catch(err => { throw err; });
    },
    deletePatient: ({ _id }) => {
      return Patient.findByIdAndDelete(_id)
        .then(() => 'Patient successfully deleted.')
        .catch(err => { throw err; });
    },
    searchPatients: ({ cold, cough }) => {
      let queryConditions = [];
      if (cold !== undefined) {
        queryConditions.push({ cold });
      }
      if (cough !== undefined) {
        queryConditions.push({ cough });
      }
      if (queryConditions.length === 0) {
        return Promise.resolve([]);
      }
      const query = { $or: queryConditions };
      return Patient.find(query)
        .then(patients => patients.map(patient => ({
          ...patient._doc
        })))
        .catch(err => { throw err; });
    },  
    doctors: () => {
        return Doctor.find()
          .then(doctors => doctors.map(doctor => ({ ...doctor._doc })))
          .catch(err => { throw err; });
      },
      doctor: ({ _id }) => {
        return Doctor.findById(_id)
          .then(doctor => ({ ...doctor._doc }))
          .catch(err => { throw err; });
      },
      createDoctor: ({ doctorInput }) => {
        const doctor = new Doctor(doctorInput);
        return doctor.save()
          .then(result => ({ ...result._doc }))
          .catch(err => { throw err; });
      },
      updateDoctor: ({ _id, doctorInput }) => {
        return Doctor.findByIdAndUpdate(_id, doctorInput, { new: true })
          .then(result => ({ ...result._doc }))
          .catch(err => { throw err; });
      },
      deleteDoctor: ({ _id }) => {
        return Doctor.findByIdAndDelete(_id)
          .then(() => 'Doctor successfully deleted.')
          .catch(err => { throw err; });
      },

      patientsByDoctor: ({ doctorId }) => {
        return Patient.find({ doctor: doctorId })
          .then(patients => {
            return patients.map(patient => {
              return { ...patient._doc };
            });
          })
          .catch(err => { throw err; });
    },
    
      searchDoctors: ({ name, specialisation, hospital }) => {
        // Initialize an empty query object
        let queryConditions = {};
      
        if (name) {
          // Search by first name or last name
          queryConditions['$or'] = [
            { firstName: new RegExp(name, 'i') }, // Case-insensitive
            { lastName: new RegExp(name, 'i') }   // Case-insensitive
          ];
        }
      
        if (specialisation) {
          queryConditions['specialisation'] = new RegExp(specialisation, 'i'); // Case-insensitive
        }
      
        if (hospital) {
          queryConditions['hospital'] = new RegExp(hospital, 'i'); // Case-insensitive
        }
      
        return Doctor.find(queryConditions)
          .then(doctors => doctors.map(doctor => ({ ...doctor._doc })))
          .catch(err => { throw err; });
      },




  },
  graphiql: true,
}));


app.get('/api/patients', async (req, res) => {
  try {
      const patients = await Patient.find().populate('doctor');
      res.json(patients);
  } catch (error) {
      res.status(500).send(error);
  }
});

app.post('/api/patients', async (req, res) => {
  try {
      const newPatient = new Patient(req.body);
      const savedPatient = await newPatient.save();
      res.status(201).json(savedPatient);
  } catch (error) {
      res.status(500).send(error);
  }
});




// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.umo3vkl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`)
mongoose.connect(`mongodb+srv://gurazada:gurazada@cluster0.umo3vkl.mongodb.net/events_react_dev?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      
        // app.listen(3000, () => console.log('RESTful API Server running on port 3000'));
   
    })
    .catch(err => {
        console.log(err);
    });


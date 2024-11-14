# COVID Patient Management System

This is a COVID-19 patient management system built with Node.js, Express, GraphQL, and MongoDB. It allows users to manage patient and doctor information, including adding and retrieving data through a GraphQL API.

## Features

- **Manage Patients**: Add, retrieve, and manage patient information.
- **Manage Doctors**: Add, retrieve, and manage doctor information.
- **GraphQL API**: Provides an easy-to-use API for querying and manipulating data.
- **Client Interface**: A simple HTML interface to search for patient information by ID.

## Project Structure


      ```bash
      .
      ├── app.js                 # Main application entry point
      ├── index.html             # Client interface for patient search
      ├── models/
      │   ├── doctor.js          # Doctor schema and model
      │   └── patient.js         # Patient schema and model
      ├── node_modules/          # Node.js dependencies
      ├── nodemon.json           # Nodemon configuration for environment variables
      ├── package.json           # Project dependencies and scripts
      └── package-lock.json      # Lock file for dependencies




## Getting Started
### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (for database)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sriramgurazada/Hospital-Management-System.git
   cd covid-patient-management


2. Install dependencies:

    npm install

3. Set up environment variables:

Update the following in nodemon

MONGO_USER=yourMongoDBUsername
MONGO_PASSWORD=yourMongoDBPassword
MONGO_DB=yourMongoDBName

4. Start the server:

npm start

5. Use nodemon for development:

npm run dev

**Accessing the Client Interface**

Open index.html in your browser and enter a patient ID to retrieve patient details.

## Usage

### GraphQL API

The GraphQL API can be accessed at `http://localhost:8000/graphql`.

#### Example Queries

1. **Fetch Patient by ID**:
   ```graphql
   query {
     patient(_id: "patientID") {
       firstName
       lastName
       height
       weight
       temperature
       doctor {
         firstName
         lastName
       }
       doctorFeedback
     }
   }


2. **Add a New Patient:**
    ```graphql
      mutation {
        addPatient(input: {
          firstName: "John",
            lastName: "Doe",
          height: 170,
          weight: 70,
          temperature: 36.5,
          doctor: "doctorID"
        }) {
          _id
          firstName
          lastName
        }
      }


**Dependencies**

express: Fast, minimalist web framework for Node.js
express-graphql: Create a GraphQL HTTP server
graphql: Core dependency for defining GraphQL schemas and queries
mongoose: MongoDB object modeling for Node.js
cors: Middleware for enabling CORS
bcryptjs: Password hashing
body-parser: Middleware for parsing request bodies

Dev Dependencies

nodemon: Automatically restart the server on code changes







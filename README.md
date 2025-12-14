# School Management System

A comprehensive school management website built with Node.js, TypeScript, and MVC architecture pattern.

## Features

- **Home Page**: Simple welcome page with school image placeholder
- **Student Management**: 
  - Add new students
  - View students list (filterable by class)
  - View individual student details
- **Teacher Management**:
  - Add new teachers
  - View teachers list
  - View individual teacher details
- **Billing Section**:
  - Submit student fees
  - Submit teacher salaries
  - View billing history
- **History Tab**:
  - View passout students
  - View passout teachers

## Technology Stack

- **Backend**: Node.js with Express
- **Language**: TypeScript
- **Architecture**: MVC (Model-View-Controller) Pattern
- **View Engine**: EJS
- **Database**: MongoDB with Mongoose ODM

## Project Structure

```
Web_Development/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── models/
│   │   ├── Student.ts           # Student model
│   │   ├── Teacher.ts           # Teacher model
│   │   ├── Billing.ts           # Billing model
│   │   └── History.ts           # History model
│   ├── controllers/
│   │   ├── homeController.ts    # Home page controller
│   │   ├── studentController.ts # Student controller
│   │   ├── teacherController.ts # Teacher controller
│   │   ├── billingController.ts # Billing controller
│   │   └── historyController.ts # History controller
│   ├── routes/
│   │   └── index.ts             # Application routes
│   └── server.ts                # Server entry point
├── views/                       # EJS templates
│   ├── layouts/
│   ├── home/
│   ├── students/
│   ├── teachers/
│   ├── billing/
│   └── history/
├── public/                      # Static files
│   └── css/
│       └── style.css
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/school_management
   ```
   - For MongoDB Atlas, use your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management
   ```

3. Make sure MongoDB is running:
   - For local MongoDB: Start MongoDB service
   - For MongoDB Atlas: Ensure your connection string is correct

4. Build TypeScript:
```bash
npm run build
```

5. Run the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Usage

1. Start the server (default port: 3001)
2. Open your browser and navigate to `http://localhost:3000`
3. Use the navigation menu to access different sections:
   - **Home**: Welcome page with school image
   - **Students**: Manage student records
   - **Teachers**: Manage teacher records
   - **Billing**: Submit fees and salaries
   - **History**: View passout records

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run dev` - Run in development mode with auto-reload
- `npm run watch` - Watch for TypeScript changes

## Database

The application supports **dual database mode**:

### Primary: MongoDB (Recommended)
When MongoDB is available and connected, the application uses MongoDB for all data storage. The database collections include:
- **students** - Active student records
- **teachers** - Active teacher records
- **billings** - Fee and salary payment records
- **historystudents** - Passout student records
- **historyteachers** - Passout teacher records

### Fallback: JSON File
If MongoDB connection fails or is not available, the application automatically falls back to using `data/database.json` file for data storage. This ensures the application continues to work even without a database connection.

### MongoDB Connection

The application attempts to connect to MongoDB using the connection string specified in the `.env` file:
- If MongoDB is available: Uses MongoDB for all operations
- If MongoDB is unavailable: Automatically switches to JSON file fallback

**Setup Options:**
- **Local MongoDB**: Install MongoDB and ensure it's running
- **MongoDB Atlas**: Use your cloud connection string in `.env`
- **No Database**: Application will use JSON file automatically

**Note**: The application includes example data in `data/database.json` that will be used when MongoDB is not connected.

## Notes

- The school image on the home page uses a placeholder. You can replace it by modifying `views/home/index.ejs`
- The application automatically detects database availability and switches between MongoDB and JSON file storage
- All data persists between server restarts (MongoDB or JSON file)
- The application follows MVC pattern for better code organization and maintainability
- CRUD operations are handled through Mongoose ODM (MongoDB) or JSON file operations (fallback)
- Example data is included in `data/database.json` for testing without MongoDB


# Smart Healthcare System for Urban Hospitals

A comprehensive healthcare management system built with React frontend and Node.js backend, following SOLID principles and clean architecture.

## 🏗️ Architecture Overview

### Backend Structure (SOLID Principles Implementation)

```
backend/
├── models/           # Data models (SRP - Single Responsibility)
│   ├── Hospital.js
│   ├── Doctor.js
│   └── User.js
├── controllers/      # HTTP request handlers (SRP)
│   ├── HospitalController.js
│   ├── DoctorController.js
│   └── AuthController.js
├── services/         # Business logic layer (SRP, DIP)
│   ├── HospitalService.js
│   ├── DoctorService.js
│   └── UserService.js
├── routes/          # API route definitions (SRP)
│   ├── hospitalRoutes.js
│   ├── doctorRoutes.js
│   └── authRoutes.js
├── middleware/      # Authentication & error handling (SRP)
│   └── auth.js
├── utils/           # Utility functions (SRP)
│   └── seedData.js
└── index.js         # Application entry point (SRP)
```

### Frontend Structure

```
@frontend/src/
├── components/      # React components (SRP)
│   ├── StaffDashboard.jsx
│   ├── Login.jsx
│   └── *.css
├── contexts/        # React context providers (SRP)
│   └── AuthContext.jsx
├── services/        # API communication (SRP, DIP)
│   └── api.js
└── assets/          # Static assets
    └── icons/
```

## 🎯 SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)
- **Models**: Each model handles only one entity's data structure
- **Controllers**: Each controller handles only one resource's HTTP requests
- **Services**: Each service handles only one domain's business logic
- **Components**: Each React component has a single responsibility

### 2. Open/Closed Principle (OCP)
- **Services**: Can be extended with new methods without modifying existing code
- **Middleware**: Role-based access control can be extended without changing core authentication
- **Models**: Can be extended with new fields/methods without breaking existing functionality

### 3. Liskov Substitution Principle (LSP)
- **Services**: All service classes follow the same interface pattern
- **Controllers**: All controllers follow the same response structure

### 4. Interface Segregation Principle (ISP)
- **AuthContext**: Provides only necessary authentication functionality
- **API Service**: Methods are focused on specific operations
- **Middleware**: Authentication and authorization are separated

### 5. Dependency Inversion Principle (DIP)
- **Services**: Depend on abstractions (other services) not concrete implementations
- **Controllers**: Depend on service abstractions
- **Frontend**: Uses API service abstraction for backend communication

## 🚀 Features

### Authentication System
- JWT-based authentication
- Role-based access control (Admin/Staff)
- Secure password hashing with bcrypt
- Automatic token validation

### Doctor Management
- Create new doctors with specialization
- Automatic hospital association
- Real-time doctor count in dashboard
- Form validation and error handling

### Hospital Management
- Default hospital setup (Asiri Hospitals)
- Hospital-staff relationship management
- Automatic data seeding

### Dashboard Features
- Real-time statistics
- Smooth tab navigation
- Responsive design
- Professional healthcare UI

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with:
   ```
   mongo_url=mongodb://localhost:27017/healthcare_system
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd @frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## 🔐 Default Credentials

- **Email**: admin@asirihospitals.com
- **Password**: admin123
- **Role**: Admin
- **Hospital**: Asiri Hospitals

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Doctors
- `POST /api/doctors` - Create doctor (Staff/Admin)
- `GET /api/doctors` - Get doctors by hospital
- `GET /api/doctors/all` - Get all doctors (Admin only)
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor (Admin only)

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID
- `POST /api/hospitals` - Create hospital (Admin only)

## 🎨 UI Features

- **Modern Design**: Clean, professional healthcare interface
- **Responsive Layout**: Works on desktop and mobile
- **Smooth Animations**: Fade-in transitions between tabs
- **Real-time Updates**: Live doctor count and form submissions
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations

## 🔧 Technical Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React 19 with hooks
- Context API for state management
- CSS3 with modern features
- Fetch API for HTTP requests

## 📝 Code Quality Features

- **No Code Smells**: Clean, readable, maintainable code
- **Error Handling**: Comprehensive error management
- **Validation**: Input validation on both frontend and backend
- **Security**: Secure authentication and authorization
- **Scalability**: Modular architecture for easy extension

## 🚦 Getting Started

1. Start both backend and frontend servers
2. Open browser to `http://localhost:5173` (frontend)
3. Login with default credentials
4. Navigate to "Doctor Roster" tab
5. Add new doctors and see them appear in real-time!

The system automatically associates doctors with the logged-in user's hospital (Asiri Hospitals) and provides a complete healthcare management experience.

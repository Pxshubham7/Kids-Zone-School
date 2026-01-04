# Kids Zone School - Full Stack Website

A beautiful, modern full stack website for a kids zone school built with React, Node.js, Express, and SQLite.

## Features

- 🏫 **Home Page** - Welcome section with announcements and features
- 📚 **Classes Page** - Browse available classes with enrollment information
- 📖 **About Page** - Learn about the school's mission and values
- 📸 **Gallery Page** - View school activities and events
- 📞 **Contact Page** - Submit contact forms
- 🛠️ **Admin Panel** - Manage students, announcements, and view contacts

## Tech Stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- Vite
- Axios

### Backend
- Node.js
- Express
- SQLite
- CORS

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are fine):
```bash
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Building for Production

To build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## Database

The application uses SQLite for data storage. The database file (`school.db`) will be automatically created in the `backend` directory when you first run the server.

The database includes the following tables:
- `students` - Student information and enrollment
- `classes` - Available classes and programs
- `announcements` - School announcements
- `contacts` - Contact form submissions

Sample data is automatically inserted when the database is first created.

## API Endpoints

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get a specific class

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Add a new student
- `DELETE /api/students/:id` - Delete a student

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create a new announcement

### Contacts
- `GET /api/contacts` - Get all contact submissions (admin)
- `POST /api/contacts` - Submit a contact form

## Project Structure

```
kids-school/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── package.json       # Backend dependencies
│   └── school.db          # SQLite database (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Footer)
│   │   ├── pages/         # Page components (Home, About, etc.)
│   │   ├── App.jsx        # Main app component with routing
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
└── README.md
```

## Features in Detail

### Admin Panel
- Add new students with parent information
- Create and manage announcements
- View contact form submissions
- Delete students from the system

### Contact Form
- Submit inquiries and enrollment requests
- All submissions are stored in the database
- Viewable in the admin panel

### Classes
- View all available classes
- See enrollment status and availability
- Age group information
- Teacher and schedule details

## License

ISC

## Support

For questions or issues, please contact the development team.


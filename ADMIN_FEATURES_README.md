# Campus Placement Portal - Admin Dashboard Features

## ✨ New Features Added

### 1. **Manage Students**
   - View all registered students
   - Track verification status
   - Monitor placement status
   - Student statistics (total, verified, placed)

### 2. **Manage Companies**
   - View all registered companies
   - Track approval status
   - Company statistics (total, active, pending)
   - Manage recruiter details

### 3. **Placement Drives**
   - View active placement drives
   - Track drive status (active, closed, upcoming)
   - Display job details (title, salary, location, positions)
   - Create and manage placement drives
   - Monitor selected students

### 4. **Placement Reports**
   - Placement rate analytics
   - Average package calculation
   - Total students and companies metrics
   - Open positions count
   - Generate and download reports

### 5. **Send Emails**
   - Send bulk emails to all students
   - Send bulk emails to all companies
   - Send emails to both groups
   - Email preview functionality
   - Professional HTML email templates
   - Track recipient count

---

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   npm install nodemailer
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Email Configuration (Gmail)**
   - Enable 2-factor authentication on your Gmail account
   - Generate an app password from Google Account settings
   - Use the app password in `EMAIL_PASS`

4. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5174` (or next available port)

---

## 🔐 Admin Authentication

To access admin dashboard features:

1. **Login as Admin**
   - Email: `admin@placement.com`
   - Password: `admin@123`
   - Or register a new account and set role as "admin"

2. **Admin Dashboard Access**
   - Navigate to `/admin` after login
   - All admin-only routes are protected with `adminMiddleware`

---

## 📧 Email Feature Details

### How Email Sending Works

1. **Recipient Types**
   - **Students**: Send to all registered students
   - **Companies**: Send to all registered companies
   - **Both**: Send to students and companies

2. **Email Preview**
   - Real-time preview of email content
   - Shows recipient count
   - Professional HTML formatting

3. **Email Configuration**
   - Uses Nodemailer with Gmail SMTP
   - Professional email templates
   - Plain text support with HTML formatting

### Example Email Sending:
```javascript
// Send email to all students about placement drive
{
  recipientType: "students",
  subject: "New Placement Drive - XYZ Company",
  message: "Dear Students,\n\nXYZ Company is recruiting..."
}
```

---

## 🗄️ Database Models

### New Models Added:

**Drive Model** (`Drive.js`)
```javascript
{
  company: ObjectId,           // Reference to company
  title: String,               // Job title
  description: String,         // Job description
  salary: Number,              // Salary/Package
  location: String,            // Location
  eligibility: String,         // Eligibility criteria
  positions: Number,           // No. of positions
  applicationDeadline: Date,   // Application deadline
  status: String,              // active/closed/upcoming
  selectedStudents: [ObjectId],// Selected student IDs
  createdAt: Date              // Creation timestamp
}
```

---

## 📡 API Routes

### Admin Routes (`/api/admin`)

#### Students Management
- `GET /admin/students` - Get all students
- `PUT /admin/students/:id/verify` - Verify a student
- `DELETE /admin/students/:id` - Delete a student

#### Companies Management
- `GET /admin/companies` - Get all companies
- `PUT /admin/companies/:id/approve` - Approve a company
- `DELETE /admin/companies/:id` - Delete a company

#### Placement Drives
- `GET /admin/drives` - Get all placement drives
- `POST /admin/drives` - Create new drive
- `PUT /admin/drives/:id/status` - Update drive status
- `DELETE /admin/drives/:id` - Delete a drive

#### Reports & Email
- `GET /admin/reports` - Get placement reports
- `POST /admin/send-email` - Send bulk email

---

## 🎨 UI Components

### Admin Dashboard Sections

1. **Overview** - Dashboard summary with statistics
2. **Students** - Student management table and stats
3. **Companies** - Company management table and stats
4. **Placement Drives** - Drive cards with details
5. **Reports** - Analytics and statistics
6. **Send Emails** - Email form with preview

### Styling Features
- Responsive grid layouts
- Color-coded status badges
- Interactive cards and buttons
- Professional gradient backgrounds
- Mobile-friendly design

---

## 🔧 Troubleshooting

### Email Not Sending
- Verify Gmail app password is correct
- Check if 2-factor authentication is enabled
- Ensure nodemailer is installed: `npm install nodemailer`

### "Backend not connected" Error
- Ensure backend server is running on port 5000
- Check MongoDB connection string in `.env`
- Verify network connectivity

### Admin Routes Not Working
- Confirm you're logged in as admin
- Check JWT token in browser localStorage
- Verify admin middleware is applied

### Database Connection Issues
- Validate MongoDB URI format
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

---

## 📱 Features Walkthrough

### Managing Students
1. Go to **Manage Students** tab
2. View all students in table format
3. See verification and placement status
4. Click actions to verify or manage students

### Managing Companies
1. Go to **Manage Companies** tab
2. Review company details
3. Approve pending companies
4. Track active recruiters

### Creating Placement Drives
1. Navigate to **Placement Drives**
2. Click "+ Create New Drive"
3. Fill in job details (title, salary, location, etc.)
4. Set application deadline and positions
5. Drive automatically appears in list

### Viewing Reports
1. Go to **Placement Reports** tab
2. See placement rate and statistics
3. View average package
4. Download full report (feature available)

### Sending Emails
1. Go to **Send Emails** tab
2. Select recipient type (students/companies/both)
3. Enter subject and message
4. Preview email content
5. Click "Send Email" button
6. Confirmation message shows count of recipients

---

## 🔒 Security Features

- JWT token-based authentication
- Admin role verification middleware
- Protected admin routes
- Password hashing with bcryptjs
- Secure email transmission

---

## 📈 Future Enhancements

- Batch upload students/companies from CSV
- Advanced filtering and search
- Email templates library
- Scheduled email campaigns
- SMS notifications
- Analytics dashboard with charts
- Student skill tracking
- Interview scheduling

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify environment variables are set correctly
3. Ensure both backend and frontend servers are running
4. Check browser console for error messages

---

**Version**: 1.0.0  
**Last Updated**: April 28, 2024

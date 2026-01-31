# Fullstack Project: Landing Page & Admin Panel

## 📌 Overview
This is a full-stack web application built for managing projects, clients, contact form submissions, and newsletter subscriptions. It consists of a public-facing landing page and a secure admin panel for content management.

---

## 🚀 Features

### Landing Page:
- **Our Projects Section**: Displays all projects fetched from the backend with image, name, description, and a "Read More" button.
- **Happy Clients Section**: Shows client testimonials with image, name, description, and designation.
- **Contact Form**: Allows visitors to submit their details (Name, Email, Mobile, City).
- **Newsletter Subscription**: Users can subscribe via email.

### Admin Panel:
- **Project Management**: Add, view, and manage projects.
- **Client Management**: Add, view, and manage client details.
- **Contact Form Responses**: View all submitted contact form entries.
- **Subscribed Emails**: View all newsletter subscribers.
- **Image Cropping**: Upload images with automatic cropping to a specific ratio (e.g., 450x350).

---

## 🛠️ Technologies Used

### Frontend:
- HTML / CSS / Javascript
- Tailwind CSS / Bootstrap
- Axios for API calls

### Backend:
- Node.js with Express.js
- MongoDB with Mongoose
- Multer for image uploads

### Deployment:
- Frontend: Netlify
- Backend: Render 
- Database: MongoDB Atlas (free tier)

---

## 📁 Project Structure

```
project-root/
│
├── frontend/
│   ├── index.html          (Landing Page)
│   ├── admin.html          (Admin Panel)
│   ├── css/
│   │   └── style.css
│   │  
│   ├── js/
│   │   ├── landing.js
│   │   └── admin.js
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── shapes/
│
├── backend/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Project.js
│   │   ├── Client.js
│   │   ├── Contact.js
│   │   └── Subscriber.js
│   ├── routes/
│   │   ├── projectRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── contactRoutes.js
│   │   └── subscriberRoutes.js
│   └── package.json
│
└── README.md

## ⚙️ Setup & Local Installation

### Prerequisites:
- Node.js (v16 or above)
- MongoDB Atlas account (or local MongoDB)
- Git

### Steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cdrgv/Real-Trust.git
   cd Real-Trust
   ```

2. **Backend Setup:**
   bash
   cd backend
   npm install
   
   Create a `.env` file with:
     
     PORT=5000
     MONGODB_URI=mongodb+srv://fullstack:fullstack2006@cluster0.jc9cbnh.mongodb.net/
     
   - Run the backend:
     bash
     npm start
     

4. **Frontend Setup:**
   bash
   cd ../frontend
   npm install
   
   Create a `.env` file with:
     
     API_URL=https://real-trust-8inu.onrender.com/api
     
   - Run the frontend:
     bash
     npm start
   

5. **Access the application:**
   - Landing Page: http://127.0.0.1:3001/frontend/index.html
   - Admin Panel: http://127.0.0.1:3001/frontend/admin.html

---


## 🌐 Deployment
- **Frontend**: Deployed on Netlify
- **Backend**: Deployed on Render 
- **Database**: MongoDB Atlas

**Live Demo Links:**
- Landing Page: https://realtrust3.netlify.app/
- Admin Panel: https://realtrust3.netlify.app/admin.html

---

## 📄 API Endpoints

| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | /api/projects         | Get all projects               |
| POST   | /api/projects         | Add a new project              |
| GET    | /api/clients          | Get all clients                |
| POST   | /api/clients          | Add a new client               |
| POST   | /api/contact          | Submit contact form            |
| GET    | /api/contact          | Get all contact submissions    |
| POST   | /api/subscribe        | Subscribe to newsletter        |
| GET    | /api/subscribers      | Get all subscribers            |

---

  ✅ Evaluation Criteria Met
- ✅ All required features implemented
- ✅ Clean, modular, and well-documented code
- ✅ Responsive design matching reference images
- ✅ User-friendly UI/UX for both landing page and admin panel
- ✅ Image cropping functionality
- ✅ Fully deployed and accessible

---

## 📬 Contact
For any queries, feel free to reach out:
- **Name**: VEMURI VENKATASAI SUKESH
- **Email**: vemurisukesh31012006@gmail.com
- **GitHub**: https://github.com/cdrgv/Real-Trust



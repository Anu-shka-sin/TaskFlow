# 🚀 TaskFlow - Task Manager Application

TaskFlow is a full-stack task management application that helps users organize, manage, and track their daily tasks efficiently. Users can create, update, complete, and delete tasks through a simple and responsive interface.

Backend Deployment
Available at your primary URL https://taskflow-o1wf.onrender.com

---

## 📌 Features

- 🔐 User Authentication (Sign Up & Login)
- ➕ Create New Tasks
- ✏️ Edit Existing Tasks
- ✅ Mark Tasks as Completed
- 🗑️ Delete Tasks
- 📋 View Pending and Completed Tasks
- 👤 User Profile Management
- 📱 Responsive Design
- ⚡ Fast and Interactive User Interface

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

---

## 📂 Project Structure

```bash
TaskFlow
│
├── backend
│   ├── routes
│   │   ├── taskRoute.js
│   │   └── userRoute.js
│   ├── server.js
│   ├── package.json
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   │   ├── Layout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Logout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── SignUp.jsx
│   │   ├── pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PendingPage.jsx
│   │   │   ├── CompletePage.jsx
│   │   │   └── Taskmodal.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Installation and Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/TaskFlow.git
cd TaskFlow
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm start
```

or

```bash
nodemon server.js
```

---

### 3️⃣ Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The application will run on:

```bash
http://localhost:5173
```

Backend server:

```bash
http://localhost:5000
```

---

## 📸 Screenshots

Add screenshots of your project here.

### Login Page
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0305d42e-8123-4d68-8e01-14d3cac23723" />


### Dashboard
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8e7e50e7-7578-471c-85c5-a32399978659" />

---

## 🔄 Application Workflow

1. User signs up or logs in.
2. User can create a new task.
3. Tasks are displayed on the dashboard.
4. User can update or delete tasks.
5. Completed tasks move to the Completed section.
6. Pending tasks remain in the Pending section.

---

## 🎯 Future Enhancements

- 📅 Due Date and Reminders
- 🔍 Search and Filter Tasks
- 🌙 Dark Mode
- 📊 Task Analytics Dashboard
- 📌 Task Priorities
- 📧 Email Notifications

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Added new feature"
```

4. Push to the branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.






---

## 👩‍💻 Author

**Anushka Singh**

- GitHub: https://github.com/Anu-shka-sin

# Secure Vault System

A modern full-stack secure vault web application built with React, Node.js, Express, and MongoDB.
The system allows users to securely manage, organize, and protect sensitive data with a futuristic cyber-style dashboard interface.

---

## 🚀 Features

* 🔐 Secure authentication system
* 📁 Vault management
* 🗑 Trash recovery system
* 🔑 Password generator
* 🛡 Security monitoring page
* ⚙ User settings & profile management
* 📊 Interactive dashboard
* 🌙 Modern cyberpunk UI design
* 📱 Responsive layout

---

## 🛠 Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS / Custom UI

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

---

## 📂 Project Structure

```bash
Secure2/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YoussefXAhmed/Secure-2.git
```

---

### 2️⃣ Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

### 3️⃣ Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

## ▶ Running The Project

### Start Backend

```bash
cd backend
node server.js
```

Server runs on:

```bash
http://localhost:5000
```

---

### Start Frontend

```bash
cd frontend
npm start
```

Frontend runs on:

```bash
http://localhost:3000
```

---

## 🚢 Deployment

### Prerequisites

- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier)
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account

---

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas), create a free cluster
2. Under **Database Access** → create a database user (username + password)
3. Under **Network Access** → add `0.0.0.0/0` to allow access from anywhere
4. Click **Connect** → **Drivers** → copy your connection string (`mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`)
5. Append `/password_manager` as the database name

---

### 2. Backend — Deploy to Render

1. Push the repo to GitHub
2. In [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Use these settings:

| Setting | Value |
|---|---|
| **Name** | `secure2-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Add these environment variables:

| Key | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string (with `<password>` replaced) |
| `JWT_SECRET` | A long random string (e.g., 64 chars) |
| `ADMIN_SECRET` | A secret for the `/setup-admin` endpoint |

6. Click **Create Web Service**
7. After deployment, copy the URL (e.g., `https://secure2-backend.onrender.com`)

#### Setting up an admin user

```bash
curl -X POST https://your-backend.onrender.com/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "secret": "your-admin-setup-secret"}'
```

---

### 3. Frontend — Deploy to Vercel

1. In [Vercel Dashboard](https://vercel.com) → **Add New** → **Project**
2. Connect your GitHub repo
3. Use these settings:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework** | `Create React App` (auto-detected) |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |

4. Add environment variable:

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | Your Render backend URL (e.g., `https://secure2-backend.onrender.com`) |

5. Click **Deploy**

> The `vercel.json` at the repo root automatically configures SPA routing (all paths → `index.html`).

---

### 4. Local Development After Deployment

To switch between production and local:

```bash
# frontend/.env — leave empty to use localhost:5000
REACT_APP_API_URL=

# Or set it to your Render backend
REACT_APP_API_URL=https://secure2-backend.onrender.com
```

---

## 📸 Preview

Cyber-style dashboard with:

* Sidebar navigation
* Dynamic statistics
* Search functionality
* Secure vault system

---

## 🔮 Future Improvements

* File encryption
* Cloud backup
* Two-factor authentication
* Dark/Light themes
* Notifications system

---

## 👨‍💻 Author

### Youssef Ahmed

GitHub:
[YoussefXAhmed GitHub](https://github.com/YoussefXAhmed?utm_source=chatgpt.com)

---

## 📄 License

This project is for educational and learning purposes.

# RBAC Blog — Full-Stack Node/Express/MongoDB Blog with Role-Based Access Control

A production-style blog engine where **Admins** can create/edit/delete posts and **Users** can only read them —
built with Express, MongoDB (Mongoose), EJS, and JWT-based authentication stored in an httpOnly cookie.

## 🔗 Live Demo
**[https://blog-app-rbac.onrender.com](https://blog-app-rbac.onrender.com)**

> Note: Hosted on Render's free tier — the app may take 30-50 seconds to load on first visit if it's been inactive (the server "wakes up" from sleep).

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Views:** EJS (server-rendered templates)
- **Auth:** JWT (JSON Web Tokens) in an httpOnly cookie + bcrypt password hashing
- **Authorization:** Custom RBAC middleware (`requireAuth`, `authorize('admin')`)

## Features
- Secure registration/login (passwords hashed with bcrypt, never stored in plain text)
- JWT auth via httpOnly cookies (can't be read/stolen by client-side JS — mitigates XSS)
- Role-based access control: only admins see `/dashboard` and can create/edit/delete posts
- SEO-friendly slugs (`/post/my-first-post` instead of `/post/64f...`)
- Flash messages for user feedback (success/error banners)
- Clean MVC-style structure: `models/`, `routes/`, `views/`, `middleware/`

## Folder Structure

blog-app/
├── server.js              # App entry point — wires everything together
├── models/
│   ├── User.js             # Schema + password hashing + role field
│   └── Post.js              # Schema + auto slug generation
├── middleware/
│   └── auth.js              # attachUser, requireAuth, authorize() — the RBAC logic
├── routes/
│   ├── authRoutes.js         # /auth/register, /auth/login, /auth/logout
│   └── postRoutes.js          # public post routes + admin-only CRUD
├── views/                   # EJS templates
└── public/css/style.css      # styling

## Run It Locally

1. Clone the repo and install dependencies:
```bash
   git clone https://github.com/kmanish29396-hub/blog-app-rbac.git
   cd blog-app-rbac
   npm install
```
2. Create a `.env` file (see `.env.example`) with your own `MONGO_URI`, `JWT_SECRET`, and `SESSION_SECRET`.
3. Run the app:
```bash
   npm start
```
4. Visit `http://localhost:3000`

## How RBAC Works Here
- The very first person to register automatically becomes **Admin**.
- Every subsequent registration defaults to the **User** role.
- Admin-only routes (`/dashboard`, create/edit/delete post) are protected by an `authorize('admin')` middleware — any non-admin hitting these routes gets a **403 Access Denied** page.
- Auth state is verified via a JWT stored in an **httpOnly cookie**, so it can't be read or stolen by client-side JavaScript (a common XSS mitigation).

## Possible Stretch Additions
- Pagination on the homepage
- Rich text editor for post content
- Comments system
- Password reset via email
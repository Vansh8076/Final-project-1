# BlogSpace — Full-Stack Blog Application

A responsive full-stack blog application built with **Node.js, Express.js, MongoDB, Mongoose, EJS and JWT authentication**. This repository combines the backend, database, CRUD, authentication, dashboard and deployment work into one project.

## Features

### Public blog features
- View all published blogs and individual blog details.
- Search blogs by title or content.
- Filter blogs by category.
- Responsive layout for desktop, tablet and mobile.

### User and security features
- User registration and login.
- Password hashing with bcrypt.
- JWT authentication stored in an HTTP-only cookie.
- Protected dashboard, profile and blog-writing routes.
- Users can edit or delete only their own blogs.
- Logout clears the authentication cookie.
- Basic security headers and login/register rate limiting.

### Blog management
- Create, read, update and delete blogs.
- Categories: Technology, Lifestyle, Travel, Food, Education and Other.
- Personal dashboard displays only the signed-in user's blogs.
- Profile page displays account information and allows name updates.

### REST API
- Authentication endpoints under `/api/auth`.
- Blog endpoints under `/api/blogs`.
- Public read endpoints and authenticated write endpoints.

## Technology stack

- Frontend: HTML, CSS, EJS templates
- Backend: Node.js and Express.js
- Database: MongoDB Atlas or local MongoDB
- ODM: Mongoose
- Authentication: JSON Web Tokens (JWT)
- Password security: bcryptjs
- Deployment: Render

## Project structure

```text
fullstack-blog-final/
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   └── ownership.js
├── models/
│   ├── Blog.js
│   └── User.js
├── public/
│   └── style.css
├── routes/
│   ├── apiRoutes.js
│   ├── authRoutes.js
│   ├── blogRoutes.js
│   └── dashboardRoutes.js
├── views/
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── blogs/
│   │   ├── form.ejs
│   │   ├── index.ejs
│   │   └── show.ejs
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── 404.ejs
│   ├── dashboard.ejs
│   ├── error.ejs
│   └── profile.ejs
├── .env.example
├── .gitignore
├── package.json
├── render.yaml
└── server.js
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Atlas account or a local MongoDB server

## Run locally

1. Extract this project and open its folder in VS Code or a terminal.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root by copying `.env.example`.
4. Add your MongoDB connection string to `MONGODB_URI`.
5. Set `JWT_SECRET` to a long, random secret (at least 32 characters).
6. Start the app:

   ```bash
   npm start
   ```

7. Open `http://localhost:3000`.

For development with automatic restart:

```bash
npm run dev
```

## MongoDB Atlas setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user and password.
3. In Network Access, allow your development IP address. For a hosted app, configure network access according to your deployment requirements.
4. Copy the Node.js connection string.
5. Put it in `.env` as `MONGODB_URI`.
6. Replace the username, password and cluster placeholders. URL-encode special characters in the database password.

Never commit `.env` or publish database credentials.

## Pages

| URL | Purpose | Access |
|---|---|---|
| `/blogs` | Browse, search and filter blogs | Public |
| `/blogs/:id` | View one blog | Public |
| `/register` | Create an account | Public |
| `/login` | Log in | Public |
| `/dashboard` | View your own blogs | Login required |
| `/blogs/new` | Create a blog | Login required |
| `/blogs/:id/edit` | Edit your own blog | Owner only |
| `/profile` | View/update your profile name | Login required |

## REST API endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get current user |

### Blogs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs` | List blogs |
| GET | `/api/blogs/:id` | Get one blog |
| POST | `/api/blogs` | Create a blog (login required) |
| PUT | `/api/blogs/:id` | Update your blog (owner only) |
| DELETE | `/api/blogs/:id` | Delete your blog (owner only) |

Search and category query examples:

```text
GET /api/blogs?q=node
GET /api/blogs?category=Technology
GET /api/blogs?q=node&category=Technology
```

The API uses JSON request bodies for POST and PUT. Authentication endpoints set/clear the same HTTP-only JWT cookie used by the web pages.

## Deploy on Render

1. Push this project to a GitHub repository.
2. Sign in to Render and create a **New Web Service** from that repository.
3. Use these settings:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables in Render:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a long, private random value
   - `JWT_EXPIRES_IN` = `7d`
5. Deploy. Render will provide your public website URL.
6. Test registration, login, creating a blog, editing/deleting your own blog, searching, category filtering and logout.

A `render.yaml` file is included as a deployment blueprint. Review the service settings and add the secret database connection string in Render.

## GitHub upload

From the project folder:

```bash
git init
git add .
git commit -m "Complete full-stack blog application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your own GitHub repository URL. Do not upload `.env`, `node_modules` or private credentials.

## Before submission checklist

- [ ] `.env` is configured locally and excluded from Git.
- [ ] MongoDB Atlas connection works.
- [ ] Registration and login work.
- [ ] A logged-out visitor cannot open the dashboard.
- [ ] A user sees only their own blogs on the dashboard.
- [ ] A user cannot edit or delete another user's blog.
- [ ] Create, read, update and delete work.
- [ ] Search and category filters work.
- [ ] Profile update and logout work.
- [ ] The deployed website has been tested on a phone and desktop.
- [ ] GitHub README contains your live deployment URL.

## LinkedIn post

I’m excited to share my Full-Stack Blog Application, built using Node.js, Express.js, MongoDB and EJS.

Features include secure JWT authentication, password hashing, protected user dashboards, full CRUD operations, search, category filters, individual blog pages and profile management.

This project helped me practise backend development, REST APIs, database integration, authentication and deployment.

GitHub: [Add your repository link]  
Live Demo: [Add your deployed website link]

#NodeJS #ExpressJS #MongoDB #WebDevelopment #FullStackDevelopment #JavaScript

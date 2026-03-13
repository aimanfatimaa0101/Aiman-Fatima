## 🗂 Project Structure
blog-app/
├── blog-backend/           # Node.js + Express API
│   ├── models/
│   │   ├── Post.js         # Blog post schema
│   │   └── Comment.js      # Comment schema
│   ├── controllers/
│   │   ├── postController.js
│   │   └── commentController.js
│   ├── routes/
│   │   ├── postRoutes.js
│   │   └── commentRoutes.js
│   ├── uploads/            # Uploaded images (auto-created)
│   ├── server.js           # Entry point
│   ├── seed.js             # Sample data seeder
│   └── package.json
│
└── blog-frontend/          # HTML/CSS/JS Frontend
    ├── index.html          # Single-page app shell
    ├── app.js              # All frontend logic
    └── styles/
        └── main.css        # Complete stylesheet

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd blog-backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI:
# MONGODB_URI=mongodb://localhost:27017/blogdb
# PORT=5000,

### 3. Seed Sample Data (Optional)
```bash
cd blog-backend
node seed.js

```
The API will be available at `http://localhost:5000`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts (with pagination, search, filter) |
| GET | `/api/posts/id/:id` | Get single post by ID |
| GET | `/api/posts/:id` | Get post by ID or slug |
| GET | `/api/posts/related/:id` | Get related posts |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Toggle like on post |
| GET | `/api/comments/:postId` | Get comments for post |
| POST | `/api/comments/:postId` | Add comment to post |
| DELETE | `/api/comments/:id` | Delete comment |

### Query Parameters for GET /api/posts
- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 9)
- `search` - Search in title, description, author
- `category` - Filter by category
- `sort` - Sort field (default: -createdAt)

### Post
```javascript
{
  title: String (required, max 200),
  slug: String (auto-generated, unique),
  description: String (required, max 500),
  content: String (required, HTML supported),
  author: String (required),
  category: Enum ['Technology','Travel','Food','Lifestyle','Business','Health','Education','Entertainment','Other'],
  tags: [String],
  featuredImage: String (URL),
  likes: Number (default 0),
  likedBy: [String] (user IDs),
  views: Number (auto-incremented),
  published: Boolean (default true),
  createdAt: Date,
  updatedAt: Date
}
```

### Comment
```javascript
{
  post: ObjectId (ref Post),
  name: String (required),
  email: String (required),
  content: String (required, max 1000),
  createdAt: Date
}
```

---

## Features

- **CRUD Operations** — Create, read, update, delete blog posts
- **Search** — Full-text search across title, description, author
- **Category Filtering** — Filter by 9 categories
- **Pagination** — Server-side pagination
- **Like System** — Toggle likes with persistent user tracking
- **Comment System** — Add and view comments on posts
- **Related Posts** — Shows related posts on detail page
- **Admin Dashboard** — Overview stats + manage all posts
- **Responsive Design** — Mobile, tablet, desktop ready
- **Animations** — Card hovers, page transitions, loading spinners
- **Auto Slug** — Slugs auto-generated from titles
- **View Counter** — Auto-increments on post view

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Fonts:** Playfair Display + DM Sans (Google Fonts)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **File Upload:** Multer (for image uploads)

```bash
# Set environment variables:
MONGODB_URI=your_atlas_connection_string
PORT=5000
NODE_ENV=production
```

### Frontend (e.g., Netlify, Vercel, GitHub Pages)
Update `API_BASE` in `app.js`:
```javascript
const API_BASE = 'https://your-backend-url.com/api';
```
Then deploy the `blog-frontend/` folder.

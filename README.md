# My Things

My Things is a personal dashboard for managing digital records. This project was developed as a college output to demonstrate the practical application of MongoDB for persistent storage within a modern Next.js application.

## Project Architecture and Technical Implementation

The application architecture is designed for scalability and performance, utilizing persistent storage.

### MongoDB Persistent Storage
MongoDB is the primary database for user profiles and application data. The implementation focuses on connection stability and data integrity.

*   **Database Connection Management**: Located in `lib/mongodb.ts`, the `connectMongoDB` function implements a singleton pattern using a global cache. This approach ensures that a single database connection is reused across serverless function invocations and prevents connection leaks during development hot-reloads.
*   **Data Modeling**: Application data is managed via **Mongoose** models found in the `models/` directory. These models define strict schemas for `User` and `Item` documents, ensuring type safety and consistency.
*   **Security and Isolation**: Each `Item` document includes a `userId` field (indexed for performance). In `app/api/items/route.ts`, all database operations are scoped to the authenticated user's ID retrieved via the `auth()` session, ensuring robust multi-tenant data isolation.



## Technology Stack

- **Framework**: Next.js 15
- **Database**: MongoDB (Atlas)
- **Authentication**: Auth.js v5 (NextAuth)
- **Styling**: Tailwind CSS
- **Middleware**: Next.js Edge Middleware for route protection

## Configuration & Deployment

### Environment Variables
To run the project locally or on Vercel, the following environment variables are required:

- `MONGODB_URI`: Your MongoDB connection string.
- `AUTH_SECRET`: A secure secret for session encryption (generate with `npx auth secret`).

### Vercel Deployment Instructions
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. In the Vercel Dashboard, navigate to **Settings > Environment Variables**.
4. Add all the variables listed above.
5. Set `AUTH_TRUST_HOST=true` in the environment variables to enable authentication on Vercel.
6. Re-deploy the project.

## Installation

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

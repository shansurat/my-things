# My Things

My Things is a personal dashboard for managing digital records. This project was developed as a college output to demonstrate the practical application of MongoDB for persistent storage and Redis for distributed caching within a modern Next.js application.

## Project Architecture

The application uses a full-stack architecture with Next.js 15, providing a responsive and secure environment for data management.

### MongoDB Implementation
MongoDB is used as the primary database to store user records persistently.
- Data is managed through Mongoose to ensure schema consistency.
- A singleton connection pattern is used in lib/mongodb.ts to optimize database performance.
- Each record is scoped to a specific user ID for secure data isolation.

### Redis Caching
Redis is implemented as a caching layer to improve the speed of the dashboard.
- The system uses a cache-aside pattern to serve frequently accessed data from memory.
- The cache is automatically updated (invalidated) whenever a user adds, edits, or deletes a record.
- This approach reduces the number of direct requests to MongoDB, resulting in faster load times.
- Note: The application is designed to fall back to MongoDB gracefully if Redis is not configured.

## Technology Stack

- Framework: Next.js 15
- Database: MongoDB
- Caching: Redis (Upstash)
- Authentication: Auth.js v5 (NextAuth)
- Styling: Tailwind CSS

## Configuration & Deployment

### Environment Variables
To run the project locally or on Vercel, the following environment variables are required:

- `MONGODB_URI`: Your MongoDB connection string.
- `AUTH_SECRET`: A secure secret for session encryption (generate with `npx auth secret`).
- `UPSTASH_REDIS_REST_URL`: Your Redis REST URL from Upstash.
- `UPSTASH_REDIS_REST_TOKEN`: Your Redis REST token from Upstash.

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

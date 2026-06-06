# My Things: Digital Record Dashboard

This documentation is prepared for LIS 198 (Data Structures) at the University of the Philippines Diliman. The project demonstrates the practical implementation of data structures, sorting algorithms, and database management within a modern web application environment.

## System Overview
The system is a persistent digital dashboard for managing personal items. It executes Create, Read, Update, and Delete (CRUD) operations. The architecture utilizes Next.js for the application framework, MongoDB for persistent storage, and NextAuth for user authentication. The interface provides real-time chronological calculations of item age.

## Core Data Structures

### 1. Persistent Storage (MongoDB Collections)
The application utilizes Document-Oriented NoSQL structures via Mongoose schemas. These are analogous to hash maps or dictionaries, offering high scalability.

**Item Schema (Hash-based Record):**
- `_id`: Unique identifier (String)
- `name`: Primary item designation (String, Required)
- `description`: Secondary details (String)
- `userId`: Relational identifier linking the item to a specific user (String, Indexed)
- `dateAcquired`: Granular timestamp of acquisition (Date Object)
- `image`: Image file associated with the item (Buffer)
- `imageContentType`: MIME type of the uploaded image (String)
- `createdAt`: Auto-generated insertion timestamp (Date Object)
- `updatedAt`: Auto-generated modification timestamp (Date Object)

**Note on Image Storage:** The application utilizes **Direct Binary Buffer Storage** for storing user-uploaded images. The image file is parsed into a Node.js `Buffer` and stored directly within the MongoDB document. While an Object Storage service (like AWS S3) is best practice for large-scale production, storing binaries directly in the database simplifies the architecture for the scope of this academic assignment.

**User Schema (Authentication Record):**
- `_id`: Unique identifier (String)
- `username`: Primary login identifier (String, Unique)
- `password`: Hashed credential (String)
- `createdAt`: Auto-generated insertion timestamp (Date Object)
- `updatedAt`: Auto-generated modification timestamp (Date Object)

### 2. Application State Management
The client interface relies on dynamic array structures to manage the user interface state.

- **Item Array (`Thing[]`)**: An array of objects representing the user's collection. This structure is mutable and updates in real-time following database synchronization.
- **Dynamic Array Methods**: The application utilizes standard array operations (map, filter) for rendering lists and updating the user interface optimally.

### 3. Algorithmic Implementations

**Sorting Algorithm:**
The application implements an active sorting algorithm on the client array. It utilizes a comparative sort (`Array.prototype.sort`) to arrange items chronologically.
- **Time Complexity**: O(n log n).
- **Execution**: The algorithm converts `dateAcquired` string values into numerical Unix timestamps. It computes the difference between values (`timeB - timeA`) to enforce a strict descending order. Youngest items index at zero.

**Age Calculation Algorithm:**
A localized mathematical algorithm calculates the precise age of an item.
- It calculates the absolute difference between the current system execution time and the `dateAcquired` timestamp.
- It applies modulus operations and division constraints to derive seconds, minutes, hours, days, weeks, months, and years.
- A background routine triggers the recalculation every 1000 milliseconds to simulate real-time processing.

## System Architecture

- **Frontend**: Next.js 15 (React). Utilizes virtual DOM structures for efficient rendering.
- **Backend API**: Next.js Serverless Route Handlers. Acts as the controller for database operations.
- **Database**: MongoDB Atlas. Provides persistent, remote NoSQL storage.
- **Connection Management**: Implements a singleton design pattern. The connection is cached in a global variable to prevent memory leaks and connection exhaustion during active development cycles.

## Deployment and Execution

### Local Environment Setup
1. Clone the repository to the local machine.
2. Execute `npm install` to resolve and install package dependencies.
3. Configure the `.env.local` file with the following required environment variables:
   - `MONGODB_URI`: Valid MongoDB connection string.
   - `AUTH_SECRET`: Cryptographic secret for session security.
4. Execute `npm run dev` to initialize the local development server.

### Production Deployment
The system is optimized for Vercel deployment. It requires standard Vercel environment variable configuration and the addition of `AUTH_TRUST_HOST=true` to validate internal authentication requests.

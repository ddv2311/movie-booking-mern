# Movie Booking Website

This project is a full-stack movie booking website with the frontend built using React and the backend using Node.js and Express. Users can browse available movies, view details, and book tickets.

## Folder Structure

- **Client (React part)**: Handles the frontend of the application.
- **Server (Backend part)**: Manages the API and database interactions.

## Technologies Used

- **Frontend**: React, JavaScript, HTML, CSS
- **Backend**: Node.js, Express, MongoDB (or another database)
- **Other Tools**: npm, Git, Postman (for API testing)

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or above)
- [npm](https://www.npmjs.com/get-npm)
- MongoDB (local installation or remote like MongoDB Atlas)

## Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/movie-booking-website.git
cd movie-booking-website
```
### 2. Backend Setup (Server)
-Navigate to the server directory:
```bash
cd server
```
-Install backend dependencies:
```bash
npm install
```
-Create a .env file in the server directory with the following environment variables:
```bash
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```
-Start the backend server
```bash
npm start
```
## 3. Frontend Setup (Client)
-Navigate to the client directory:
```bash
cd ../client
```
-Install backend dependencies:
```bash
npm install
```
-Start react app
```bash
npm run dev
```

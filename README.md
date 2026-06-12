# Echos Admin Portal: Logistics Dashboard

This is the companion internal application for the **Echos Time Capsule** project. It serves as a secure, private logistics dashboard for administrative staff to manage, track, and verify time capsule deliveries.

## Features
- **Secure Authentication**: Protected by JWT (JSON Web Tokens). Only authorized logistics personnel can log in.
- **Capsule Tracking Grid**: A comprehensive dashboard that fetches all pending and delivered capsules from the central Echos MongoDB database.
- **Digital Paper Viewer**: An elegant, dynamic UI overlay that allows staff to read the user's letter exactly as the recipient will see it, mimicking physical stationary.
- **Encrypted Media Access**: Authorized staff can securely download the bundled `.zip` payload directly from the database using a protected API stream.
- **Physical Delivery Management**: Allows staff to review physical shipping addresses for "Physical Delivery" capsules to ensure they are mailed correctly.

## Tech Stack
- **Frontend Framework**: React (Vite)
- **Styling**: Vanilla CSS with custom animations and dynamic theming
- **HTTP Client**: Axios

## Environment Variables
To run this application, you must provide the following `.env` variable:
```env
VITE_API_URL=your_public_backend_url
```

## Running Locally
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to boot up the Vite development server.
4. Ensure your Echos backend server is also running locally so the dashboard can fetch the data.

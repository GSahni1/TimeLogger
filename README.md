# TimeLogger

TimeLogger is a productivity-focused time tracking application designed to help users log activities, monitor daily habits, and improve time management.

## Features

- **User Authentication**: Secure Sign Up and Login functionality using bcrypt and JWT with a short lived access token and a relatively longer lived refresh token.
- **Dashboard**: dashboard for logging and viewing time entries.(adding data visualization is on horizon)
- **Responsive Interface**: Clean and accessible UI built with vanilla CSS.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ```

4. Start the Application:
   ```bash
   npm start
   ```

5. Access the App:
   Open your browser and visit `http://localhost:3000`

## License
ISC

## JS syntax type
Common JS

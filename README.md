# pdf-merger-app

A full-stack web application where users can register, log in, upload PDF files, and merge them. Files are stored in AWS S3 and user data is managed with MongoDB.


## Features

- User registration & authentication (JWT)
- Upload and store PDFs securely on AWS S3
- Merge multiple PDFs into one
- View uploaded files in a dashboard

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **File Storage**: AWS S3
- **PDF Processing**: pdf-lib
- **Authentication**: bcryptjs, jsonwebtoken

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/johnquevedo/pdf-merger-app.git
   cd pdf-merger-app

2. Create a .env file in server/ with:
   ```bash
   SECRET=your_jwt_secret
   CONNECTION_STRING=your_mongodb_connection_string
   KEY=your_aws_access_key
   SECRET_KEY=your_aws_secret_key
   BUCKET_NAME=your_s3_bucket_name
  
3. Install backend dependencies and start the server:
   ```bash
   cd server
   npm install
   node server.js

## Notes
- Make sure `.env`, `node_modules/`, and `upload/` are in `.gitignore`
- Never commit secrets or credentials

## License
MIT


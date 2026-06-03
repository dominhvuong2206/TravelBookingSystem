# Deployment Guide

## Backend on Railway

1. Push this repository to GitHub.
2. In Railway, create a new project from the GitHub repository.
3. Set the Railway service root directory to:

```text
travel-booking-backend
```

4. Add a MySQL database service in the same Railway project.
5. Add these variables to the backend service:

```text
FRONTEND_URL=https://your-s3-or-cloudfront-url
BACKEND_URL=https://your-backend.up.railway.app/TravelBookingSystem
CORS_ALLOWED_ORIGINS=https://your-s3-or-cloudfront-url

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

STRIPE_SECRET_KEY=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
ZALOPAY_KEY1=...
ZALOPAY_KEY2=...
```

Railway MySQL usually provides these automatically:

```text
MYSQLHOST
MYSQLPORT
MYSQLDATABASE
MYSQLUSER
MYSQLPASSWORD
```

6. Import the SQL files into Railway MySQL:

```bash
mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -p MYSQLDATABASE < travelbookingdb.sql
mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -p MYSQLDATABASE < seed-travel-sample-data.sql
```

7. Deploy. The backend API base URL should look like:

```text
https://your-backend.up.railway.app/TravelBookingSystem/api/
```

## Frontend on AWS S3

1. In `travel-booking-frontend`, create `.env.production`:

```text
REACT_APP_API_BASE_URL=https://your-backend.up.railway.app/TravelBookingSystem/api/
```

2. Build:

```bash
cd travel-booking-frontend
npm install
npm run build
```

3. Create an S3 bucket and enable static website hosting.
4. Set both index document and error document to:

```text
index.html
```

5. Upload the contents of `travel-booking-frontend/build` to S3.
6. Update `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` in Railway to the final S3 or CloudFront URL.

## Security note

Payment and Cloudinary keys that were previously committed should be rotated before production deployment.

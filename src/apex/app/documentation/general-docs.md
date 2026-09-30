# Addin new tab for the Apex 2.0 data set
1. add new text into texts.ts for a Navigation label:
```
const navbarTexts = {
    brandName: "ApexSearch",
    menuItems: {
        home: "Home",
   >>>  apexDb2: "NEW ApexDB", <<<
        apexDb: "ApexDB",
        stats: "ApexDB Stats",
        publications: "Publications",
        about: "The Lab",
    }
}
```
2. go to NavBar.tsx and add a new link.
```
{path: "/database/apex-db-2", title: navbarTexts.menuItems.apexDb2},
```
3. Copy  new dataset csv to the "public" directory (e.g. apex2.csv)
4. Add new dataset into datasets.ts definition file. The name of the dataset should match the path you have specified in the step 2 (navbar link).
```
  {
    name: 'apex-db-2',
    filePath: '/apex2.csv',
  }
```
you're good to go!


# Changing email provider

## Overview
This document describes how to change the email provider from DuoCircle (currently configured as `outbound.mailhop.org`) to an in-house email solution.

## Current Configuration
The application currently uses DuoCircle as the email provider with the following configuration:
- **Host**: `outbound.mailhop.org`
- **Port**: 465 (SSL)
- **Authentication**: username and password provided via environment variables
- **Security**: SSL/TLS enabled

## Steps to Change to In-House Email Provider

### 1. Quick Solution: Register for DuoCircle and Acquire API Key
If you need email functionality working immediately, you can register for a DuoCircle account and acquire their API key:
1. Visit [DuoCircle's website](https://duocircle.com) and sign up for an account (free up to 1000 emails per month)
2. Navigate to their API/SMTP settings section
3. Generate a new API key for SMTP authentication
4. Update your environment variables with the new API key
5. Test. email functionality

### 2. Backend Configuration Changes

#### Update Environment Variables
Replace the `EMAIL_PROVIDER_PASSWORD` and `EMAIL_PROVIDER_USERNAME` with in-house email server credentials:

```bash
# Old DuoCircle configuration
EMAIL_PROVIDER_USERNAME=upennduocircle
EMAIL_PROVIDER_PASSWORD=qweqwqweqwe

# New in-house configuration
EMAIL_HOST=your-smtp-server.internal
EMAIL_PORT=587
EMAIL_USERNAME=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=no-reply@yourdomain.internal
```

#### Modify Email Service
Update `backend/src/services/email-service.ts`:

```typescript
// Replace the sendEmail function configuration
async function sendEmail(message: Mail.Options) {
    const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || "your-smtp-server.internal",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: false, // Set to true if using port 465 with SSL
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER || "your-email-user",
            pass: process.env.EMAIL_PASSWORD || "your-email-password",
        },
        tls: {
            rejectUnauthorized: false // Only if using self-signed certificates
        }
    });

    // ... rest of the function remains the same
}
```

### 3. Environment Configuration

#### Backend (.env file)
```bash
# Email Configuration
EMAIL_HOST=your-smtp-server.internal
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=no-reply@yourdomain.internal

# Remove or comment out the old DuoCircle variables
```
### 4. Deployment Considerations

#### Backend Deployment
1. Update the `.env` file on the production server
2. Restart the backend service: `sudo /sbin/service api-backend restart`
3. Verify email functionality in production

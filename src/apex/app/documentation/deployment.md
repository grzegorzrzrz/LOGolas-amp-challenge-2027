# Build and Deployment instructions:

## Build Instructions

### Frontend Build
```bash
cd frontend
npm install
npm run build
```
This creates a `dist` folder with optimized production files.

### Backend Build
```bash
cd backend
npm install
npm run build
```
This creates a `dist` folder with compiled TypeScript files.

### Testing
```bash
cd backend
npm run test
```

## Deployment instructions
### Backend

1. Build the backend locally
2. Copy to apex1 server:
 ```bash
   # Copy build files
   scp -r backend/dist/* user@apex1:/data/nodeapp/backend/dist/

   # if you changed package.json, Copy package.json and install production dependencies
   scp -r backend/package.json user@apex1:/data/nodeapp/backend/
   ssh user@apex1
   sudo -iu s_apexgpu #important!
   cd /data/nodeapp/backend
   npm install
   ```
3. Make sure there's .env file in /data/nodeapp/backend/
   If it doesn't exist, create it. Example contents of this file ara arailable at .env.example
4. If you did prisma migrations, apply them:
```bash
   ssh user@apex1
   sudo -iu s_apexgpu #important!
   cd /data/nodeapp/backend
   npm run prisma:migrate
   npm run prisma:generate
```
5. Restart the systemd service:
```bash
   ssh user@apex1
   sudo /sbin/service api-backend restart
```


### Frontend
NOTE: as of writing this, the frontend is not set up to be deployed to apex1.

1. Build the frontend locally:
2. Copy to apex1 server:
```bash
   # Option 1: Using scp
   scp -r frontend/dist/* user@apex1:/data/nodeapp/frontend/dist/
   
   # Option 3: Manual copy via SFTP/FileZilla
   # Copy contents of frontend/dist/ to /data/nodeapp/frontend/dist
```
3. Restart the systemd service:
```bash
   ssh user@apex1
   sudo /sbin/service api-backend restart
```


## Configuration
The app in configured via Environment variables.

Frontend project varaibles:
VITE_BACKEND_BASE_URL=http://localhost:10000  -  this is the base url for the backend api. It is NOT used in production as both frontend and backend are hosted under the same host. Only required if you want to run frontend manually on a different host (happens in development)

Backend project variables. Check .env.example to see how they look like.
DATABASE_URL="file:../jobs.db" - this is the path to the database file.
EMAIL_PROVIDER_USERNAME=upennduocircle - username for the email provider api (currently duocircle).
EMAIL_PROVIDER_PASSWORD=qweqwqweqwe - this is the api key for the email provider api (currently duocircle).
LSF_CLUSTER_BASE_PATH=H:\Projects\anne\upenn\backend\src\tests\test-files - this is the path to the lsf cluster. It is used to determine file paths for input and output files
FILE_CLEANUP_PERIOD_DAYS=7 - this is the number of days after which the files will be deleted.
RATE_LIMIT_MAX_REQUESTS=100 - this is the maximum number of requests allowed in 24 hours per IP address.


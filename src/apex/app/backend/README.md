# LSF Job Scheduling Backend

This backend provides an API for scheduling LSF jobs, tracking their status, and notifying users when jobs are completed.

## Features

- Submit jobs to IBM LSF
- Track job status
- Retrieve job results
- Email notifications for completed jobs

## Environment Setup

The application supports two modes:

1. **Mock LSF mode** (for local development and testing)
2. **Real LSF mode** (for production environment with actual LSF access)

### Environment Variables

- `DATABASE_URL`: Database URL in format "file:/path/to/database.db"
- `EMAIL_PROVIDER_USERNAME`: username for the email provider api (currently duocircle).
- `EMAIL_PROVIDER_PASSWORD`: password for the email provider api (currently duocircle).
- `LSF_CLUSTER_BASE_PATH`: Path to the lsf cluster. It is used to determine file paths for input and output files
- `FILE_CLEANUP_PERIOD_DAYS`: Number of days after which the files will be deleted.
- `RATE_LIMIT_MAX_REQUESTS`: Maximum number of requests per IP address in 24 hours (defaults to 100)
- `PORT`: Server port (defaults to 10000)

## Installation

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Create a database file
npx prisma migrate deploy
npx prisma generate
 
# Run the server
npm start

# Run in development mode
npm run dev

# Run tests
npm test
```

## Running the systemd service in production:
sudo /sbin/service api-backend start

## Mock Mode vs Real Mode

In mock mode, the application simulates LSF job execution. This is useful for local development and testing without requiring actual access to an LSF cluster.

In real mode, the application communicates with a real LSF cluster using commands like `bsub` and `bjobs`.

The switch between modes is done in the `src/services/LSF-service.ts` file. find the following line: 

```typescript
const useMockLsf = false;
```

## API Endpoints

### Submit a Sequence text
```
POST /sequence/submit-text
```

**Request Body:**

```form-data
  "text": "fasta-text",
  "email": "user@example.com" // Optional
```

**Response:**

```json
{
	"jobId": "1459eed8-800e-4d86-aea9-535980180b3c",
	"status": "pending",
	"message": "Sequence file submitted successfully"
}
```

### Submit a Sequence File
```
POST /sequence/submit-file
```

**Request Body:**

```form-data
  "files": file-attachment
  "email": "user@example.com" // Optional
```

**Response:**

```json
{
	"jobId": "1459eed8-800e-4d86-aea9-535980180b3c",
	"status": "pending",
	"message": "Sequence file submitted successfully"
}
```

### Check Job status
```
GET /sequence/{jobId}
```
**Response:**

```json
{
	"jobId": "ed6a1429-ea00-447b-b653-dcb082e800b7",
	"status": "completed"
}
```
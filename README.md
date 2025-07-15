Locker Management System

Backend
- TypeScript
- Serverless Framework
- PostgreSQL
- Prisma ORM

Frontend
- React + TypeScript

1. Setup
  - Clone the repository
  - cd LockerManagementSystem

2. Backend
  - cd backend
  - npm install
  - create .env file and follow below sample:
    PGHOST=localhost
    PGUSER=your_db_user
    PGPASSWORD=your_db_password
    PGDATABASE=your_db_name
    PGPORT=5432

    DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/your_db_name
  - npx prisma migrate deploy
  - npx ts-node prisma/seed.ts
  - npx ts-node prisma/seedSuperAdmin.ts
  - npm run dev (Start backend)

3. Frontend
  - cd frontend
  - npm install
  - npm start
  - Use superadmin@example.com as email, superadmin123 as password for login

API Overview
- POST: /dev/auth/login {"divisionPass": string} // Both Investigator and Case Store Officer login
- POST: /dev/deposit/start {"divisionPass": string, "seizureReportNumber": string, "lockerNumber": int} // Start a deposit
- POST: /dev/deposit/upload-image {"depositId": string, "frontImageUrl": string, "backImageUrl": string} // Upload image url of deposit
- POST: /dev/deposit/acknowledge {"depositId": string, "itemDescription": string, "signatureData": string} // Upload item description and base64 signature string of deposit, sends email to Case Store Officer (email output in terminal)
- POST: /dev/deposit/complete {"depositId": string,"csoDivisionPass": string} // Notify Case Store Officer to retrieve deposit

- POST: /dev/withdrawal/start {"divisionPass": string, "seizureReportNumber": string, "investigatorDivisionPass": string, "lockerNumber": int} // Start a withdrawal
- POST: /dev/withdrawal/upload-image {"withdrawalId": string, "frontImageUrl": string, "backImageUrl": string} // Upload image url of withdrawal
- POST: /dev/withdrawal/notify-investigator {"investigatorDivisionPass": string, "seizureReportNumber": string, "lockerNumber": int} // Sends email to notify Investigator to retrieve withdrawal (email output in terminal)

- POST: /dev/auth/loginWithOtp {"divisionPass": string} // Investigator request for login with OTP (OTP output in terminal)
- POST: /dev/auth/verifyOtp {"divisionPass": string, "otpOrQRCode": string, "lockerNumber": int} // Investigator verifies with OTP and access notified locker
- POST: /dev/withdrawal/retrieve {"withdrawalId": string, "signatureData": string, "frontImageUrl": string, "backImageUrl": string} // Investigator uploads image and base64 string signature and retrieves withdrawl, sends email to Investigator and Case Store Officer (email output in terminal)

- GET: /dev/activity/activityLog // List of acitivity logs
- POST: /dev/auth/superAdminLogin {"email": string, "password": string} // Frontend login

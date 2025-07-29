Smart Locker System

Frontend
- TypeScript
- React

Backend
- TypeScript
- Node.js
- PostgreSQL
- Prisma ORM
- Serverless Framework

Backend Setup:
1. git clone https://github.com/Amos9982/LockerManagementSystem.git
2. cd LockerManagementSystem
3. cd backend
4. npm install
5. Create .env file in /backend with below template

PGHOST=localhost
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=your_database_name
PGPORT=5432

DATABASE_URL="postgresql://your_postgres_user:your_postgres_password@localhost:5432/your_database_name"

5. npx prisma migrate deploy
6. npx prisma/seed.ts
7. npx prisma/seedSuperAdmin.ts
8. npm run dev

Frontend Setup
1. cd LockerManagementSystem
2. cd frontend
3. npm install
4. npm start
5. Login with
   email: superadmin@example.com
   password: superadmin123 

API:
- POST /dev/auth/login {"divisionPass": string}
- POST /dev/deposit/start {"divisionPass": string, "seizureReportNumber": string, "lockerNumber": int}
- POST /dev/deposit/upload-image {"depositId": string, "frontImageUrl": string, "backImageUrl": string}
- POST /dev/deposit/acknowledge {"depositId": string, "itemDescription": string, "signatureData": string}
- POST /dev/deposit/complete {"depositId": string, "csoDivisionPass": string}
- POST /dev/withdrawal/start {"divisionPass": string, "seizureReportNumber": string, "lockerNumber": int}
- POST /dev/withdrawal/upload-image {"withdrawalId": string, "frontImageUrl": string, "backImageUrl": string}
- POST /dev/withdrawal/notify-investigator {"seizureReportNumber": string, "lockerNumber": int}
- POST /dev/auth/loginWithOtp {"divisionPass": string}
- POST /dev/auth/verifyOtp {"divisionPass": string,"otpOrQRCode": string,"lockerNumber": int}
- POST /dev/withdrawal/retrieve {"withdrawalId": string, "signatureData": string, "frontImageUrl": string, "backImageUrl": string}

- GET /dev/activity/activityLog
- POST /dev/auth/superAdminLogin {"email": string, "password": string}


System Diagram

![Deposit](./Deposit.png)
![Withdrawal(1)](<./Withdrawal (1).png>)
![Withdrawal(2)](<./Withdrawal (2).png>)


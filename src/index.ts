import express, { NextFunction, Request, Response, Router } from 'express';
import { envConfig } from '@src/config/env';
import { connectMongoDB } from '@src/connect/mongodb';
import { UserRoutes } from '@src/routes/users/users.route';
import { AuthRoutes } from './routes/auth/auth.route';
import { updateDB } from './service/updateDB.service';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = envConfig.PORT;

app.use(
  cors({
    origin: true, // Cho phép mọi origin
    credentials: true, // Cho phép gửi cookie
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Info'],
  }),
);
// connect mongodb
connectMongoDB(envConfig.DB_MONGO_URL);

app.use(express.json());
app.use(morgan('dev'));

// khai báo các route
const authRouter = Router();
const AUTH_ROUTES: Router[] = [UserRoutes, AuthRoutes];
AUTH_ROUTES.forEach((route) => authRouter.use(route));
app.use('/api/v1', authRouter);

// update DB
// updateDB();
// start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

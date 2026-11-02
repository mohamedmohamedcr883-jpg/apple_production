import type { Express, NextFunction, Request, Response } from 'express';
import userController from './modules/user/user.controller';
import cors from 'cors';
import transactionController from './modules/transaction/transaction.controller';
import productController from './modules/product/product.controller';
import adminController from './modules/admin/admin.controller';
import { AppError } from './utils/common/Error';
import { devConfig } from './config/dev.env';
import path from 'path';

const configuredOrigins = devConfig.CLIENT_URL
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...configuredOrigins,
]);

function isAllowedOrigin(origin?: string) {
    if (!origin) return true;
    if (configuredOrigins.includes('*')) return true;
    if (allowedOrigins.has(origin)) return true;

    try {
        const { hostname } = new URL(origin);
        return hostname.endsWith('.vercel.app');
    } catch {
        return false;
    }
}

export function bootstrap(app: Express, express: any) {
    app.use(express.json());
    app.use(cors({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
    }));

    app.get('/', (req: Request, res: Response) => {
        res.status(200).json({
            message: 'Apple Store API is running',
            health: '/health',
        });
    });

    // Health check for Render keep-alive
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).send('OK');
    });

    // Serve the uploads directory statically
    app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

    app.use('/user', userController);
    app.use('/transaction', transactionController);
    app.use('/product', productController);
    app.use('/admin', adminController);
    app.use((error: AppError, req: Request, res: Response, next: NextFunction) => {
        if (!error) {
            next();
        }
        const isProduction = process.env.NODE_ENV === 'production';
        res.status(error.statusCode || 500).json({
            message: error.message,
            errorDetails: error.errorDetails,
            ...(isProduction ? {} : { stack: error.stack })
        });
    })
    app.use("/:dummy", (req: Request, res: Response, next: NextFunction) => {
        res.status(404).json({ message: "invalid url" })
    })
}

import express, { Request, Response } from 'express';
import cors from 'cors';

// Import routes
import dashboardRoutes from './routes/dashboard.js';
import eventsRoutes from './routes/events.js';
import teamsRoutes from './routes/teams.js';
import personalRecordsRoutes from './routes/personal-records.js';
import usersRoutes from './routes/users.js';
import sportsCategoriesRoutes from './routes/sports-categories.js';
import eventRegistrationsRoutes from './routes/event-registrations.js';
import filesRoutes from './routes/files.js';
import notificationsRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend API is running' });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/personal-records', personalRecordsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sports-categories', sportsCategoriesRoutes);
app.use('/api/event-registrations', eventRegistrationsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/dashboard');
  console.log('  GET  /api/events');
  console.log('  POST /api/events');
  console.log('  GET  /api/events/:id');
  console.log('  PUT  /api/events/:id');
  console.log('  DELETE /api/events/:id');
  console.log('  POST /api/events/:id/register');
  console.log('  GET  /api/teams');
  console.log('  POST /api/teams');
  console.log('  GET  /api/teams/my-teams');
  console.log('  GET  /api/teams/:id');
  console.log('  PUT  /api/teams/:id');
  console.log('  DELETE /api/teams/:id');
  console.log('  POST /api/teams/:id/join');
  console.log('  DELETE /api/teams/:id/leave');
  console.log('  DELETE /api/teams/:id/members');
  console.log('  GET  /api/personal-records');
  console.log('  POST /api/personal-records');
  console.log('  DELETE /api/personal-records');
  console.log('  GET  /api/users');
  console.log('  PUT  /api/users');
  console.log('  GET  /api/sports-categories');
  console.log('  GET  /api/event-registrations');
  console.log('  POST /api/event-registrations');
  console.log('  POST /api/files/upload');
  console.log('  GET  /api/notifications');
  console.log('  POST /api/notifications');
  console.log('  PATCH /api/notifications');
  console.log('  DELETE /api/notifications');
});

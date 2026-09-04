import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import schedulesRoutes from './routes/schedulesRoutes.js';
import roomsRoutes from './routes/roomsRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import announcementsRoutes from './routes/announcementsRoutes.js';
import assignmentsRoutes from './routes/assignmentsRoutes.js';
import { ErrorHandler } from './components/errorHandler.js';
import { HttpError, fromPrisma } from './components/errors.js';
import { asyncHandler } from './components/asyncHandler.js';

const app = express();
app.use(cors());
app.use(express.json());

// RETURNS A BASIC HEALTH CHECK RESPONSE
app.get('/api/health', asyncHandler(async (_req, res) => {
  const { SuccessHandler } = await import('./components/successHandler.js');
  SuccessHandler({ ok: true, time: new Date().toISOString() }, res, 200, 'Service is healthy');
}));

app.use('/api/schedules', schedulesRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/assignments', assignmentsRoutes);

// CONVERTS THROWN ERRORS INTO THE STANDARD JSON ENVELOPE
app.use((err, req, res, _next) => {
  let mapped = err;
  if (err instanceof HttpError) {
    mapped = err; // already shaped
  } else if (err?.code?.startsWith?.('P')) {
    mapped = fromPrisma(err);
  }
  const status = mapped?.status || 500;
  ErrorHandler(mapped, res, status, 'Internal server error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CampusOS backend on http://localhost:${PORT}`));
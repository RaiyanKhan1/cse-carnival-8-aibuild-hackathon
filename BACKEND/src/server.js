import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import schedulesRoutes from './routes/schedulesRoutes.js';
import roomsRoutes from './routes/roomsRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import announcementsRoutes from './routes/announcementsRoutes.js';
import assignmentsRoutes from './routes/assignmentsRoutes.js';
import { errorHandler } from './components/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/schedules', schedulesRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/assignments', assignmentsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CampusOS backend on http://localhost:${PORT}`));
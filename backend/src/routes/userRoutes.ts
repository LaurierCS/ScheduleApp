import express from 'express';
import { UserRole } from '../models/UserRole';
import authorize from '../middleware/roleMiddleware';
const router = express.Router();

// admin-only: manage teams, users
router.post('/teams', authorize([UserRole.ADMIN]), (req, res) => {
  res.json({ message: 'Team created successfully' });
});
// interviewer and candidate: submit availability
router.post('/availability', authorize([UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
  res.json({ message: 'Availability submitted' });
});

// interviewer & candidate: view assigned meetings
router.get('/meetings', authorize([UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
  res.json({ message: 'Here are your assigned meetings' });
});

export default router;

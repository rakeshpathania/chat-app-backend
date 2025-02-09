

import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.post('/addmsg', messageController.addMessage);

router.post('/getmsg', messageController.getMessages);







export const MessageRoute = router;

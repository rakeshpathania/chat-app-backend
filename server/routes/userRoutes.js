

import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

router.post('/register', userController.create);
router.post('/login', userController.login);
router.post("/setavatar/:id", userController.setAvatar);
router.get("/allusers/:id", userController.getAllUsers);
router.get("/logout/:id", userController.logOut);







export const UserRoutes = router;

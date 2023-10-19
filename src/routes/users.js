import express from 'express';
import {
    getUsersController,
    registerUsersController,
    loginUsersController,
    socialLoginController,
    updateUsersController,
    deleteUsersController
} from '../controllers/usersController.js';
const usersRouter = express.Router();

usersRouter.get("/", getUsersController);
usersRouter.post("/register", registerUsersController);
usersRouter.post("/login", loginUsersController);
usersRouter.get("/auth/:provider", socialLoginController);
usersRouter.put("/:id", updateUsersController);
usersRouter.delete("/:id", deleteUsersController);

export default usersRouter;
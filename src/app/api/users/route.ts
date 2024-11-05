import usersController from '@/lib/controllers/users.controller';
import { errorHandler } from '@/lib/services/api.service';

export const GET = errorHandler(usersController.getUsers)

export const POST = errorHandler(usersController.createUser)
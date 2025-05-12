import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { sendResponse, parseRequestBody, validateUserData, extractUserId } from './utils';

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

let users: User[] = [];

export async function getAllUsers(_req: IncomingMessage, res: ServerResponse) {
  sendResponse(res, 200, users);
}

export async function getUserById(req: IncomingMessage, res: ServerResponse) {
  const userId = extractUserId(req.url);

  if (!userId || !validateUuid(userId)) {
    return sendResponse(res, 400, { message: 'Invalid userId format (must be UUID)' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return sendResponse(res, 404, { message: 'User not found' });
  }

  sendResponse(res, 200, user);
}

export async function createUser(req: IncomingMessage, res: ServerResponse) {
  const body = await parseRequestBody(req);
  const validation = validateUserData(body);

  if (!validation.valid) {
    return sendResponse(res, 400, { message: validation.message });
  }

  const newUser: User = {
    id: uuidv4(),
    username: body.username,
    age: body.age,
    hobbies: body.hobbies || [],
  };

  users.push(newUser);
  sendResponse(res, 201, newUser);
}

export async function updateUser(req: IncomingMessage, res: ServerResponse) {
  const userId = extractUserId(req.url);

  if (!userId || !validateUuid(userId)) {
    return sendResponse(res, 400, { message: 'Invalid userId format (must be UUID)' });
  }

  const body = await parseRequestBody(req);
  const validation = validateUserData(body);

  if (!validation.valid) {
    return sendResponse(res, 400, { message: validation.message });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return sendResponse(res, 404, { message: 'User not found' });
  }

  const updatedUser: User = {
    id: userId,
    username: body.username,
    age: body.age,
    hobbies: body.hobbies || [],
  };

  users[userIndex] = updatedUser;
  sendResponse(res, 200, updatedUser);
}

export async function deleteUser(req: IncomingMessage, res: ServerResponse) {
  const userId = extractUserId(req.url);

  if (!userId || !validateUuid(userId)) {
    return sendResponse(res, 400, { message: 'Invalid userId format (must be UUID)' });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return sendResponse(res, 404, { message: 'User not found' });
  }

  users.splice(userIndex, 1);
  sendResponse(res, 204, { message: 'User delete successful' });
}

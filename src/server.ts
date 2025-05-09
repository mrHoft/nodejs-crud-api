import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import { sendResponse } from './utils';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './api';

const BASE_URL = '/api/users';

export const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { url, method } = req;

    if (url === BASE_URL && method === 'GET') {
      await getAllUsers(req, res);
    } else if (url?.startsWith(`${BASE_URL}/`) && method === 'GET') {
      await getUserById(req, res);
    } else if (url === BASE_URL && method === 'POST') {
      await createUser(req, res);
    } else if (url?.startsWith(`${BASE_URL}/`) && method === 'PUT') {
      await updateUser(req, res);
    } else if (url?.startsWith(`${BASE_URL}/`) && method === 'DELETE') {
      await deleteUser(req, res);
    } else {
      sendResponse(res, 404, { message: 'Endpoint not found' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : err;
    console.log(err);
    sendResponse(res, 500, { message });
  }
});

export function createAppServer(port: number): Server {
  return server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

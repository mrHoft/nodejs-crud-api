import { createServer } from 'http';
import request from 'supertest';
import { server } from './server';

describe('CRUD API Tests', () => {
  let testServer: ReturnType<typeof request.agent>;

  beforeAll(() => {
    const httpServer = createServer((req, res) => {
      server.emit('request', req, res);
    });
    testServer = request(httpServer);
  });

  describe('Scenario: Full CRUD cycle', () => {
    it('GET /api/users should return empty array initially', async () => {
      const response = await testServer.get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('POST /api/users should create a new user', async () => {
      const newUser = {
        username: 'Test User',
        age: 25,
        hobbies: ['reading', 'coding'],
      };

      const response = await testServer.post('/api/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newUser);
      expect(response.body.id).toBeDefined();
      expect(typeof response.body.id).toBe('string');
    });

    it('GET /api/users/{userId} should return the created user', async () => {
      const newUser = {
        username: 'Test User',
        age: 25,
        hobbies: ['reading', 'coding'],
      };
      const createResponse = await testServer.post('/api/users').send(newUser);
      const userId = createResponse.body.id;

      const response = await testServer.get(`/api/users/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(createResponse.body);
    });

    it('PUT /api/users/{userId} should update the user', async () => {
      const newUser = {
        username: 'Test User',
        age: 25,
        hobbies: ['reading', 'coding'],
      };
      const createResponse = await testServer.post('/api/users').send(newUser);
      const userId = createResponse.body.id;

      const updatedUser = {
        username: 'Updated User',
        age: 26,
        hobbies: ['swimming'],
      };

      const response = await testServer.put(`/api/users/${userId}`).send(updatedUser);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body).toMatchObject(updatedUser);
    });

    it('DELETE /api/users/{userId} should delete the user', async () => {
      const newUser = {
        username: 'Test User',
        age: 25,
        hobbies: ['reading', 'coding'],
      };
      const createResponse = await testServer.post('/api/users').send(newUser);
      const userId = createResponse.body.id;

      const deleteResponse = await testServer.delete(`/api/users/${userId}`);
      expect(deleteResponse.status).toBe(204);

      const getResponse = await testServer.get(`/api/users/${userId}`);
      expect(getResponse.status).toBe(404);
    });

    it('GET /api/users/{userId} should return 404 after deletion', async () => {
      const newUser = {
        username: 'Test User',
        age: 25,
        hobbies: ['reading', 'coding'],
      };
      const createResponse = await testServer.post('/api/users').send(newUser);
      const userId = createResponse.body.id;
      await testServer.delete(`/api/users/${userId}`);

      const response = await testServer.get(`/api/users/${userId}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Error Handling Tests', () => {
    it('GET /api/users/{invalidId} should return 400 for invalid UUID', async () => {
      const response = await testServer.get('/api/users/123');
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid userId format');
    });

    it('POST /api/users should return 400 for missing required fields', async () => {
      const invalidUser = { username: 'Test' };
      const response = await testServer.post('/api/users').send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Missing required fields');
    });

    it('PUT /api/users/{nonexistentId} should return 404', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await testServer
        .put(`/api/users/${nonExistentId}`)
        .send({ username: 'Test', age: 25, hobbies: [] });
      expect(response.status).toBe(404);
    });

    it('DELETE /api/users/{nonexistentId} should return 404', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await testServer.delete(`/api/users/${nonExistentId}`);
      expect(response.status).toBe(404);
    });

    it('GET /nonexistent/route should return 404', async () => {
      const response = await testServer.get('/nonexistent/route');
      expect(response.status).toBe(404);
    });
  });
});

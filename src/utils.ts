import { IncomingMessage, ServerResponse } from 'http';

export function sendResponse(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export async function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function validateUserData(userData: any): { valid: boolean; message?: string } {
  if (!userData.username || !userData.age || !userData.hobbies) {
    return { valid: false, message: 'Missing required fields: username, age, and hobbies are required' };
  }

  if (typeof userData.username !== 'string' || typeof userData.age !== 'number' || !Array.isArray(userData.hobbies)) {
    return {
      valid: false,
      message: 'Invalid field types: username must be string, age must be number, hobbies must be array',
    };
  }

  return { valid: true };
}

export function extractUserId(url: string | undefined): string | null {
  if (!url) return null;
  const parts = url.split('/');
  return parts[3] || null;
}

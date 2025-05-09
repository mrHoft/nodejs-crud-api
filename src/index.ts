import { createAppServer } from './server';

const PORT = Number(process.env.PORT || 3000);

createAppServer(PORT);

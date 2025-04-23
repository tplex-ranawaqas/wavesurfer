import fs from 'fs';
import path from 'path';
import Cors from 'cors';
import initMiddleware from '../../lib/init-middleware';

const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: '*', // or specific domains like "https://yourdomain.com"
  })
);

export const config = {
  api: {
    bodyParser: false, // We’ll handle raw buffer
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or specify domains instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  await cors(req, res); // Enable CORS for this request

  if (req.method !== 'POST') return res.status(405).end();

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const filename = 'recording.webm'; // or .wav/.mp3 if converting

  const downloadPath = path.join(process.cwd(), 'downloads', filename);
  fs.writeFileSync(downloadPath, buffer);

  res.status(200).json({ message: 'Saved successfully' });
}

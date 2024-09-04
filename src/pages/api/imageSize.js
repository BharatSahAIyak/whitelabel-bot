import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import sizeOf from 'image-size';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    if (!files.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const file = files.file[0];
    const buffer = await fs.readFile(file.filepath);
    const dimensions = sizeOf(buffer);

    return res.status(200).json(dimensions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to calculate dimensions' });
  }
}

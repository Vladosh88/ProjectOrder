const { Router } = require('express');
const cloudinary = require('cloudinary').v2;

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/', (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      folder: 'photo-orders',
    };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'photo-orders',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
});

module.exports = router;

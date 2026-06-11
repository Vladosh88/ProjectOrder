const { Router } = require('express');
const jwt = require('jsonwebtoken');

const router = Router();

router.post('/', (req, res) => {
  const { login, password } = req.body;

  if (login === process.env.AUTH_LOGIN && password === process.env.AUTH_PASSWORD) {
    const token = jwt.sign({ user: login }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;

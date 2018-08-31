const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json('api server is working.');
});

module.exports = router;

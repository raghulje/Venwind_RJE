
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/products_cms');

router.get('/hero', ctrl.hero.get);
router.put('/hero', ctrl.hero.upsert);

module.exports = router;

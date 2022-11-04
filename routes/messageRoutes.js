const express = require('express');
const { allMessages, sendMessage } = require('../controllers/messageControllers');
const router = express.Router()
const { protect } = require('../midellware/authMiddileware')
 
router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

module.exports= router
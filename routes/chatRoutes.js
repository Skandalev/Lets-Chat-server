const express = require('express')
const router = express.Router()
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup } = require('../controllers/chatControllers')

const { protect } = require('../midellware/authMiddileware')

router.route('/').post(protect,accessChat)
router.route('/').get(protect,fetchChats)
router.route('/group').post(protect,createGroupChat)
router.route('/rename').put(protect,renameGroup)
router.route('/groupadd').put(protect,addToGroup)
// router.route('/groupmove').put(protect,removeFromGroup)

module.exports= router
import express from 'express'
import * as authController from '../controllers/auth'


const router = express.Router()

router.post('/register', authController.register) // khai báo 1 đường link
router.get('/finalregister/:email/:token', authController.finalRegister)
router.post('/login', authController.login)


export default router
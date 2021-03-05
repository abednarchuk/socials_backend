import { Router } from 'express'

import * as auth from '../controllers/auth.controller'

const router = Router()

router.route('/signup').post(auth.signup)
router.route('/login').post(auth.login)
router.route('/logout').get(auth.protect, auth.logout)
router.route('/getMe').get(auth.protect, auth.getMe)

export default router

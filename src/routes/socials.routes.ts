import * as socials from '../controllers/socials.controller'
import * as auth from '../controllers/auth.controller'

import { Router } from 'express'

const router = Router()

router.get('/:username', socials.getSocials)
router.post('/', auth.protect, socials.updateSocials)

export default router

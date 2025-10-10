import express from 'express'
import { signupPatient, signupDoctor } from '../controllers/signupController.js'
import { login } from '../controllers/loginController.js'
import { refreshTokenHandler } from '../controllers/refreshController.js'
import { logout } from '../controllers/logoutController.js'
import { signupPatientValidators, signupDoctorValidators, loginValidators, refreshValidators, logoutValidators, handleValidation } from '../validators/authValidators.js'

const router = express.Router()

router.post('/signup/patient', signupPatientValidators, handleValidation, signupPatient)
router.post('/signup/doctor', signupDoctorValidators, handleValidation, signupDoctor)
router.post('/login', loginValidators, handleValidation, login)
router.post('/refresh-token', refreshValidators, handleValidation, refreshTokenHandler)
router.post('/logout', logoutValidators, handleValidation, logout)

export default router

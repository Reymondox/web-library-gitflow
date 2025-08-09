import express from 'express'
import { GetLogin, 
    PostLogin, 
    GetRegister, 
    PostRegister, 
    GetLogout,
    GetForgot,
    PostForgot,  
    GetReset,
    PostReset,
    GetActivate
} from '../controllers/AuthController.js'
import isAuthForLogin from '../middlewares/isAuthForLogin.js'

const router = express.Router();

//Auth Routes
router.get('/', isAuthForLogin, GetLogin);
router.post('/', isAuthForLogin, PostLogin);

router.get('/users/register', isAuthForLogin, GetRegister);
router.post('/users/register', isAuthForLogin, PostRegister);

router.get('/users/logout', GetLogout);
router.get('/users/forgot', isAuthForLogin, GetForgot);

router.post('/users/forgot', isAuthForLogin, PostForgot);
router.get('/users/reset/:token', isAuthForLogin, GetReset);

router.post('/users/reset', isAuthForLogin, PostReset);

router.get("/users/activate/:token", isAuthForLogin, GetActivate)
export default router;
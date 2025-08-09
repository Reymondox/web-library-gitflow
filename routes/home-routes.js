import express from 'express'
import { GetHome, PostHome, GetBook  } from '../controllers/HomeController.js'

const router = express.Router();

//Home route
router.get('/index', GetHome);
router.post('/index', PostHome);
router.get('/details/:bookId', GetBook);
export default router;
import express from 'express'
import { 
GetEditorials, 
GetCreate, 
PostCreate, 
GetEdit,
PostEdit,
Delete  } from '../controllers/EditorialsControllers.js'

import isAuth from '../middlewares/isAuth.js'

const router = express.Router();

//Series route
router.get('/index', isAuth, GetEditorials);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth, PostCreate);
router.get('/edit/:editorialId', isAuth, GetEdit);
router.post('/edit', isAuth, PostEdit);
router.post("/delete", isAuth, Delete);




export default router;

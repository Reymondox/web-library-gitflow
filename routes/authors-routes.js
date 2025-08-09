import express from 'express'
import { 
GetAuthors, 
GetCreate, 
PostCreate, 
GetEdit,
PostEdit,
Delete  } from '../controllers/AuthorsController.js'

import isAuth from '../middlewares/isAuth.js'

const router = express.Router();

//Series route
router.get('/index', isAuth, GetAuthors);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth, PostCreate);
router.get('/edit/:authorId', isAuth, GetEdit);
router.post('/edit', isAuth, PostEdit);
router.post("/delete", isAuth, Delete);

export default router;

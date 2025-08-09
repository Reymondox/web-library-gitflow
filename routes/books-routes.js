import express from 'express'
import { 
GetBooks, 
GetCreate, 
PostCreate, 
GetEdit,
PostEdit,
Delete  } from '../controllers/BooksController.js'

import isAuth from '../middlewares/isAuth.js'

const router = express.Router();

//Series route
router.get('/index', isAuth, GetBooks);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth, PostCreate);
router.get('/edit/:bookId', isAuth, GetEdit);
router.post('/edit', isAuth, PostEdit);
router.post("/delete", isAuth, Delete);

export default router;

import express from 'express'
import { 
GetCategories, 
GetCreate, 
PostCreate, 
GetEdit,
PostEdit,
Delete  } from '../controllers/CategoriesController.js'

import isAuth from '../middlewares/isAuth.js'

const router = express.Router();

//Series route
router.get('/index', isAuth, GetCategories);
router.get("/create", isAuth, GetCreate);
router.post("/create", isAuth, PostCreate);
router.get('/edit/:categorieId', isAuth, GetEdit);
router.post('/edit', isAuth, PostEdit);
router.post("/delete", isAuth, Delete);




export default router;

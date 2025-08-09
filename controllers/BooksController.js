import context from '../context/AppContext.js';
import { sendEmail } from '../services/EmailService.js';
import path from 'path';
import { projectRoot } from '../utils/Path.js';
import fs from 'fs';

export async function GetBooks(req, res, next){
    try{
        const result = await context.BooksModel.findAll({
            where:{userId: req.user.id},
            include: [
            {model: context.AuthorsModel}, 
            {model: context.CategoriesModel},
            {model: context.EditorialsModel},
        ]})
        const books = result.map((result) => result.get({plain: true}));

        res.render("books/index",{
            booksList: books,
            hasBooks: books.length > 0, 
            "page-title": "Web Library - Mantenimiento de Libros"
        });

    }catch(err){
        console.error(`Error fetching books: ${err}`);
    }
}

export async function GetCreate(req, res, next){
    try{ 
        const authorsResult = await context.AuthorsModel.findAll({ where:{userId: req.user.id} });
        const authors = authorsResult.map((authorsResult) => authorsResult.get({plain: true}));

        try{
            const categoriesResult = await context.CategoriesModel.findAll({ where:{userId: req.user.id} });
            const categories = categoriesResult.map((categoriesResult) => categoriesResult.get({plain: true}));

            try{
                const editorialsResult = await context.EditorialsModel.findAll({ where:{userId: req.user.id} });
                const editorials = editorialsResult.map((editorialsResult) => editorialsResult.get({plain: true}));

                res.render("books/create",{
                    editMode: false, 
                    authorsList: authors,
                    hasAuthors: authors.length > 0,
                    categoriesList: categories,
                    hasCategories: categories.length > 0,
                    editorialsList: editorials,
                    hasEditorials: categories.length > 0,
                    "page-title": "Web Library - Crear Libro"
                });

            }catch(err){
                console.error(`Error fetching editorials ${err}`);
                req.flash("errors", "Ha ocurrido un error llamando los datos de los editoriales.");
            }
        }catch(err){
            console.error(`Error fetching categories ${err}`);
            req.flash("errors", "Ha ocurrido un error llamando los datos de las categorías.");
        }
    }catch(err){
        console.error(`Error fetching authors ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de los autores.");
    }
}

export async function PostCreate(req, res, next){
    const name = req.body.bookName;
    const releaseDate = req.body.releaseDate;
    const categorieId = req.body.categorieId;
    const authorId = req.body.authorId;
    const editorialId = req.body.editorialId;
    const imageURL = req.file;

    const logoPath = "\\" + path.relative("public", imageURL.path)

    try{
        await context.BooksModel.create({
            name: name,
            imageURL: logoPath,
            releaseDate: releaseDate,
            categorieId: categorieId,
            authorId: authorId,
            editorialId: editorialId,
            userId: req.user.id
        });

        try{
            const result = await context.AuthorsModel.findOne({where: {id: authorId}});
            const authorEmail = result.dataValues.email;

            await sendEmail({
                to: authorEmail,
                subject: "Nuevo Libro Agregado a Web Library",
                html: `<h2>Un nuevo libro de su auditoría ha sido agregado:</h2>
                        <h4>Nombre del libro: ${name}</h4>`
            });
        }catch(err){
            console.error(`Error sending mail to author: ${err}`);
            req.flash("errors", "Ha ocurrido un error enviando el correo automático al autor.");
        }

        req.flash("success", "Se ha creado el libro con éxito.");
        return res.redirect("/books/index");

    }catch(err){
        console.error(`Error creating book: ${err}`);
        req.flash("errors", "Ha ocurrido un error creando el libro.");
    }
}

export async function GetEdit(req, res, next){
    const id = req.params.bookId;

    try{
        const result = await context.BooksModel.findOne({where: {id: id, userId: req.user.id}});

        if(!result){
            return res.redirect("/books/index");
        }

        const book = result.dataValues;

        try{ 
            const authorsResult = await context.AuthorsModel.findAll({ where:{userId: req.user.id} });
            const authors = authorsResult.map((authorsResult) => authorsResult.get({plain: true}));
    
            try{
                const categoriesResult = await context.CategoriesModel.findAll({ where:{userId: req.user.id} });
                const categories = categoriesResult.map((categoriesResult) => categoriesResult.get({plain: true}));
    
                try{
                    const editorialsResult = await context.EditorialsModel.findAll({ where:{userId: req.user.id} });
                    const editorials = editorialsResult.map((editorialsResult) => editorialsResult.get({plain: true}));
    
                    res.render("books/create",{
                        editMode: true,
                        book: book, 
                        authorsList: authors,
                        hasAuthors: authors.length > 0,
                        categoriesList: categories,
                        hasCategories: categories.length > 0,
                        editorialsList: editorials,
                        hasEditorials: categories.length > 0,
                        "page-title": `Web Library - Editar Libro ${book.name}`
                    });
    
                }catch(err){
                    console.error(`Error fetching editorials ${err}`);
                    req.flash("errors", "Ha ocurrido un error llamando los datos de los editoriales.");
                }
            }catch(err){
                console.error(`Error fetching categories ${err}`);
                req.flash("errors", "Ha ocurrido un error llamando los datos de las categorías.");
            }
        }catch(err){
            console.error(`Error fetching authors ${err}`);
            req.flash("errors", "Ha ocurrido un error llamando los datos de los autores.");
        }
    }catch(err){
        console.error(`Error fetching book ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del libro.");
    }
}

export async function PostEdit(req, res, next){
    const name = req.body.bookName;
    const id = req.body.bookId
    const releaseDate = req.body.releaseDate;
    const categorieId = req.body.categorieId;
    const authorId = req.body.authorId;
    const editorialId = req.body.editorialId;
    const imageURL = req.file;
    let imagePath = null;

    try{
        const result = await context.BooksModel.findOne({where: {id: id, userId: req.user.id}});
        
        if(!result){
            return res.redirect("/books/index");
        }

        try{
            if(imageURL){
                imagePath = path.join(projectRoot, "public", result.dataValues.imageURL);
                if(fs.existsSync(imagePath)){
                    fs.unlinkSync(imagePath);
                };

                imagePath = "\\" + path.relative("public", imageURL.path);
            }else{
                imagePath = result.dataValues.imageURL
            }

            await context.BooksModel.update({
                name: name,
                imageURL: imagePath,
                releaseDate: releaseDate,
                categorieId: categorieId,
                authorId: authorId,
                editorialId: editorialId,
                userId: req.user.id
                },
                {where: {id: id}});


                req.flash("success", "Se ha actualizado el libro con éxito.");
                return res.redirect("/books/index");
        }catch(err){
            console.error(`Error updating book: ${err}`);
            req.flash("errors", "Ha ocurrido un error actualizando el libro.");
        }

    }catch(err){
        console.error(`Error fetching book: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del libro.");
    }
}

export async function Delete(req, res, next){
    const id = req.body.bookId;

    try{
        const result = await context.BooksModel.findOne({where: {id: id, userId: req.user.id}});

        if(!result){
            return res.redirect("/books/index");
        }

        if(result.imageURL){
            const imagePath = path.join(projectRoot, "public", result.imageURL);
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath);
            }
        }

        try{
            await context.BooksModel.destroy({where: {id: id, userId: req.user.id}});

            req.flash("success", "Se ha eliminado el libro con éxito.");
            return res.redirect('/books/index');

        }catch(err){
            console.error(`Error deleting book: ${err}`);
            req.flash("errors", "Ha ocurrido un error eliminando el libro.");
        }
    }catch(err){
        console.error(`Error fetching book: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del libro.");
    }
}
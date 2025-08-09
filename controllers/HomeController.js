import context from '../context/AppContext.js';

export async function GetHome(req, res, next){

    try{
        const result = await context.BooksModel.findAll({include: [
            {model: context.AuthorsModel}, 
            {model: context.CategoriesModel},
            {model: context.EditorialsModel},
        ]});
        
        const books = result.map((result) => result.get({plain: true}));
        try{
            const authorsResult = await context.AuthorsModel.findAll();
            const authors = authorsResult.map((authorsResult) => authorsResult.get({plain: true}));
            try{
                const categoriesResult = await context.CategoriesModel.findAll()
                const categories = categoriesResult.map((categoriesResult) => categoriesResult.get({plain: true}));

                try{
                    const editorialsResult = await context.EditorialsModel.findAll();
                    const editorials = editorialsResult.map((editorialsResult) => editorialsResult.get({plain: true}));

                    res.render("home/home",{
                        editMode: false,
                        booksList: books,
                        hasBooks: books.length > 0, 
                        authorsList: authors,
                        hasAuthors: authors.length > 0,
                        categoriesList: categories,
                        hasCategories: categories.length > 0,
                        editorialsList: editorials,
                        hasEditorials: categories.length > 0,
                        "page-title": `Web Library - Lista de Libros`
                    });

                }catch(err){
                    console.error(`Error fetching editorials ${err}`);
                }
            }catch(err){
                console.error(`Error fetching categories ${err}`);
            }
        }catch(err){
            console.error(`Error fetching authors ${err}`);
        }
    }catch(err){
        console.error(`Error fetching books ${err}`);
    }
}


export async function PostHome(req, res, next){
    const searchBookName = req.body.searchBookName;
    const searchCategorieId = req.body.searchCategorieId;
    const searchAuthorId = req.body.searchAuthorId;

try{
    const result = await context.BooksModel.findAll({include: [
        {model: context.AuthorsModel}, 
        {model: context.CategoriesModel},
        {model: context.EditorialsModel},
    ]});
    
    const books = result.map((result) => result.get({plain: true}));
    try{
        const authorsResult = await context.AuthorsModel.findAll();
        const authors = authorsResult.map((authorsResult) => authorsResult.get({plain: true}));
        try{
            const categoriesResult = await context.CategoriesModel.findAll();
            const categories = categoriesResult.map((categoriesResult) => categoriesResult.get({plain: true}));

            try{
                const editorialsResult = await context.EditorialsModel.findAll()
                const editorials = editorialsResult.map((editorialsResult) => editorialsResult.get({plain: true}));

                res.render("home/home",{
                    searchMode: true,
                    booksList: books,
                    hasBooks: books.length > 0, 
                    authorsList: authors,
                    hasAuthors: authors.length > 0,
                    categoriesList: categories,
                    hasCategories: categories.length > 0,
                    editorialsList: editorials,
                    hasEditorials: categories.length > 0,
                    searchBookName: searchBookName,
                    searchCategorieId: searchCategorieId,
                    searchAuthorId: searchAuthorId,
                    "page-title": `Web Library - Lista de Libros`
                });

            }catch(err){
                console.error(`Error fetching editorials ${err}`);
            }
        }catch(err){
            console.error(`Error fetching categories ${err}`);
        }
    }catch(err){
        console.error(`Error fetching authors ${err}`);
    }
}catch(err){
    console.error(`Error fetching books ${err}`);
}
}

export async function GetBook(req, res, next){
    const id = req.params.bookId;
    try{
        const result = await context.BooksModel.findOne({
            where: {id: id}, 
            include: [
            {model: context.AuthorsModel}, 
            {model: context.CategoriesModel},
            {model: context.EditorialsModel},
            ]
        });

        if(!result){
            return res.redirect("/home/index");
        }

        const book = result.get({plain: true});

        res.render("home/details", {
            book: book
        })

    }catch(err){
        console.error(`Error fetching book: ${err}`)
    }
}
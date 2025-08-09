import context from '../context/AppContext.js';
import { fn, col } from 'sequelize';

export async function GetCategories(req, res, next){
    try{
        const result = await context.CategoriesModel.findAll({
            where:{userId: req.user.id},
            attributes: [
                'id',
                'name',
                'description',
                [fn('COUNT', col('Books.id')), 'bookCount']
            ],
            include: [{
                model: context.BooksModel,
                attributes: []
            }],
            group: ['Categories.id'],
        });
        const categories = result.map((result) => result.dataValues);

        res.render("categories/index", {
            categoriesList: categories,
            hasCategories: categories.length > 0,
            "page-title": "Web Library - Mantenimiento de Categorías"
        });

    }catch(err){
        console.error(`Error fetching categories: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de las categorías.");
    }
}

export function GetCreate(req, res, next){
    res.render("categories/create", {editMode: false, "page-title": "Web Library - Crear Categoría"})
}


export async function PostCreate(req, res, next){
    const name = req.body.categorieName;
    const description = req.body.categorieDescription;

    try{
        await context.CategoriesModel.create({
            name: name,
            description: description,
            userId: req.user.id
        })

        req.flash("success", "Se ha creado la categoría con éxito.")
        return res.redirect("/categories/index");

    }catch(err){
        console.error(`Error creating category: ${err}`)
        req.flash("errors", "Ha ocurrido un error creando la categoría.");
    }
}




export async function GetEdit(req, res, next){
    const id = req.params.categorieId;

    try{
        const result = await context.CategoriesModel.findOne({where: {id: id}});
        if(!result){
            return res.redirect("/categories/index");
        }
    
        const categorie = result.dataValues;
    
        res.render("categories/create", {
            editMode: true,
            categorie: categorie,
            "page-title": `Web Library - Editar Categoría ${categorie.name}`
        });

    }catch(err){
        console.error(`Error fetching category: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de la categoría.");
    }
}





export async function PostEdit(req, res, next){
    const name = req.body.categorieName;
    const description = req.body.categorieDescription;
    const id = req.body.categorieId;

    try{
        const result = await context.CategoriesModel.findOne({where: {id: id}});
        if(!result){
            return res.redirect("/categories/index");
        }
    
        try{
            await context.CategoriesModel.update(
                {
                name: name, 
                description: description,
                userId: req.user.id
                },
                {where: {id: id}});
                
                req.flash("success", "Se ha creado la categoría con éxito.")
                return res.redirect("/categories/index")
    
        }catch(err){
            console.error(`Error updating categorie: ${err}`);
            req.flash("errors", "Ha ocurrido un error actualizando la categoría.");
        }
    
    }catch(err){
        console.error(`Error fetching categorie: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de la categoría.");
    }
        
}

export async function Delete(req, res, next){
    const id = req.body.categorieId;

    try{
        const result = await context.CategoriesModel.findOne({where: {id: id}});

        if(!result){
            return res.redirect("/categories/index");
        }

        try{
            await context.CategoriesModel.destroy({where: {id: id}});

            req.flash("success", "Se ha eliminado la categoría con éxito.");
            return res.redirect('/categories/index');
            
        }catch(err){
            console.error(`Error deleting categorie: ${err}`)
            req.flash("errors", "Ha ocurrido un error eliminando la categoría.");
        }
    }catch(err){
        console.error(`Error fetching categorie: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de la categoría.");
    }
}

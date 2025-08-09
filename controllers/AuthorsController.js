import context from '../context/AppContext.js';
import { fn, col } from 'sequelize';

export async function GetAuthors(req, res, next){
    try{
        const result = await context.AuthorsModel.findAll({
            where:{userId: req.user.id},
            attributes: [
                'id',
                'name',
                'email',
                [fn('COUNT', col('Books.id')), 'bookCount']
            ],
            include: [{
                model: context.BooksModel,
                attributes: []
            }],
            group: ['Authors.id'],
        });
        const authors = result.map((result) => result.dataValues);

        res.render("authors/index",
            {authorsList: authors,
            hasAuthors: authors.length > 0, 
            "page-title": "Web Library - Mantenimiento de Autores"
        });

    }catch(err){
        console.error(`Error fetching authors: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de los autores.");
    }
}

export function GetCreate(req, res, next){
    res.render("authors/create", {editMode: false, "page-title": "Web Library - Crear Autor"})
}


export async function PostCreate(req, res, next){
    const name = req.body.authorName;
    const email = req.body.authorEmail;

    try{
        await context.AuthorsModel.create({
            name: name,
            email: email,
            userId: req.user.id
        })

        req.flash("success", "Se ha creado el autor con éxito.")
        return res.redirect("/authors/index");

    }catch(err){
        console.error(`Error creating author: ${err}`)
        req.flash("errors", "Ha ocurrido un error registrando los datos del autor.");
    }
}

export async function GetEdit(req, res, next){
    const id = req.params.authorId;

    try{
        const result = await context.AuthorsModel.findOne({where: {id: id, userId: req.user.id}});
        if(!result){
            return res.redirect("/authors/index");
        }
    
        const author = result.dataValues;
    
        res.render("authors/create", {
            editMode: true,
            author: author,
            "page-title": `Web Library - Editar Autor ${author.name}`
        });

    }catch(err){
        console.error(`Error fetching author: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del autor.");
    }
}

export async function PostEdit(req, res, next){
    const name = req.body.authorName;
    const email = req.body.authorEmail;
    const id = req.body.authorId;

    try{
        const result = await context.AuthorsModel.findOne({where: {id: id, userId: req.user.id}});
        if(!result){
            return res.redirect("/authors/index");
        }
    
        try{
            await context.AuthorsModel.update(
                {
                name: name, 
                email: email,
                userId: req.user.id
                },
                {where: {id: id}})
                
                req.flash("success", "Se ha actualizado el autor con éxito.")
                return res.redirect("/authors/index")
    
        }catch(err){
            console.error(`Error updating author: ${err}`);
            req.flash("errors", "Ha ocurrido un error actualizando el usuario.");
        }
    
    }catch(err){
        console.error(`Error fetching author: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del autor.");
    }
        
}

export async function Delete(req, res, next){
    const id = req.body.authorId;

    try{
        const result = await context.AuthorsModel.findOne({where: {id: id, userId: req.user.id}});

        if(!result){
            return res.redirect("/authors/index");
        }

        try{
            await context.AuthorsModel.destroy({where: {id: id}});

            req.flash("success", "Se ha eliminado el autor con éxito.")
            return res.redirect('/authors/index')
            
        }catch(err){
                console.error(`Error deleting author: ${err}`)
                req.flash("errors", "Ha ocurrido un error eliminando un autor.");
        }
        
    }catch(err){
        console.error(`Error fetching author: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del autor.");
    }
}

import context from '../context/AppContext.js';
import { fn, col } from 'sequelize';

export async function GetEditorials(req, res, next){
    try{
        const result = await context.EditorialsModel.findAll({
            where:{userId: req.user.id},
            attributes: [
                'id',
                'name',
                'phone',
                'country',
                [fn('COUNT', col('Books.id')), 'bookCount']
            ],
            include: [{
                model: context.BooksModel,
                attributes: []
            }],
            group: ['Editorials.id'],
        });
        const editorials = result.map((result) => result.dataValues);
    
        res.render("editorials/index",
            {editorialsList: editorials,
            hasEditorials: editorials.length > 0, 
            "page-title": "Web Library - Mantenimiento de Editoriales"
        });
    
    
    }catch(err){
        console.error(`Error fetching editorials: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de los editoriales.");
    }
}

export function GetCreate(req, res, next){
    res.render("editorials/create", {editMode: false, "page-title": "Web Library - Crear Editorial"})
}

export async function PostCreate(req, res, next){
    const name = req.body.editorialName;
    const phone = req.body.editorialPhone;
    const country = req.body.editorialCountry;

    try{
        await context.EditorialsModel.create({
            name: name,
            phone: phone,
            country: country,
            userId: req.user.id
        });

        req.flash("success", "Se ha creado el editorial con éxito.");
        return res.redirect("/editorials/index");
    
    }catch(err){
        console.error(`Error creating editorial: ${err}`)
        req.flash("errors", "Ha ocurrido un error creando el editorial.");
    }

}

export async function GetEdit(req, res, next){
    const id = req.params.editorialId;

    try{
        const result = await context.EditorialsModel.findOne({where: {id: id}});
    
        if(!result){
            return res.redirect("/editorials/index");
        }
        const editorial = result.dataValues;
    
        res.render("editorials/create", {
            editMode: true,
            editorial: editorial,
            "page-title": `Web Library - Editar Editorial ${editorial.name}`
        });
    
    }catch(err){
        console.error(`Error fetching editorial: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del editorial.");
    }
}

export async function PostEdit(req, res, next){
    const name = req.body.editorialName;
    const phone = req.body.editorialPhone;
    const country = req.body.editorialCountry;
    const id = req.body.editorialId;

    try{
        const result = await context.EditorialsModel.findOne({where: {id: id}});
        if(!result){
            return res.redirect("/editorials/index");
        }
    
        try{
            await context.EditorialsModel.update(
            {
            name: name,  
            phone: phone,
            country: country,
            userId: req.user.id
            },
            {where: {id: id}});

            req.flash("success", "Se ha actualizado el editorial con éxito.");
            return res.redirect("/editorials/index")
    
        }catch(err){
            console.error(`Error updating editorial: ${err}`);
            req.flash("errors", "Ha ocurrido un error actualizando el editorial.");
        }
    }catch(err){
        console.error(`Error fetching editorial: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del editorial.");
    }
        
}

export async function Delete(req, res, next){
    const id = req.body.editorialId;

    try{
        const result = await context.EditorialsModel.findOne({where: {id: id}});
    
        if(!result){
            return res.redirect("/editorials/index");
        }
    
        try{
            await context.EditorialsModel.destroy({where: {id: id}})

            req.flash("success", "Se ha eliminado el editorial con éxito.");
            return res.redirect('/editorials/index')
    
        }catch(err){
            console.error(`Error deleting editorial: ${err}`);
            req.flash("errors", "Ha ocurrido un error eliminando el editorial.");
        }
    }catch(err){
        console.error(`Error fetching editorial: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del editorial.");
    }
    
}

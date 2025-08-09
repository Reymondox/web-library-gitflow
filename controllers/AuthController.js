import context from '../context/AppContext.js';
import { sendEmail } from '../services/EmailService.js'
import bcrypt from 'bcrypt'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { Op } from 'sequelize'


export function GetLogin(req, res, next){
        res.render("auth/login",
            {"page-title": "Web Library - Iniciar Sesión", layout: "anonymous-layout" }
        )
}

export async function PostLogin(req, res, next){
    const {userPassword } = req.body;

    const userEmail = req.body.userEmail.toLowerCase();

    try{
        const user = await context.UsersModel.findOne({where: {email: userEmail}});
        if(!user){
            req.flash("errors", "No se ha encontrado ningún usuario con este email.")
            return res.redirect("/")
        }

        if(!user.isActive){
            if(user.activateTokenExpiration <= Date.now()){ 
                try{
                    await context.UsersModel.destroy({where: {email: userEmail}})
                    req.flash("errors", "Token de activación expirado. Registre la cuenta nuevamente.")
                    return res.redirect("/users/register")
    
                }catch(err){
                    req.flash("errors", "Ha ocurrido un error al intentar borrar su cuenta con activación expirada.")
                    return res.redirect("/")
                }
            }

            req.flash("errors", "Su cuenta no está activada. Porfavor, revisa tu correo para las instrucciones de activación.")
            return res.redirect("/")
        }


        const isPasswordValid = await bcrypt.compare(userPassword, user.password)
        if(!isPasswordValid){
            req.flash("errors", "Contraseña incorrecta.");
            return res.redirect("/")
        }

        req.session.isAuthenticated = true;
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        }

        req.session.save((err) => {
            if(err){
                console.error(`Session save error: ${err}`);
                req.flash("errors", "Ha ocurrido un error durante el inicio de sesión.")
                return res.redirect("/")
            }
            return res.redirect("/home/index")
        })

    }catch(err){
        console.error(`Error loging in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el inicio de sesión.")
        return res.redirect("/")        
    }
}

export function GetRegister(req, res, next){
    res.render("auth/register-user",
        {"page-title": "Web Library - Registrarse", 
        layout: "anonymous-layout"}
    )
}

export async function PostRegister(req, res, next){
    const {userName, userPassword, userPasswordConfirm} = req.body;

    const userEmail = req.body.userEmail.toLowerCase();

    try{
        if (userPassword !== userPasswordConfirm){
            req.flash("errors", "Ambas contraseñas no coinciden.")
            return res.redirect("/users/register")
        }

        const user = await context.UsersModel.findOne({where: {email: userEmail}});
        if(user){
            req.flash("errors", "Ya existe un usuario registrado con este email.")
            return res.redirect("/users/register")
        }
        
        const userHashedPassword = await bcrypt.hash(userPassword, 10);

        const randomBytesAsync = promisify(randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString("hex");

        const expiration = Date.now() + 3600000

        await context.UsersModel.create({
            name: userName,
            email: userEmail,
            password: userHashedPassword,
            isActive: false,
            activateToken: token,
            activateTokenExpiration: expiration
        });

        await sendEmail({
            to: userEmail,
            subject: "Bienvenido al WebLibrary.",
            html: `<h2>Querido ${userName}</h2>
                    <p>Gracias por registrarse. Porfavor haga click en el siguiente link para activar su cuenta:</p>
                    <p><a href="${process.env.APP_URL}/users/activate/${token}">Activar mi Cuenta</a></p>
                    <p>Si usted no se ha registrado, porfavor ignore este correo.</p>`
        });

        req.flash("success", "Se ha creado el usuario con éxito. Porfavor, revise su correo para las instrucciones de activación.")
        return res.redirect("/");

    }catch(err){
        console.log(`Error loging in: ${err}`);
        req.flash("errors", "Ha ocurrido un error registrando el usuario.");
        return res.redirect("/users/register");
    }

}

export async function GetActivate(req, res, next){
    const { token } = req.params;

    if(!token){
        req.flash("errors", "Token de activación inválido/expirado.");
        return res.redirect("/")
    }

    try{
        const user = await context.UsersModel.findOne({
            where: {
                activateToken: token
            }});
        
        if(!user){
            req.flash("errors", "Token de activación inválido.");
            return res.redirect("/")
        }

        if(user.activateTokenExpiration <= Date.now()){ 
            try{
                await context.UsersModel.destroy({where: {email: user.email}})
                req.flash("errors", "Token de activación expirado. Registre la cuenta nuevamente.")
                return res.redirect("/users/register")

            }catch(err){
                req.flash("errors", "Ha ocurrido un error al intentar borrar su cuenta con activación expirada.")
                return res.redirect("/")
            }}
        

        user.isActive = true;
        user.activateToken = null;
        user.activateTokenExpiration = null;

        try{
            const result = await user.save()
            if(!result){
                req.flash("errors", "Ha ocurrido un error durante la activación de su cuenta.");
                return res.redirect("/");
            }
    
            req.flash("success", "Se ha activado su cuenta con éxito.")
            res.redirect("/")
    
        }catch(err){
            console.error(`Error while saving user in: ${err}`);
            req.flash("errors", "Ha ocurrido un error durante la activación de su  cuenta.");
        }

    }catch(err){
        console.error(`Error while activating account in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante la activación de su cuenta.");
        return res.redirect("/")
    }   
}

export function GetLogout(req, res, next){
    req.session.destroy((err) => {    if(err){
        console.error(`Error destroying session: ${err}`);
        req.flash("errors", "Ha ocurrido un error cerrando sesión.");
        return res.redirect('/home/index')
    }})
    return res.redirect('/')

}

export function GetForgot(req, res, next){
    res.render("auth/forgot",
        {"page-title": "Web Library - Olvidé mi Contraseña", layout: "anonymous-layout" }
    )
}

export async function PostForgot(req, res, next){
const userEmail = req.body.userEmail.toLowerCase();

try{
    const user = await context.UsersModel.findOne({where: {email: userEmail},
    });


    if(!user){
        req.flash("errors", "No se ha encontrado ningún usuario con este email.")
        return res.redirect("/users/forgot")
    }

    if(user.resetTokenExpiration){
        req.flash("errors", "Token de reinicio de contraseña aún activo. Espere a que expire en 1h.")
        return res.redirect("/users/forgot")
    }


    const randomBytesAsync = promisify(randomBytes);
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000

    try{
        const result = await user.save()
        if(!result){
            req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
            return res.redirect("/users/forgot");
        }

        await sendEmail({
            to: userEmail,
            subject: "Web Library - Solicitud de Reinicio de Contraseña.",
            html: `<h2>Querido ${user.name}</h2>
                    <p>Has solicitado un reinicio de contraseña. Porfavor haz click en el link de debajo para reiniciar tu contraseña:</p>
                    <p><a href="${process.env.APP_URL}/users/reset/${token}">Reiniciar contraseña</a></p>
                    <p>Si usted no ha hecho ninguna solicitud, porfavor ignore este mensaje.</p>`
        });

        req.flash("success", "Se ha enviado el link para reiniciar su contraseña a su email.")
        res.redirect("/")

    }catch(err){
        console.error(`Error while saving reset token in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
        return res.redirect("/")    
    }

}catch(err){
    console.error(`Error reseting password in: ${err}`);
    req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.")
    return res.redirect("/")        
}
}

export async function GetReset(req, res, next){
    const { token } = req.params;

    if(!token){
        req.flash("errors", "Token inválido/expirado.");
        return res.redirect("/users/forgot")
    }

    try{
        const user = await context.UsersModel.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gte]: Date.now() },
            },
        });

        if(!user){
            req.flash("errors", "Token inválido/expirado.");
            return res.redirect("/users/forgot");
        }

        res.render("auth/reset", {
            "page-title": "Web Library - Reiniciar Contraseña",
            layout: "anonymous-layout",
            passwordToken: token,
            userId: user.id
        })
    }catch(err){
        console.error(`Error reseting password in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.")
        return res.redirect("/users/forgot")     
    }
}

export async function PostReset(req, res, next){
    const { userPasswordToken, userId, userPassword, userPasswordConfirm } = req.body;

    if(userPassword !== userPasswordConfirm){
        req.flash("errors", "Ambas contraseñas no coinciden.");
        return res.redirect(`/users/reset/${userPasswordToken}`);
    }

    try{
        const user = await context.UsersModel.findOne({
            where: {
                id: userId,
                resetToken: userPasswordToken,
                resetTokenExpiration: { [Op.gte]: Date.now() },
            },
        });

        if(!user){
            req.flash("errors", "Token inválido/expirado.");
            return res.redirect("/users/forgot");
        }

        const hashedPassword = await bcrypt.hash(userPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;

        try{
            const result = await user.save()
            if(!result){
                req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
                return res.redirect("/users/forgot");
            }
    
            req.flash("success", "Se ha reestablecido su contraseña con éxito.")
            res.redirect("/")
    
        }catch(err){
            console.error(`Error while saving user in: ${err}`);
            req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
        }

    }catch(err){
        console.error(`Error while resetting password in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
        return res.redirect("/")
    }
}


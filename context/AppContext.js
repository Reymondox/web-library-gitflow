import connection from '../utils/DbConnection.js';
import AuthorsModel from '../models/AuthorsModel.js';
import BooksModel from '../models/BooksModel.js';
import CategoriesModel from '../models/CategoriesModel.js';
import EditorialsModel from '../models/EditorialsModel.js';
import UsersModel from '../models/UserModel.js' 

//Initialize Connection
try{
    await connection.authenticate()
    console.log("Database connection has been established successfully.");
}catch(err){
    console.error(`Error Unable to connect to the database: ${err}`);
}

//Relations
AuthorsModel.hasMany(BooksModel, { foreignKey: "authorId" });
CategoriesModel.hasMany(BooksModel, { foreignKey: "categorieId" });
EditorialsModel.hasMany(BooksModel, { foreignKey: "editorialId" });
UsersModel.hasMany(BooksModel, { foreignKey: "userId" });

BooksModel.belongsTo(UsersModel, { foreignKey: "userId"})
BooksModel.belongsTo(AuthorsModel, { foreignKey: "authorId" });
BooksModel.belongsTo(CategoriesModel, { foreignKey: "categorieId" });
BooksModel.belongsTo(EditorialsModel, { foreignKey: "editorialId" });



export default{
    Sequelize: connection, 
    AuthorsModel,
    BooksModel,
    CategoriesModel,
    EditorialsModel,
    UsersModel
}
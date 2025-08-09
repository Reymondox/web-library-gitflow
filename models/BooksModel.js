import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Books = connection.define('Books', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageURL: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    releaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }, 
    categorieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Categories",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Authors",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    editorialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Editorials",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Users",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
},
{
    freezeTableName: true,
}
);

export default Books
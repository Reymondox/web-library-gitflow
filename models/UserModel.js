import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Users = connection.define('Users', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activateToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activateTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
    }
},
{
    freezeTableName: true,
}
);

export default Users
import { where } from 'sequelize';
import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';
import { query } from 'express';

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}
const getAllUsers = async () =>{
    const user = await db.User.findAll({
        where: {
            status: true,
        }
    })
    return {
        code: 200,
        message: user,
    }
}

const findUsers = async (req) =>{
    const { name, status, login_before, login_after } = req.query
    const filter = {}
    try {
        if (status !== undefined) {
            filter.status = status === 'true' ? true : false;}
        if (name) {
            filter.name = {[db.Sequelize.Op.like]: `%${name}%`};
        }
        if (login_before) {
            filter.createdAt = {[db.Sequelize.Op.lte]: new Date(login_before)};
        }
        if (login_after) {
            filter.createdAt = {[db.Sequelize.Op.gte]: new Date(login_after)};
        }
    
        
    } catch (error) {
        console.log(error)
        return {
            code: 400,
            message:'Error'
        }
    }
    const user = await db.User.findAll({
        where: filter
    });

    return{
        code: 200,
        message: user,
    }
}



const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'User updated successfully'
    };
}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    await  db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'User deleted successfully'
    };
}

export default {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
    findUsers,
}
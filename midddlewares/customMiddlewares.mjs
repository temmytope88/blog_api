import { getUser } from "../functions/crudmethod.mjs";
import bcrypt from "bcrypt";
import { verifyAccessToken } from "./jwt.mjs";
import UserModel from "../schemas/user.mjs";

export const postUserValidation = (req, res, next) => {
    const { first_name, last_name, password, email } = req.body;

    if (!first_name  || !last_name || !password || !email) {
        return res.status(400).json({ message: 'Firstname, lastname , password, and email are required.' });
    }
    // If all required fields are present, move to the next middleware
    next();
};

export const deleteUserValidation = (req, res, next) => {
    const { password, email,  } = req.body;

    if (!password || !email) {
        return res.status(400).json({ message: 'Password, and email are required.' });
    }
    
    next();
};

export const getUserValidation = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'User email is required.' });
    }

    // If all required fields are present, move to the next middleware
    next();
};

export const blogPostValidation = (req, res, next) =>{
    const { title, description, body } = req.body
    if(!title || !description || !body ){
        return res.status(400).json({ message: 'Title, description, state, body are required' });
    }
    next();
}

export const userLogin = async (req, res, next) =>{
    
    const {email, password} = req.body   

    if(!email || !password){
        return res.status(400).json({ message: 'password and email are required' })
    }
    
    try {
            
            const user = await UserModel.findOne({'email': req.body.email})
            
            if(user){
                    
                    if(bcrypt.compareSync(password, user.password)){
                        req.userId = user._id  
                        req.username = `${user.first_name} ${user.last_name}`
                        req.email = user.email
                        next()
                    }else{
                        return res.status(400).json({ message: "User's email or/and password wrong" })
                    }
                
            }
            else{
                return res.status(400).json({ message: 'User does not exist' })
            }
    } 
    catch (error) {
        res.status(500).send({ error });
    }
    
}

export const userAuth = (req, res, next) => {

    if(req.session.user){
        if(req.session.user.username && req.session.user.isAuth && req.session.user.userId){
            next()
        }
        else{
            return res.status(400).json({ message: "Unauthorized User" })
        }
    }else{
        return res.status(400).json({ message: "Unauthorized User" })
    }
    
}

export const verifyUserToken =  async (req, res, next) =>{
    let token = ""
    
    if(req.headers.authorization){
        token = req.headers.authorization.split(" ")[1]
    }
    
    if (!token) {
        res.status(401).json({message: "No authorization token found"});
    }else{
        const result = await verifyAccessToken(token);    
        if (!result.success) {
            res.status(403).json({ error: result.error });
        }else{
            req.user = result.data;
            next();
        }
    } 
      
} 
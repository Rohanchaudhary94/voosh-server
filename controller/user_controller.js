// require user model
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

// this secrateKey is used for routes protection
const secrateKey =process.env.SECRATE_KEY;


/* For Adding/Register User :
Request TYPE : POST 
POST : http://localhost:8000/api/add-user
{
    "name": "John Doe",
    "number": "123456789",
    "password": "123456"
}
*/

module.exports.addUser = async function (req, res) {
    

    try {
        const number = await User.findOne({ number: req.body.number });
        if (number) {
            return res.status(400).json({
                message: 'User already exists'
            })
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(req.body.password, salt);
            await User.create({
                name: req.body.name,
                number: req.body.number,
                password: hashedPass,
                
            })
            
            return res.status(200).json({
                message: 'User created',
            })
        }
    } catch (err) {
        return res.status(500).json({message:err.message});
    }


}

/* For Login User :--
Request TYPE : POST 
POST : http://localhost:8000/api/login-user
Header : {
    key : secrateKey (for routes protection)
    }
{
    "number": "123456789",
    "password": "123456"
}
*/
module.exports.loginUser = async function (req, res) {
    try {
        // console.log(secrateKey);
        if (req.headers.key !== secrateKey) {
            return res.status(404).json({
                message: "User unauthorized",
            })
        }
        const user = await User.findOne({ number: req.body.number });
        if (!user) {
            return res.status(400).json({
                message: 'User does not exist'
            });
        }

        const validated = await bcrypt.compare(req.body.password, user.password);
        if (!validated) {
            return res.status(400).json({
                message: "Wrong credentials"
            })
        }

        // create jwt token 
        const token = jwt.sign({
            name: user.name,
            number: user.number,
        }, "SECRET", { expiresIn: "30d" });



        return res.status(200).json({
            message: 'Login successful',
            token,
            id:user.id
            
        });

    } catch (err) {
        res.status(500).json(err);
    }

}

/* For add order :--
Request TYPE : POST 
POST : http://localhost:8000/api/add-order
Header : {
    authorization : "JWT token"
    }
{
    "sub_total":255,
    "number":123456789,
    "item_name":"mobile"

}
*/
module.exports.addOrder = async function (req, res) {

    try {   
        let phoneNumber = await User.findOne({number:req.body.number});
        if(!phoneNumber){
            return res.status(400).json({
                message: "Check your phone number",
            })
        }
        let token = req.headers.authorization;
        token = jwt.verify(token, "SECRET");
        if (token) {
            
            let user = await User.findOne({ number:token.number });
            if (!user) {
                return res.status(404).json({
                    message: "User unauthorized",
                })
            }
            let order = {
                id: crypto.randomUUID(),
                item_name: req.body.item_name,
                sub_total: req.body.sub_total,
                number: req.body.number
            }
            // console.log(order)
            user.order.push(order);
            await user.save();
            // console.log(user);

            return res.status(200).json({
                message: 'Order added',
            })

        }

    } catch (err) {
        res.status(500).json(err);
    }

}

/* For get order :--
Request TYPE : POST 
POST : http://localhost:8000/api/get-order
Header : {
    authorization : "JWT token"
    }
*/
module.exports.getOrder = async function (req, res) {
    try {
        let token = req.headers.authorization;
        token = jwt.verify(token, "SECRET");
        if (token) {
            
            let user = await User.findById(req.query.id);
            
            if (!user) {
                return res.status(404).json({
                    message: "User unauthorized",
                })
            }
           
            return res.status(200).json({
                message: 'Order fetched Successfully',
                orders: user.order
            })
        }

    } catch (err) {
        return res.status(500).json(err);
    }

}

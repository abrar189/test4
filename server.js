'use strict'


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { default: axios } = require('axios');
const PORT = process.env.PORT
const server = express();

server.use(cors());
server.use(express.json());
mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });

// http://localhost:3007/
server.get('/', (req, res) => {
    res.send('hiiiiiiii')
})

const coffeSchema = new mongoose.Schema({
    strDrink: String,
    strDrinkThumb: String,
    idDrink: String,

});
const userSchema = new mongoose.Schema({
    email: String,
    coffee: [coffeSchema]
});

const user = mongoose.model('user', userSchema);

function seedingUser() {
    let userData = new user({
        email: 'algourabrar@gmail.com',
        coffee: [{
            "strDrink": "Afterglow",
            "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/vuquyv1468876052.jpg",
            "idDrink": "12560"
        },
        {
            "strDrink": "Alice Cocktail",
            "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/qyqtpv1468876144.jpg",
            "idDrink": "12562"
        },
        {
            "strDrink": "Aloha Fruit punch",
            "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/wsyvrt1468876267.jpg",
            "idDrink": "12862"
        },]

    })
    userData.save();
}
// seedingUser()


// http://localhost:3007/dataDB?email=
server.get('/dataDB', dataFromDB)
function dataFromDB(req, res) {
    let email = req.query.email;
    user.find({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)
        } else {
            res.send(userData[0].coffee)
        }
    })
}
let memory = {};
// https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic
// http://localhost:3007/dataapi
server.get('/dataapi', dataApifun)
async function dataApifun(req, res) {
    const url = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic"
    if (memory['apidata'] !== undefined) {
        res.send(memory['apidata'])
    } else {
        const apiData = await axios.get(url);
        const apiMap = apiData.data.drinks.map(item => {
            return new objData(item);
        })


        memory['apidata'] = apiMap;
        res.send(apiMap);
    }
}

class objData {
    constructor(data) {
        this.strDrink = data.strDrink;
            this.strDrinkThumb = data.strDrinkThumb;
            this.idDrink = data.idDrink;


    }
}

// http://localhost:3007/addToFav
server.post('/addToFav',addToFavFun)
function addToFavFun(req,res){
    const {email,strDrink,strDrinkThumb,idDrink}=req.body;
    user.find({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)
        } else {
            const newFav={
                strDrink:strDrink,
                strDrinkThumb:strDrinkThumb,
                idDrink:idDrink,
            }
            userData[0].coffee.push(newFav);
            
        }
        userData[0].save();
        res.send(userData[0])
    })
}

// http://localhost:3007/delete?email=
server.delete('/delete/:idx', deleteFun)
function deleteFun(req, res) {
    let idx= req.params.idx;
    let email = req.query.email;
    user.findOne({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)
        } else {
            userData.coffee.splice(idx,1)
            userData.save();
            res.send(userData.coffee)
        }
    })
}
// http://localhost:3007/update
server.put('/update/:idx', updateFun)
function updateFun(req, res) {
    let idx= req.params.idx;
    let {email,strDrink,strDrinkThumb,idDrink} = req.body;
    user.findOne({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)
        } else {
            userData.coffee.splice(idx,1,{
                strDrink:strDrink,
                strDrinkThumb:strDrinkThumb,
                idDrink:idDrink,
            })
            userData.save();
            res.send(userData.coffee)
        }
    })
}





server.listen(PORT, () => {
    console.log(`listen to ${PORT}`);
})
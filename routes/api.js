const express = require('express');
const router = express.Router();

const db = require('../models'); //contain the Contact model, which is accessible via db.Contact

router.get('/isUserExist/:email', (req, res) => {
    return db.Contact.findOne({where: {email: req.params.email}})
        .then((contacts) => {
            if(!contacts)
                res.send({isExist:false})
            else
                res.send({isExist:true})
        })
        .catch((err) => {
            console.log('There was an error querying contacts', JSON.stringify(err))
            return res.send(err)
        });
});

module.exports = router;
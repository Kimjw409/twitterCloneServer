const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');
const PORT = process.env.PORT || 5000;

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/twitterC');
const twits = db.get('twits');
const filter = new Filter();

//midle-wares
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({
        message: 'Hello there!'
    });
});

app.get('/twits', (req, res) => {
    twits
        .find()
        .then(twits => {
            res.json(twits);
        });
});

function isValidTwit(twit) {
    return twit.name && twit.name.toString().trim() !== '' && 
    twit.content && twit.content.toString().trim() !== '';
}


app.use(rateLimit({
    windowMs: 30 * 1000, //30 sec
    max: 1 //limit 
}))

app.post('/twits', (req, res) => {
    if (isValidTwit(req.body)) {

        const twit = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        };

        twits
            .insert(twit)
            .then(createdTwit => {
                res.json(createdTwit);
            });
         
    } else {
        res.status(422);
        res.json({
            message: 'Name and Content are required!'
        });
    }
});

app.listen(PORT, () => {
 console.log('listening on port ${PORT}');
});
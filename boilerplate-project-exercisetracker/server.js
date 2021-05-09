const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_KEY);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// CREATE SCHEMAS
const exerciseSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: String
  }
});
const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  log: [exerciseSchema]
});
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// USERS' ROUTES
app.post('/api/users', (req, res) => {
  const newUsername = req.body.username;
  const newUser = new User({ username: newUsername});
  newUser.save((err, data) => {
    if (err) {
      console.error(err);
    }
    res.json({
      username: data.username,
      _id: data._id
    })
  })
});

app.get('/api/users', (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      console.error(err);
    }
    res.json(users);
  });
});

//LOGS' ROUTES
app.post('/api/users/:_id/exercises', (req, res) => {
  let newDate;
  if (req.body.date !== '') {
    newDate = req.body.date;
  } else {
    newDate = new Date().toISOString().substring(0, 10);
  };
  const newExercise = new Exercise({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: newDate
  })
  const _id = req.params._id;
  User.findByIdAndUpdate(
    _id,
    {$push : {log: newExercise}},
    { new: true }, (err, updatedUser) => {
      let responseObject = {};
      responseObject['_id'] = updatedUser.id;
      responseObject['username'] = updatedUser.username;
      responseObject['date'] = new Date(newExercise.date).toDateString();
      responseObject['description'] = newExercise.description;
      responseObject['duration'] = newExercise.duration;
      res.json(responseObject);
    }
  )
})

app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  User.findById(_id, (err, data) => {
    if (err) {
      console.error(err);
    }
    let responseObject = data;

    if (req.query.from || req.query.to) {
      let fromDate = new Date(0);
      let toDate = new Date();
      if (req.query.from) {
        fromDate = new Date(req.query.from)
      }
      if (req.query.to) {
        toDate = new Date(req.query.to)
      }

      fromDate = fromDate.getTime();
      toDate = toDate.getTime();
      responseObject.log = responseObject.log.filter((session) => {
        let sessionDate = new Date(session.date).getTime();
        return sessionDate >= fromDate && sessionDate <= toDate;
      })
    }
    if (req.query.limit) {
      responseObject.log = responseObject.log.slice(0, req.query.limit)
    }

    responseObject = responseObject.toJSON()
    responseObject['count'] = data.log.length;
    res.json(responseObject)
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
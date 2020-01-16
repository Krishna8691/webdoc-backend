var express = require('express');
var app = express();
const session = require('express-session');

var bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }))


app.use(session({ secret: 'something secret', saveUninitialized: true, resave: true }));
// app.use(bodyparser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var Mongoclient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1/webdoc';
Mongoclient.connect(url, function (err, db) {
  if (err) {
    return console.log(err);
  }
  app.listen(3000, () => {
    console.log('App running on port 3000')
  })
});


app.get('/login?', function (req, res) {
  Mongoclient.connect(url, function (err, client) {
    if (err) {
      console.log("some database error => ", err);
    }
    else if (req.query.username && req.query.password) {
      let db = client.db('webdoc');
      let users = db.collection('users');
      users.findOne({ username: req.query.username }, function (err, doc) {
        if (err) {
          throw err;
        }
        if (doc) {
          if (req.query.password === doc.password) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ...doc, status: "true" }));
          }
          else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: "Password is wrong" }));
          }
        }
        else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: "User not found" }));
        }
      });
    }
  });
});

app.post('/createnewuser', function (req, resp) {
  Mongoclient.connect(url, function (err, client) {
    if (err) {
      console.log("some database error => ", err);
    }
    else {
      let db = client.db('webdoc');
      let users = db.collection('users');
      try {
        users.insertOne(req.body, function (err, res) {
          if (err) throw err;
          resp.setHeader('Content-Type', 'application/json');
          resp.end(JSON.stringify({ status: "true" }));
        });
      }
      catch (e) {
        resp.setHeader('Content-Type', 'application/json');
        resp.end(JSON.stringify({ status: "false" }));
      }
    }
  });
});




app.post('/addnewpatient', function (req, resp) {
  Mongoclient.connect(url, function (err, client) {
    if (err) {
      console.log("some database error => ", err);
    }
    else {
      let db = client.db('webdoc');
      let patients = db.collection('patients');
      try {
        patients.insertOne(req.body, function (err, res) {
          if (err) throw err;
          resp.setHeader('Content-Type', 'application/json');
          resp.end(JSON.stringify({ status: "true" }));
        });
      }
      catch (e) {
        resp.setHeader('Content-Type', 'application/json');
        resp.end(JSON.stringify({ status: "false" }));
      }
    }
  });
});


app.get('/getallpatients', function (req, resp) {
  let role = req.query.role;
  console.log(role);
  Mongoclient.connect(url, function (err, client) {
    if (err) {
      console.log("some database error => ", err);
    }
    else {
      let db = client.db('webdoc');
      if (role == "admin") {
        let patients = db.collection("patients").find({}).toArray(function (err, result) {
          if (err) throw err;
          if (result) {
            resp.setHeader('Content-Type', 'application/json');
            resp.end(JSON.stringify(result));
          }
          else {
            resp.setHeader('Content-Type', 'application/json');
            resp.end(JSON.stringify({ status: "false" }));
          }
        });
      }
      else {
        console.log("else for krishna ", role);
        let patients = db.collection("patients").find({ doctor: role }).toArray(function (err, result) {
          if (err) throw err;
          if (result) {
            resp.setHeader('Content-Type', 'application/json');
            resp.end(JSON.stringify(result));
          }
          else {
            resp.setHeader('Content-Type', 'application/json');
            resp.end(JSON.stringify({ status: "false" }));
          }
        });
      }
      // let patients = db.collection("patients").find({}).toArray(function (err, result) {
      //   if (err) throw err;
      //   if (result) {
      //     resp.setHeader('Content-Type', 'application/json');
      //     resp.end(JSON.stringify(result));
      //   }
      //   else {
      //     resp.setHeader('Content-Type', 'application/json');
      //     resp.end(JSON.stringify({ status: "false" }));
      //   }
      // });
    }
  });
});



// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });
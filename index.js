// index.js
// where your node app starts
require('dotenv').config();
const dns = require('dns');
// init project
var express = require('express');
var app = express();
var bodyParser = require("body-parser");

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
app.use(express.urlencoded({ extended: true }));
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const Schema = mongoose.Schema;
const personSchema = new Schema({
  name: { type: String, required: true }, // String is shorthand for {type: String}
  age: Number,
  favoriteFoods: [String]
});
const docurlSchema = new Schema({
  original_url: String, // String is shorthand for {type: String}
  short_url: Number
});
const Person = mongoose.model('Person', personSchema);
const Docurl = mongoose.model('Docurl', docurlSchema);


// your first API endpoint... 
// app.get("/api/hello", function (req, res) {
//   res.json({greeting: 'hello API'});
// });
app.use(bodyParser.urlencoded({ extended: false }));
app.post("/api/shorturl", (req, res, next) => {
  const options = {
    all: true,
  };
  let url = req.body.url;
  //console.log(url);

  try {
    var domain = new URL(url);
    dns.lookup(domain.hostname, options, (err, addresses) => {
      console.log('addresses: %j', addresses);
      if (err) res.json({ error: 'invalid url' });
      else next();
    });
  } catch (error) {
    if (error instanceof TypeError) {
      res.json({ error: 'invalid url' });
    } //just to check if TypeError, probably not necessary for your use
  }

}, function (req, res) {

  let short_url = Docurl.find().sort({ short_url: -1 }).limit(1)
    .then(p => {
      // console.log(p[0].short_url);      
      
      let newurl = new Docurl({original_url:req.body.url,short_url:(p[0].short_url+1)});
        newurl.save().then((err,data)=>{
          res.json({
            "original_url": req.body.url,
            "short_url": short_url+1
          });
        });

    });


});
// Person.find().then(p => console.log(p));
app.get("/api/shorturl/:url",(req,res)=>{
  let short_url = Docurl.findOne({short_url:req.params.url}).then(err,res => {
    res.redirect(res.original_url);
  });
});
app.get("/api/:date?", function (req, res) {



  if (!req.params.date) {
    res.json({ unix: (new Date().getTime()), utc: new Date().toUTCString() });
  }  else {

    if (req.params.date == "whoami") {
      // console.log(req.headers);
      res.json({
        ipaddress: req.headers['x-forwarded-for'], language: req.headers['accept-language'],
        "software": req.headers['user-agent']
      });
    }else {
      let timestamp = Date.parse(req.params.date);
      if (isNaN(timestamp) == false) {
        let d = new Date(timestamp);
        res.json({ unix: new Date(d).getTime(), utc: new Date(d).toUTCString() });
      } else {
        t = parseInt(req.params.date);
        if (Number.isInteger(t)) {
          res.json({ unix: (new Date(t).getTime()), utc: new Date(t).toUTCString() });
        } else {
          res.json({ error: "Invalid Date" });
        }


      }

    }
  }




});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

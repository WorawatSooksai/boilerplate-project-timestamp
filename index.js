// index.js
// where your node app starts
require('dotenv').config();
// init project
var express = require('express');
var app = express();

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


// your first API endpoint... 
// app.get("/api/hello", function (req, res) {
//   res.json({greeting: 'hello API'});
// });

app.get("/api/:date?", function (req, res) {



  if (!req.params.date) {
    res.json({ unix: (new Date().getTime()), utc: new Date().toUTCString() });
  } else {

    if (req.params.date == "whoami") {
      // console.log(req.headers);
      res.json({ipaddress: req.headers['x-forwarded-for'],language:req.headers['accept-language'],
      "software":req.headers['user-agent']});
    } else {
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

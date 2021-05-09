var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

let date;
// UNIX timestamp JSON response
app.get("/api/:date", (req, res) => {
  if (isNaN(req.params.date)) {
    date = new Date(Date.parse(req.params.date));
  } else {
    date = new Date(parseInt(req.params.date));
  }

  !!date.getTime()
    ? res.json({
        unix: date.getTime(),
        utc: date.toUTCString(),
      })
    : res.json({ error: "Invalid Date" });
});

app.get("/api", (req, res) => {
  date = new Date();
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString(),
  });
});

// listen for requests :)
var listener = app.listen(3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
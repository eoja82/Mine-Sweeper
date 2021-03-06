require('dotenv').config()
const express = require("express")
const helmet = require("helmet")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require('connect-mongo')(session)
const apiRoutes = require("./routes/api.js")

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))

app.use(helmet())

app.use("/public", express.static(process.cwd() + "/public"))

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).
  catch (err => console.log(err))

mongoose.connection.on("connected", () => {
  console.log("Connected to database!")
})

// handle errors after initial connection
mongoose.connection.on('error', (err) => {
  console.log(err)
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: "sessions"  
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    secure: false
  }
}))

//Routing for API 
apiRoutes(app) 

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type("text")
    .send("Not Found")
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
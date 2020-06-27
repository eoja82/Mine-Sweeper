const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt")

// to use findOneAndUpdate
mongoose.set("useFindAndModify", false)

module.exports = function(app) {
  let userSchema = new Schema({
    email: {type: String, trim: true, unique: true},
    username: {type: String, trim: true, unique: true},
    hash: String,
    userCreated: {type: Date, default: Date.now},
    beginnerScores: [Number],
    intermediateScores: [Number],
    expertScores: [Number]
  })

  let Users = mongoose.model("Users", userSchema)

  app.route("/createaccount/newuser")
    .post(function(req, res) {
      //console.log(req.body)
      const username = req.body.username,
            email = req.body.email,
            password = req.body.password,
            passwordAgain = req.body.passwordAgain

      if (password !== passwordAgain) {
        res.send("Passwords do not match.")
        return
      }

      Users.findOne({username: username}, function(err, doc) {
        if (err) {
          console.log(err)
          res.send(`Error locating username ${username}.`)
        }
        // make sure username is not alreadey used  
        if (doc) res.send("Username already taken.")
        // if username is available check if email exists for any users
        if (!doc) {
          Users.findOne({email: email}, function(err, doc) {
            if (err) {
              console.log(err)
              res.send(`Error locating email ${email}.`)
            }
            if (doc) res.send(`An account with email ${email} already exists.`)
            // if username and email not found create new user account
            if (!doc) {
              bcrypt.hash(password, 12, function(err, hash) {
                if (err) {
                  console.log(err)
                  res.send("Error: something went wrong.")
                } else {
                  const user = new Users({
                    username: username,
                    email: email,
                    hash: hash
                  })
                  user.save(function(err, doc) {
                    if (err) {
                      console.log(err)
                      res.send("Error: something went wrong creating new account.")
                    } else {
                      //console.log(doc)
                      res.status(307).send("Your account was successfully created!  Please log in.")
                    }
                  })
                }
              })
            }
          })
        }
      })

    })


  // login user
  app.route("/login")
    .post(function(req, res) {
      const username = req.body.username,
            password = req.body.password
      console.log(`${username} ${password}`)

      Users.findOne({username: username}, function(err, user) {
        if (err) {
          console.log(err)
          res.send("Error: locating username")
        } else if (!user) {
          res.send(`${username} is not a valid username.`)
        } else {
          console.log("checking hash")
          bcrypt.compare(password, user.hash, function(err, result) {
            if (result) {
              req.session.loggedIn = true
              res.status(307).send({loggedIn: true, location: "/"})
            } else {
              res.send("Incorrect password.")
            }
          })
        }
      })
    })

    // log out user
    app.route("/logout")
      .get(function(req, res) {
        req.session.destroy(function(err) {
          if (err) {
            console.log(err)
            res.send("Error: could not log out.")
          } else {
            console.log("Logging out user.")
            res.send("Log out successful!")
          }
        })
      })

  }
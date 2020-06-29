const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt")
//let leaderBoardExists = false

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

  let leaderboardSchema = new Schema({
    name: String,
    beginner: [{username: String, score: Number}],
    intermediate: [{username: String, score: Number}],
    expert: [{username: String, score: Number}]
  })

  let Users = mongoose.model("Users", userSchema)
  let Leaderboard = mongoose.model("Leaderboard", leaderboardSchema)

 /*  if (!leaderBoardExists) {
    let leaderboard = new Leaderboard({
      name: "leaderboard"
    })
    leaderboard.save(function(err, doc) {
      if (err) console.log(err)
      else if (!doc) console.log("leaderboard not created")
      else {
        leaderBoardExists = true;
        console.log("leaderboard created")
        console.log(doc)
      }
    })
  } */

  app.route("/init")
    .get(function(req, res) {
      const loginStatus = req.session.loggedIn,
            username = req.session.username
      let leaderBeginner,
          leaderIntermediate,
          leaderExpert,
          userBeginner,
          userIntermediate,
          userExpert

      Leaderboard.findOne({name: "leaderboard"}, function(err, doc) {
        if (err) {
          console.log(err)
          res.send("Error loading scores.")
        } else {
          leaderBeginner = doc.beginner,
          leaderIntermediate = doc.intermediate,
          leaderExpert = doc.expert

          if (loginStatus) {
            console.log(username)
            Users.findOne({username: username}, function(err, doc) {
              if (err) {
                console.log(err)
                res.send(`Error getting ${username}'s top scores.`)
              } else if (!doc) {
                console.log(`can't find user ${username}`)
              }
              else {
                console.log(doc)
                userBeginner = doc.beginnerScores
                userIntermediate = doc.intermediateScores
                userExpert = doc.expertScores
                res.send({
                  loggedIn: loginStatus, 
                  username: username,
                  leaderBeginner: leaderBeginner,
                  leaderIntermediate: leaderIntermediate,
                  leaderExpert: leaderExpert,
                  userBeginner: userBeginner,
                  userIntermediate: userIntermediate,
                  userExpert: userExpert
                })
              }
            })
          } else {
            res.send({
              loggedIn: loginStatus, 
              username: username,
              leaderBeginner: leaderBeginner,
              leaderIntermediate: leaderIntermediate,
              leaderExpert: leaderExpert
            })
          }
          
        }
      })
    })

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
      //console.log(`${username} ${password}`)

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
              req.session.username = username
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

    // update users' scores
    app.route("/scores")
      .put(function(req, res) {
        //console.log(req.body)
        const username = req.body.username,
              level = req.body.level,
              score = Number(req.body.score)
        let levelScores
        
        Leaderboard.findOne({name: "leaderboard"}, function(err, doc) {
          if (err) {
            console.log(err)
            res.send("Error: Sorry, your score could not be saved to the leaderboard.")
          } else if (!doc) {
            console.log("could not find leaderboard")
          } else {
            //const levelScores = doc[level]
            levelScores = doc[level]
            let matchedScore = levelScores.some( x => x.score == score )
            //console.log(matchedScore)
            if (matchedScore) return

            if (levelScores.length < 5) {
              levelScores.push({username: username, score: score})
              levelScores.sort( (a, b) => {
                return a.score - b.score
              })
              updateLeaderBoard()
            } else {
              console.log(levelScores)
              //console.log(`${levelScores[levelScores.length - 1].score} ${score}`)
              if (levelScores[levelScores.length - 1].score > score) {
                levelScores.pop()
                levelScores.push({username: username, score: score})
                levelScores.sort( (a, b) => {
                  return a.score - b.score
                })
                console.log(levelScores)
                // findoneandupdate make a function so you don't repeat
                updateLeaderBoard()
                /* res.send(`Congratulations, you made it onto the ${level} level Leaderboard!`) */
              }
            }
          }
        })
        
        function updateLeaderBoard() {
          Leaderboard.findOneAndUpdate({name: "leaderboard"}, {[level]: levelScores}, {new: true}, function(err, doc) {
            if (err) {
              console.log(err)
              res.send("Error: Sorry, your score could not be saved to the leaderboard.")
            } else {
              //console.log(doc)
              res.send(`Congratulations, you made it onto the ${level} level Leaderboard!`)
            }
          })
        }

      })

      

  }
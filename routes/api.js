const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt")
//let leaderBoardExists = false

// to use findOneAndUpdate
mongoose.set("useFindAndModify", false)

module.exports = function(app) {
  let userSchema = new Schema({
    email: {type: String, trim: true},
    username: {type: String, trim: true, unique: true},
    hash: String,
    userCreated: {type: Date, default: Date.now},
    beginner: [Number],
    intermediate: [Number],
    expert: [Number]
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
            //console.log(username)
            Users.findOne({username: username}, function(err, doc) {
              if (err) {
                console.log(err)
                res.send(`Error getting ${username}'s top scores.`)
              } else if (!doc) {
                console.log(`can't find user ${username}`)
              }
              else {
                //console.log(doc)
                userBeginner = doc.beginner
                userIntermediate = doc.intermediate
                userExpert = doc.expert
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

  // if !loggedIn hide delete account, if loggedIn hide create account
  app.route("/init/accounts")
    .get(function(req, res) {
      res.send({loggedIn: req.session.loggedIn})
    })

  // create new user account
  //app.route("/accounts/newuser")
  app.route("/accounts/useraccount")
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
            // if username and email not found create new user account
            if (!doc || doc.email == "") {
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
            else { 
              res.send(`An account with email ${email} already exists.`)
            }
          })
        }
      })
    })

    // change users' password
    .put(function(req, res) {
      console.log(req.body)
      const username = req.session.username,
            oldPassword = req.body.oldPassword,
            newPassword = req.body.newPassword
      console.log(newPassword)
      // find user
      // check old password
      // hash new password if match
      // update password
      Users.findOne({username: username}, function(err, doc) {
        if (err) {
          console.log(err)
          res.send("Error: could not change password.")
        } else if (!doc) {
          res.status(100).send(`Could not find an account for ${username}.`)
        } else {
          bcrypt.compare(oldPassword, doc.hash, function(err, result) {
            if (result) {
              bcrypt.hash(newPassword, 12, function(err, newHash) {
                if (err) {
                  console.log(err)
                  res.status(400).send("Error: could not change password.")
                } else {
                  Users.findOneAndUpdate({username: username}, {hash: newHash}, {new: true}, function(err, doc) {
                    if (err) {
                      console.log(err)
                      res.status(400).send("Error: could not change password.")
                    } else {
                      res.send("Your password has been changed!")
                    }  
                  })
                }
              })
            } else {
              res.status(100).send("Old password is incorrect.")
            }
          })
        }
      })


    })

  // delete user account
 // app.route("/accounts/deleteuser")
    .delete(async function(req, res) {
      const username = req.body.username,
            password = req.body.password
      console.log(`${username} ${password}`)
      let user,
          passwordMatch,
          userDeleted,
          userDeletedDoc,
          leaderboadScoresDeleted


      await verifyAccount()

      if (user) {
        if (passwordMatch) {
          await deleteAccount() 
          if (userDeleted) {
            await deleteUserLeaderboardScores()
            if (leaderboadScoresDeleted) {
              req.session.destroy()
              res.status(307).send(`Sorry to see you go! Your account for ${username} has been deleted.`)
            } else {
              // reset account if there was an error deleteing scores from the leaderboard
              const options = {new: true, upsert: true}
              //req.session.loggedIn = true
              //req.session.username = username
              Users.findOneAndUpdate({username: userDeletedDoc.username}, userDeletedDoc, options, function(err, doc) {
                if (err) {
                  console.log(err)
                } else {
                  console.log(`reset doc: ${doc}`)
                }
              })
              res.status(200).send(`Error: could not delete ${username}'s account.`)
            }
          } else {
            res.status(200).send("Error: could not delete account")
          }
        } else {
          res.status(200).send("Incorrect password.")
        }
      } else {
        res.status(200).send(`Username ${username} does not exist.`)
      }

      function verifyAccount() {
        return new Promise( (resolve, reject) => {
          // check if password is correct
          Users.findOne({username: username}, function(err, doc) {
            if (err) {
              console.log(err)
              res.send("Error: could not delete account.")
              reject()
            } else if (!doc) {
              console.log("no user")
              user = false
              resolve()
            } else {
              console.log("found user")
              user = true
              bcrypt.compare(password, doc.hash, async function(err, result) {
                if (result) {
                  console.log("password match")
                  passwordMatch = true          
                  resolve()
                } else {
                  console.log("password does not match")
                  passwordMatch = false
                  resolve()
                }
              })
            }
          })
        })
      }

      function deleteAccount() {
        return new Promise( (resolve, reject) => {
          Users.findOneAndDelete({username: username}, function(err, doc) {
            if (err) {
              console.log(err)
              userDeleted = false
              reject()
            } else {
              console.log("account deleted")
              userDeleted = true
              //req.session.destroy()
              resolve()
            }
          })
        })
      }

      function deleteUserLeaderboardScores() {
        const updates = {
          $pull: {
            beginner: {username: username},
            intermediate: {username: username},
            expert: {username: username}
          }
        }
        return new Promise( (resolve, reject) => {
          Leaderboard.updateOne({name: "leaderboard"}, updates, function(err, doc) {
            if (err) {
              console.log(err)
              leaderboadScoresDeleted = false
              reject()
            } else {
              console.log("deleted leaderboard scores")
              leaderboadScoresDeleted = true
              resolve()
            }
          })
        })
      }
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
          //console.log("checking hash")
          bcrypt.compare(password, user.hash, function(err, result) {
            if (result) {
              console.log("password match on log in")
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
      .put(async function(req, res) {
        //console.log(req.body)
        const username = req.body.username,
              level = req.body.level,
              score = Number(req.body.score),
              loginStatus = req.session.loggedIn   
        let leaderBeginner,
            leaderIntermediate,
            leaderExpert,
            userBeginner,
            userIntermediate,
            userExpert,
            levelScoresLeaderboard,
            levelScoresUser,
            newLeaderboardHighScore,
            newUserHighScore,
            message

        await checkForLeaderboardHighScore()
        await checkForUserHighScore()

        function checkForLeaderboardHighScore() {
          return new Promise( (resolve, reject) => {
            Leaderboard.findOne({name: "leaderboard"}, async function(err, doc) {
              if (err) {
                console.log(err)
                res.send("Error: Sorry, your score could not be saved to the leaderboard.")
                reject()
              } else if (!doc) {
                console.log("could not find leaderboard")
                return resolve()
              } else {
                levelScoresLeaderboard = doc[level]
                if (levelScoresLeaderboard.length < 5) {
                  levelScoresLeaderboard.push({username: username, score: score})
                  levelScoresLeaderboard.sort( (a, b) => {
                    return a.score - b.score
                  })
                  await updateLeaderBoard()
                  newLeaderboardHighScore = true
                  resolve()
                } else if (levelScoresLeaderboard[levelScoresLeaderboard.length - 1].score <= score){
                  newLeaderboardHighScore = false
                  leaderBeginner = doc.beginner
                  leaderIntermediate = doc.intermediate
                  leaderExpert = doc.expert
                  return resolve()
                } else {
                    levelScoresLeaderboard.pop()
                    levelScoresLeaderboard.push({username: username, score: score})
                    levelScoresLeaderboard.sort( (a, b) => {
                      return a.score - b.score
                    })
                    await updateLeaderBoard()
                    newLeaderboardHighScore = true
                    resolve()
                }
                
              }
              resolve()
            })
          }) 
        }

        function checkForUserHighScore() {
          return new Promise( (resolve, reject) => {
            Users.findOne({username: username}, async function(err, doc) {
              if (err) {
                console.log(err)
                res.send("Error could not save score.")
                reject()
              } else if (!doc) {
                console.log("Could not find user.")
                reject()
              } else {
                levelScoresUser = doc[level]
                if (levelScoresUser.length < 5) {
                  levelScoresUser.push(score)
                  levelScoresUser.sort( (a, b) => {
                    return a - b
                  })
                  await updateUsersScores()
                  newUserHighScore = true
                  resolve()
                } else if (levelScoresUser[levelScoresUser.length - 1] <= score) {
                  newUserHighScore = false
                  userBeginner = doc.beginner
                  userIntermediate = doc.intermediate
                  userExpert = doc.expert
                  return resolve()
                } else {
                    levelScoresUser.pop()
                    levelScoresUser.push(score)
                    levelScoresUser.sort( (a, b) => {
                      return a - b
                    })
                    await updateUsersScores()
                    newUserHighScore = true
                    resolve()
                }
              }
            })
          })  
        }

        //console.log(`user high: ${newLeaderboardHighScore}, leaderHigh: ${newLeaderboardHighScore}`)
        if (newUserHighScore && newLeaderboardHighScore) {
          //console.log("new leader and user high score")
          message = `Congratulations, you're on the Leaderboard and have a new personal top 10 score for the ${level} level!`
        } else if (newUserHighScore && !newLeaderboardHighScore) {
          //console.log("new user high score")
          message = `Congratulations, you have a new personal top 10 score for the ${level} level.`
        } else {
          //console.log("return in setting message")
          return
        }
        //console.log(`userBeginner: ${userBeginner}, leaderBigginer: ${leaderBeginner[0].score}`)
        res.send({
          message: message,
          leaderBeginner: leaderBeginner,
          leaderIntermediate: leaderIntermediate,
          leaderExpert: leaderExpert,
          userBeginner: userBeginner,
          userIntermediate: userIntermediate,
          userExpert: userExpert,
          loggedIn: loginStatus
        })

        function updateLeaderBoard() {
          return new Promise( (resolve, reject) => {
            //console.log("updating leaderboard scores")
            Leaderboard.findOneAndUpdate({name: "leaderboard"}, {[level]: levelScoresLeaderboard}, {new: true}, function(err, doc) {
              if (err) {
                console.log(err)
                res.send("Error: Sorry, your score could not be saved to the leaderboard.")
                reject()
              } else {
                //console.log("updated leaderboard scores")
                leaderBeginner = doc.beginner
                leaderIntermediate = doc.intermediate
                leaderExpert = doc.expert
                resolve()
              }
            })
          })
        }

        function updateUsersScores() {
          return new Promise( (resolve, reject) => {
            //console.log("updating user scores")
            Users.findOneAndUpdate({username: username}, {[level]: levelScoresUser}, {new:true}, function(err, doc) {
              if (err) {
                console.log(err)
                res.send("Error: Sorry your score could not be saved.")
                reject()
              } else {
                //console.log("updated user score")
                userBeginner = doc.beginner
                userIntermediate = doc.intermediate
                userExpert = doc.expert
                resolve()
              }
            })
          })
        }

      })

      
  }
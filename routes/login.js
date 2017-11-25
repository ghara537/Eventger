const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const db =  require('../db/db.js');


//
// //Returns users saved results from db
// app.post('/login', function(req, res) {
//   db.findUserEventsAsync(req.body.username)
//     .then(results => res.send(results))
//     .catch(err => res.send(err))
// })


passport.use(new LocalStrategy({passReqToCallback: true},
  function(req, username, password, done) {
    console.log('username and password:', username, password);
    db.findUsernameAsync(username)
      .then(results =>{
        if (results){
          //load hash from db
          db.getHashAsync(username)
            .then(hash =>{
              //compare stored user hash to password
              console.log("hash inside getHashAsync");
              console.log(hash.toString());
              hash = hash.toString();
              bcrypt.compare(password, hash, function(err, res) {
                if (err){ throw new Error('error')}
                if (res === true){
                  return done(null, results, {message: 'user found, password matched'});
                }else{
                  return done(null, false, {message: 'invalid password'});
                }
              });
            })
            .catch((err)=> console.log(err, "error getting hash for this user"));
        }else{
          throw new Error('username not in db');
        }
      })
      .catch(err => done(err, false, {message: 'user not found'}))
  }));

//determines what data from the user object should be stored in the session
passport.serializeUser(function(user, done) {
  console.log(user, "<<<user inside passport.serializeUser <<<<<<");
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('ID inside deserialize', id);
  db.findByIdAsync(id, function(err, user) {
    console.log('user inside deserialize', user);
    done(err, user);
  });
});


//when login is successful
router.post('/',
  passport.authenticate('local', {failureFlash: true, successFlash: true}),
  function(req, res) {
    console.log('authenticated user here!!!!:', req.user);
    res.json(req.user);
  });

router.get('/', (req, res) => {
  res.end();
});

module.exports = router;


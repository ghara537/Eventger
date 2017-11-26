const express = require('express');
const router = express.Router();
const fetchHelpers = require('../api/fetchHelpers.js');
const db =  require('../db/db.js');



router.post('/', function (req, res) {

  console.log('inside get handler');

  // to test a sample req.body from front-end's get request
  let sampleReqBody = {
    queryTermForTM: ['sports', 'music'], // both query Terms are defined by homepage selection upon landing on site
    preferenceForMusicOrLeague: ['Rock', 'Pop', 'Country'], // additional keyword given by user in preferences table [max: 1 word] to narrow down sports or music
    queryTermForYelp: ['food', 'brewery', 'winery', 'hike'], // default Yelp fetch from homepage
    // preferenceForFoodAndOrSetting: 'Mexican', // additional keyword given by user to narrow down type of food
    // activity: 'hiking', // if user doesn't want food but wants an activity - yelp category: https://www.yelp.com/developers/documentation/v2/all_category_list
    city: 'San Francisco',
    postalCode: '94104',
    startDateTime: '2017-01-12T18:00:00Z',
    price: '$$',
  };

  //TODO: Delete sampleReqBody above;

   //reassigning to actual object
  //sampleReqBody  = req.body;

  db.reduceSearchAsync(sampleReqBody, 1)
    .then(sampleReqBody => {

      console.log('Reduced Sample Body', sampleReqBody);


      // fetch ticketmaster data
      return fetchHelpers.getTMData(sampleReqBody)
    }).catch(err => {
    console.log('ERROR in reduceSearchAsync', err)
  }).then(ticketMasterEventsArr => {

    let returnedYelpTMDataObj = {};
    // include TM event data in the object sent back to front-end //
    returnedYelpTMDataObj.ticketmaster = ticketMasterEventsArr;
    return;
  })
    .then(placeholder => {

      // fetch Yelp data
      fetchHelpers.getYelpData(sampleReqBody)
        .then(yelpEventsArr => {

          // include Yelp event data in the object sent back to front-end //
          returnedYelpTMDataObj.yelp = yelpEventsArr;
          return;
        })
        .then(placeholder => {
          res.status(201).send(returnedYelpTMDataObj);
        })
    })

  // solo api testing purposes
  // fetchHelpers.getYelpData(sampleReqBody)
  // .then(response => {
  //   res.status(201).send(response);
  // })

});

module.exports = router;

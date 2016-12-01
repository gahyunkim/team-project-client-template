// Implement your server in this file.
// We should be able to run your server with node src/server.js
// Imports the express Node module.
var express = require('express');
// Creates an Express server.
var app = express();
app.use(express.static('../client/build'));

// Support receiving text in HTTP request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.text());
// Support receiving JSON in HTTP request bodies
app.use(bodyParser.json());
var database = require('./database');
var readDocument = database.readDocument;
var validate = require('express-jsonschema').validate;
var writeDocument = database.writeDocument;
var addDocument = database.addDocument;

/**
* Get the user ID from a token. Returns -1 (an invalid ID)
* if it fails.
*/
function getUserIdFromToken(authorizationLine) {
  try {
    // Cut off "Bearer " from the header value.
    var token = authorizationLine.slice(7);
    // Convert the base64 string to a UTF-8 string.
    var regularString = new Buffer(token, 'base64').toString('utf8');
    // Convert the UTF-8 string into a JavaScript object.
    var tokenObj = JSON.parse(regularString);
    var id = tokenObj['id'];
    // Check that id is a number.
    if (typeof id === 'number') {
      return id;
    }
    else {
      // Not a number. Return -1, an invalid ID.
      return -1;
    }
  } catch (e) {
    // Return an invalid ID.
    return -1;
  }
}

/**
 * Resolves a feed item. Internal to the server, since it's synchronous.
 */
function getItemSync(itemId) {
  var item = readDocument('items', itemId);
  // Resolve 'like' and 'dislike' counter.
  item.likeCounter = item.likeCounter.map((id) => readDocument('users', id));
  item.dislikeCounter = item.dislikeCounter.map((id) => readDocument('users', id));
  item.vendorID = readDocument('users', item.vendorID);
  item.photoID = readDocument('users', item.photoID);
  return item;
}
function getCategorySync(cId){
  var category = readDocument('categories', cId);
  category.items = category.items.map(getItemSync);
  return category;
}
function getFeedData(user) {
  var userData = readDocument('users', user);
  var feedData = readDocument('feeds', userData.feed);
  // While map takes a callback, it is synchronous, not asynchronous.
  // It calls the callback immediately.
  feedData.contents = feedData.contents.map(getItemSync);
  // Return FeedData with resolved references.
  return feedData;
}
/**
 * Get the feed data for a particular user.
*/
app.get('/users/:userid/feed', function(req, res) {
  var userid = req.params.userid;
  var fromUser = getUserIdFromToken(req.get('Authorization'));
  var useridNumber = parseInt(userid, 10);
  if (fromUser === useridNumber) {
      // Send response.
      res.send(getFeedData(userid));
  } else {
      // 401: Unauthorized request.
      res.status(401).end();
  }
});

app.delete('/pm/:userid/item/:itemid', function(res, req) {
  console.log("GOT HERE");
  var fromUser = getUserIdFromToken(req.get('Authorization'));
  var itemId = parseInt(req.params.itemid, 10);
  var item = readDocument('items', itemId);
  var feeds = getCollection("feeds");
  var feedIds = Object.keys('feeds');
  var userId = parseInt(req.params.userid, 10);
  if( fromUser === userId){
    console.log(feedIds);
    feedIds.forEach((feedId) => {
        var feed = feeds[feedId];
        var itemIdx = feed.contents.indexOf(itemId);
        if (itemIdx !== -1) {
        // Splice out of array.
        feed.contents.splice(itemIdx, 1);
        // Update feed.
        database.writeDocument('feeds', feed);
      }
    });
    res.send();
  } else {
    res.status(401).end();
  }
});

/**
* Translate JSON Schema Validation failures into error 400s.
*/
app.use(function(err, req, res, next) {
  if (err.name === 'JsonSchemaValidation') {
    // Set a bad request http response status
    res.status(400).end();
  } else {
    // It's some other sort of error; pass it to next error middleware handler
    next(err);
  }
});
// Reset database.
app.post('/resetdb', function(req, res) {
  console.log("Resetting database...");
  // This is a debug route, so don't do any validation.
  database.resetDatabase();
  // res.send() sends an empty response with status code 200
  res.send();
});

// Starts the server on port 3000!
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

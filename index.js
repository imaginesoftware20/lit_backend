const functions = require('firebase-functions');
const services = require('./services.js');
var service = new services();


/*exports.getinfo = functions.https.onRequest(async (req, res) => {
  
  let code = req.get('key');
  
  const words = service.words(code);

  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});

  const newPost = etc(words[1]);
  //res.send(service.key());
  
  var ref = db.ref("gameinfo/gameid/"+words[1]);
  
  //Retrieve the value from DB
  ref.on("value", (snapshot) => {
    var newPost = snapshot.val();
    //res.send(newPost);
      res.send("USER => " + words[1] + "\nHello " + newPost.alias + " with no " + newPost.playerno + " in game " + newPost.gameid);    
    },
    //Send the error back as respond
    (errorObject) => {
      res.send("The read failed: " + errorObject.code);
      //return errorObject;
    });  

  });*/


// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.database();

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
/*exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    const snapshot = await admin.database().ref('/messages').push({original: original});
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref.toString());
  });*/

//API to Create a Room
exports.createroom = functions.https.onRequest(async (req, res) => {

  // Decode the Key from Header
  let code = req.get('key');
  const words = service.words(code);

  //Check if the hit is genuine
  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});

  //Get the userid from the decoded key
  const userid = words[1];
  
  //Get the values from param
  const logs = req.query.logs;
  
  //Create Gameid of a random string
  const ranstr = service.randomstr(); 

  //Connect to DB
  var ref = db.ref();

  //Insert Values in DB
  var usersRef = ref.child("gamesinfo");
  usersRef.child(ranstr).set({
    game: "litt",
    status: "active",
  });
  
  //Get a shuffled deck of cards
  const shuffle = service.shuffle();

  //Divide the cards between players
  const cards = service.cards(shuffle);

  //Setting value in DB
  var Ref = ref.child(ranstr);
  Ref.set({
    1: { cards: cards.p1 },
    2: { cards: cards.p2 },
    3: { cards: cards.p3 },
    4: { cards: cards.p4 },
    5: { cards: cards.p5 },
    6: { cards: cards.p6 },
    logs: logs,
    turn: 1,
    dropped_sets: "",
    last_transaction_drop: "false",
    score: "0:0"
  });

  //Send the respond back
  res.send({ gameid: ranstr });
  
});


//API to Create a Room
exports.joinroom = functions.https.onRequest(async (req, res) => {
  
  // Decode the Key from Header
  let code = req.get('key');
  const words = service.words(code);

  //Check if the hit is genuine
  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});

  //Get the userid from the decoded key
  const userid = words[1];

  //Get the values from param
  const gameid = req.query.gameid;
  const alias = req.query.alias;
  const playerno = req.query.playerno;

  //Connect to DB
  var ref = db.ref(gameid);
  
  //Update alias in db
  var usersRef = ref.child(playerno);
  usersRef.update({
    "alias": alias,
    "userid": userid
  });

  //Retrieve the cards from DB
  ref.on("value", (snapshot) => {
      
      var newPost = snapshot.val();  
      res.send({ newPost });

    },
    //Send the error back as respond
    (errorObject) => {
      res.send("The read failed: " + errorObject.code);
    });  
  
});
    
exports.transaction = functions.https.onRequest(async (req, res) => {

  // Decode the Key from Header
  let code = req.get('key');
  const words = service.words(code);

  //Check if the hit is genuine
  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});

  //Get the userid from the decoded key
  const userid = words[1];

  //Get the values from param
  const playera = req.query.playera;
  const playerb = req.query.playerb;
  const card    = req.query.card;
  const gameid  = req.query.gameid;

  if((playera%2===0 && playerb%2===0 ) || (playera%2!==0 && playerb%2!==0))
  {
    res.status(400).send({ error: "Players in the same team"});
  }

  service.setdrop(db, gameid, "false");

  //Declare 2 arrays to store cards of the 2 players
  var pa = [], pb = [];

  //Connect to DB
  var ref = db.ref(gameid);

  //Retrieve the cards from DB
  ref.once('value').then(function(snapshot) {
      var newPost = snapshot.val();
      var infoa = newPost[playera];
      var infob = newPost[playerb];
      pa = infoa['cards'];
      pb = infob['cards'];
      
      //Check if the transaction was successful or not
      var success = service.transac(pa, pb, card, db, gameid, playera, playerb);
      service.transf(db, gameid, playerb);
      res.send({ was_successful: success });
    }.catch(() => null),
    //Send the error back as respond
    (errorObject) => {
      res.send("The read failed: " + errorObject.code);
    }).catch(() => null);  

  
});

exports.drop = functions.https.onRequest(async (req, res) => {

  // Decode the Key from Header
  let code = req.get('key');
  const words = service.words(code);

  //Check if the hit is genuine
  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});

  //Get the userid from the decoded key
  const userid = words[1];

  //Get the values from param
  const playera = req.query.playera;
  const playerb = req.query.playerb;
  const playerc = req.query.playerc;
  const cardsa  = req.query.cardsa;
  const cardsb  = req.query.cardsb;
  const cardsc  = req.query.cardsc;
  const gameid  = req.query.gameid;

  if((playera%2===0 && (playerb%2!==0 || playerc%2!==0)) || (playera%2!==0 && (playerb%2===0 || playerc%2===0)))
  {
    res.status(400).send({ error: "Players not in the same team"});
  }

  //Declare 2 arrays to store cards of the 2 players
  var pa = [], pb = [], pc = [], dropped_sets = [];

  //console.log(cardsa);
  //Connect to DB
  var ref = db.ref(gameid);

  //Retrieve the cards from DB
  ref.once('value').then(function(snapshot) {
      var newPost = snapshot.val();
      var infoa = newPost[playera];
      var infob = newPost[playerb];
      var infoc = newPost[playerc];
      var score = newPost['score'];
      dropped_sets = newPost['dropped_sets'];
      pa = infoa['cards'];
      pb = infob['cards'];
      pc = infoc['cards'];

      //Check if the transaction was successful or not
      var success = service.drop(pa, pb, pc, cardsa, cardsb, cardsc, db, gameid, playera, playerb, playerc, score, dropped_sets);
      res.send({ was_successful: success });
    }.catch(() => null),
    //Send the error back as respond
    (errorObject) => {
      res.send("The read failed: " + errorObject.code);
    }).catch(() => null);  

  
});  


exports.transfer = functions.https.onRequest(async (req, res) => {

  // Decode the Key from Header
  let code = req.get('key');
  const words = service.words(code);

  //Check if the hit is genuine
  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});

  //Get the userid from the decoded key
  const userid = words[1];

  //Get the values from param
  const playera = req.query.playera;
  const playerb = req.query.playerb;
  const gameid  = req.query.gameid;

  /*if((playera%2==0 && playerb%2!==0 ) || (playera%2!==0 && playerb%2==0))
  {
    res.status(400).send({ error: "Players not in the same team"});
  }*/

  //Connect to DB
  var ref = db.ref(gameid);

  //Retrieve the cards from DB
  ref.once('value').then(function(snapshot) {
      var newPost = snapshot.val();

      //Check if the transfer is legal or not
      if (newPost[turn] === playera && newPost[last_transaction_drop] === "true")
      {
          //Update player turn in DB
          var success = service.transf(db, gameid, playerb);
          res.send({ was_successful: success });    
      }
      
    }.catch(() => null),
    //Send the error back as respond
    (errorObject) => {
      res.send("The read failed: " + errorObject.code);
    }).catch(() => null);  

  
});


exports.leaveroom = functions.https.onRequest(async (req, res) => {

  // Decode the Key from Header
  let code = req.get('key');
  const words = service.words(code);

  //Check if the hit is genuine
  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});

  //Get the userid from the decoded key
  const userid = words[1];

  //Get the values from param
  const playerno  = req.query.playerno;
  const gameid  = req.query.gameid;

  //Connect to DB
  var ref = db.ref(gameid);
  
  //Update alias in db
  var usersRef = ref.child(playerno);
  usersRef.remove();

  res.status(200).send();
  
});

//firebase deploy --only functions
//curl -X GET -H 'userid: qw13' -v -i 'https://us-central1-litt-276414.cloudfunctions.net/createroom?gameid=123&playerno=2&alias=haha'
//C:\Work\Git_repo\app\src\main\java\com\dojo\lit\lit\model
//YVcxaFoybHVaUzV6YjJaMGQyRnlaUT09OnF3MTI=  
//set GOOGLE_APPLICATION_CREDENTIALS=C:\Work\key.json
//firebase emulators:start --only functions
//https://us-central1-litt-276414.cloudfunctions.net/createroom?logs=2
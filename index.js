const functions = require('firebase-functions');
const services = require('./services.js');
var service = new services();


/*exports.getinfo = functions.https.onRequest(async (req, res) => {
  
  let code = req.get('key');
  const words = service.words(code);
  if(words[0] !== service.key())
  res.status(400).send({ error: "Bhak Bhosadike"});
  const newPost = etc(words[1]);
  
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

exports.checkappversion = functions.https.onRequest(async (req, res) => {
  /**
   * Validating the Key
   */
  let code = req.get('key');
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  var userAppVersion = req.query.appversion;
  
  var ref = db.ref('app_version');

  ref.on("value", (snapshot) => {
      
    var newPost = snapshot.val();  

    if(newPost === userAppVersion) res.send({"forced_update" : false});
    else res.send({"forced_update" : true});

  },
  //Send the error back as respond
  (errorObject) => {
    res.send("The read failed: " + errorObject.code);
  });

  });

//API to Create a Room
exports.createroom = functions.https.onRequest(async (req, res) => {
  /**
   * Validating the Key
   */
  let code = req.get('key');
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  //Get the userid from the decoded key
  const words = service.words(code);
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
    1: { cards: cards.p1, "no_of_cards": 9, "alias": "p1", "userid": "-" },
    2: { cards: cards.p2, "no_of_cards": 9, "alias": "p2", "userid": "-" },
    3: { cards: cards.p3, "no_of_cards": 9, "alias": "p3", "userid": "-" },
    4: { cards: cards.p4, "no_of_cards": 9, "alias": "p4", "userid": "-" },
    5: { cards: cards.p5, "no_of_cards": 9, "alias": "p5", "userid": "-" },
    6: { cards: cards.p6, "no_of_cards": 9, "alias": "p6", "userid": "-" },
    logs_count: parseInt(logs),
    logs: ["none"],
    turn: 1,
    dropped_sets: ["none"],
    last_transaction_drop: null,
    score_odd: 0,
    score_even: 0
  });

  //Send the respond back
  res.send({ gameid: ranstr });
  
});

//API for a rematch
exports.rematch = functions.https.onRequest(async (req, res) => {
  /**
   * Validating the Key
   */
  let code = req.get('key');
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  //Connect to DB
  var ref = db.ref();
  
  //Create Gameid of a random string
  const gameID = req.query.gameid; 
  
  //Get a shuffled deck of cards
  const shuffle = service.shuffle();

  //Divide the cards between players
  const cards = service.cards(shuffle);

  //Setting value in DB
  var Ref = ref.child(gameID);
  Ref.update({
    logs: ["none"],
    turn: 1,
    dropped_sets: ["none"],
    last_transaction_drop: null,
    score_odd: 0, 
    score_even: 0
  });

  for(player=1;player<=6;player++){
      var playerRef = Ref.child(player);
      var playersCards;

      if(player === 1) playersCards = cards.p1;
      else if(player === 2) playersCards = cards.p2;
      else if(player === 3) playersCards = cards.p3;
      else if(player === 4) playersCards = cards.p4;
      else if(player === 5) playersCards = cards.p5;
      else if(player === 6) playersCards = cards.p6; 

      playerRef.update({
        "no_of_cards": 9,
        "cards": playersCards
      });
  }

  //Send the respond back
  res.send({ gameid: gameID });
  
});


//API to Create a Room
exports.joinroom = functions.https.onRequest(async (req, res) => {
  /**
   * Validating the Key
   */
  let code = req.get('key');
  
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  //Get the userid from the decoded key
  const words = service.words(code);
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
  /**
   * Validating the Key
   */
  let code = req.get('key');
  
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  //Get the userid from the decoded key
  const words = service.words(code);
  const userid = words[1];

  //Get the values from param
  const playera = req.query.playera;
  const playerb = req.query.playerb;
  const card    = req.query.card;
  const gameid  = req.query.gameid;

  if((playera%2===0 && playerb%2===0 ) || (playera%2!==0 && playerb%2!==0))
  {
    res.status(400).send({ error: "Players in the same team"}).end();
    return;
  }

  service.setdrop(db, gameid, null);

  //Declare 2 arrays to store cards of the 2 players
  var pa = [], pb = [];

  try
  {
    //Connect to DB
    var ref = db.ref(gameid);

    //Retrieve the cards from DB
    ref.once('value').then((snapshot) => {
        var newPost = snapshot.val();
        var pa = newPost[playera]['cards'];
        var pb = newPost[playerb]['cards'];
        var logs = newPost['logs'];
        var logs_count = newPost['logs_count'];
        var aliasa = newPost[playera]['alias'];
        var aliasb = newPost[playerb]['alias'];
        
        //Check if the transaction was successful or not
        var success = service.transac(pa, pb, card, db, gameid, playera, playerb, aliasa, aliasb, logs, logs_count);
        if(success === false)
        {
          service.transf(db, gameid, playerb);
        }
        res.send({ was_successful: success });
        return null;
      },
      //Send the error back as respond
      (errorObject) => {
        res.send("The read failed: " + errorObject.code);
      }).catch(() => null);  
  }
  catch(err)
  {
      console.log(err + "     \n    " + err.message);
  }
  
});

exports.drop = functions.https.onRequest(async (req, res) => {
  /**
   * Validating the Key
   */
  let code = req.get('key');
  
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  //Get the userid from the decoded key
  const words = service.words(code);
  const userid = words[1];

  //Get the values from param
  const playera = req.query.playera;
  const playerb = req.query.playerb;
  const playerc = req.query.playerc;
  var cardsa = req.query.cardsa;
  var cardsb = req.query.cardsb;
  var cardsc = req.query.cardsc;
  const gameid  = req.query.gameid;

  if(cardsa === undefined)
  {
    cardsa = [];
  }
  else cardsa = cardsa.split(",");
  if(cardsb === undefined)
  {
    cardsb = [];
  }
  else cardsb = cardsb.split(",");
  if(cardsc === undefined)
  {
    cardsc = [];
  }
  else cardsc = cardsc.split(",");

  if((playera%2===0 && (playerb%2!==0 || playerc%2!==0)) || (playera%2!==0 && (playerb%2===0 || playerc%2===0)))
  {
    res.status(400).send({ error: "Players not in the same team"}).end();
    return;
  }

  //Declare 2 arrays to store cards of the 2 players
  var pa = [], pb = [], pc = [], pd = [], pe = [], pf = [], playerd, playere, playerf, dropped_sets = [];

  if(playera%2===0)
  {
    playerd = 1;
    playere = 3;
    playerf = 5;
  }
  else
  {
    playerd = 2;
    playere = 4;
    playerf = 6;
  }

  try
  {
    //Connect to DB
    var ref = db.ref(gameid);

    //Retrieve the cards from DB
    ref.once('value').then((snapshot) => {
        var newPost = snapshot.val();

        var plcards = new Map([ [playera,newPost[playera]['cards']], [playerb,newPost[playerb]['cards']],
                                [playerc,newPost[playerc]['cards']], [playerd,newPost[playerd]['cards']],
                                [playere,newPost[playere]['cards']], [playerf,newPost[playerf]['cards']] ]); 

        var logs = newPost['logs'];
        var logs_count = newPost['logs_count'];
        var turn = newPost['turn'];
        var aliasa = newPost[turn]['alias'];
        var score_odd = newPost['score_odd'];
        var score_even = newPost['score_even'];
        dropped_sets = newPost['dropped_sets'];
        
        var current_dropped_set = service.set_name(cardsa,cardsb,cardsc);
        var setName = service.edit_set_name(current_dropped_set);
        //Check if the transaction was successful or not
        var success = service.drop(cardsa, cardsb, cardsc, db, gameid, dropped_sets, plcards, setName);
        service.setscore(playera, db, gameid, success, score_odd, score_even);
        
        var current_log;
        if (success === true)
        {
          current_log = aliasa + " correctly dropped the set " + setName;
          service.update_logs(db, gameid, logs, logs_count, current_log);
          service.setdrop(db, gameid, true);
        }
        else
        {
          current_log = aliasa + " incorrectly dropped " + setName;
          service.update_logs(db, gameid, logs, logs_count, current_log);
          service.wrongdrop(db, gameid, current_dropped_set, plcards);
          service.setdrop(db, gameid, false);
        }

        res.send({ was_successful: success });
        return null;
      },
      //Send the error back as respond
      (errorObject) => {
        res.send("The read failed: " + errorObject.code);
      }).catch(() => null);  
  }
  catch(err)
  {
      console.log(err + "     \n    " + err.message);
  }
  
});  


exports.transfer = functions.https.onRequest(async (req, res) => {
  /**
   * Validating the Key
   */
  let code = req.get('key');
  
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  //Get the userid from the decoded key
  const words  = service.words(code);
  const userid = words[1];

  //Get the values from param
  const playera = req.query.playera;
  const playerb = req.query.playerb;
  const gameid  = req.query.gameid;


  try
  {
    //Connect to DB
    var ref = db.ref(gameid);

    //Retrieve the cards from DB
    ref.once('value').then((snapshot) => {
        var newPost = snapshot.val();

        console.log(newPost['turn']);
        console.log(newPost['last_transaction_drop']);
        //Check if the transfer is legal or not
        if ((newPost['turn'] === parseInt(playera)) && (newPost['last_transaction_drop'] === true || newPost['last_transaction_drop'] === false))
        {
            //Update player turn in DB
            var success = service.transf(db, gameid, playerb);
            res.send({ was_successful: success });    
        }
        else
        {
            res.status(400).send({ error: "Transfer not legal"}).end();
            return;
        }
        if((playera%2===0 && playerb%2===0 ) || (playera%2!==0 && playerb%2!==0))
        {
            service.setdrop(db, gameid, null);
        }
        else
        {
            service.setdrop(db, gameid, true);
        }
        return;
      },
      //Send the error back as respond
      (errorObject) => {
        res.send("The read failed: " + errorObject.code);
      }).catch(() => null);  
  }
  catch(err)
  {
      console.log(err + "     \n    " + err.message);
  }
  
});


exports.leaveroom = functions.https.onRequest(async (req, res) => {
  /**
   * Validating the Key
   */
  let code = req.get('key');
  
  if(service.validate_key(code) === false){
    res.status(400).send({ error: "Bhak Bhosadike"}).end();
    return;
  }

  //Get the userid from the decoded key
  const words = service.words(code);
  const userid = words[1];

  //Get the values from param
  const playerno  = req.query.playerno;
  const gameid  = req.query.gameid;

  //Connect to DB
  var ref = db.ref(gameid);
  
  //Update alias in db
  var usersRef = ref.child(playerno);
  usersRef.update({
    "connected": false
  });

  // var allDisconnected = service.checkIfAllDisconnected(ref);

  // console.log(allDisconnected);

  // if(allDisconnected === true){
  //   console.log("All disconnected");
    // db.ref().child(gameid).remove();
    // gamesInfoRef = db.ref("gamesinfo");
    // gamesInfoRef.child(gameid).update({
    //     status: "inactive"
    // });
  // }else{
  //   console.log("Not all disconnected");
  // }

  res.status(200).send();
  
});

//firebase deploy --only functions
//C:\Work\Git_repo\app\src\main\java\com\dojo\lit\lit\model
//YVcxaFoybHVaUzV6YjJaMGQyRnlaUT09OnF3MTI=  
//set GOOGLE_APPLICATION_CREDENTIALS=C:\Work\key.json
//firebase emulators:start --only functions
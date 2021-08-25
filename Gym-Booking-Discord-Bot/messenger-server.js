'use strict';

const {
  axios,
  config,
  bot,
  discordToken,
  facebookToken,
  PREFIX,
  execSync,
  exec,
  fs,
  db,
  dbName,
  guildId,
  premiumRoleId,
  accessToken,
  discordAccessToken,
  dbAuditName,
  Client
} = require("./constants.js")

const { 
  endUpdateUserMessage,
    sendCreateUserMessage,
    sendConfigErrorMessage,
    sendFieldErrorMessage,
    sendInvalidTimeMessage,
    sendHelpMessage,
    sendDonationErrorMessage,
    sendLocationsMessage,
    sendInvalidLocationMessage,
    sendInvalidGymMessage,
    sendInvalidLoginMessage,
    sendGymClosedMessage,
    sendMaxBookedMessage,
    sendDefaultMessage,
    sendNewConfigMessage,
    sendConfigGym,
    sendConfigEmail,
    sendConfigPassword,
    sendConfigLocation,
    sendConfigLocationBackup,
    sendConfigStart,
    sendConfigEnd,
    sendUpgradeMessage,
    sendConfigWeekendStart,
    sendConfigWeekendEnd,
    sendLockDownMessage,
    sendCancelConfig,
    sendAvailabilityNotification
} = require("./chat-messages.js");

const { 
  getConfig, 
  setConfig, 
  updateField,
  book, 
  checkReserved,
  autobookToggle, 
} = require("./commands.js");

const { 
  isSubscriber, startSubscription, endSubscription
} = require("./subscriber-helpers.js");

const { 
  isValidGym,
  isValidLocation,
  isValidTime,
  isValidLogin,
  isUser,
  getGym,
  getAutobookStatus,
} = require("./valid-checkers.js");

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 3000, () => console.log('BMB MESSENGER: Webhook is listening at http://localhost:3000'));

// For config new command
app.post('/command/autobook', (req, res) => { 
  console.log("POST commands/autobook")
  console.log(req.headers);
  
  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"
  
  res.json({ "autobook": autobookToggle(client)}).status(200);
})

app.post('/command/book', (req, res) => { 
  console.log("POST commands/book")
  console.log(req.headers);
  
  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"
  
  res.json({ "book": book(client)}).status(200);
})

app.post('/command/config', (req, res) => { 
  console.log("POST command/config")
  console.log(req.body);

  let client = Object.create(Client);

  client.username=req.body.username
  client.userid=req.body.userid
  client.platform="Facebook"
  client.gym=req.body.gym.toLowerCase().replace(/\s/g, '')
  client.email=req.body.email
  client.password=req.body.password
  client.location=req.body.location
  client.locationBackup=req.body.locationBackup
  client.begin=req.body.begin
  client.end=req.body.end
  client.beginWeekend=req.body.beginWeekend
  client.endWeekend=req.body.endWeekend

  // console.log(client)
  // Can omit - we already verify and hit the verify endpoint within manychat interface
  // if (!isValidGym(client.gym)){
  //   sendInvalidGymMessage(client);
  //   sendCancelConfig(client)
  // }else if (!isValidLogin(client)){
  //   sendInvalidLoginMessage(client);
  //   sendCancelConfig(client)
  // }else if (!(isValidLocation(client, client.location) && isValidLocation(client, client.locationBackup))){
  //   sendInvalidLocationMessage(client);
  //   sendCancelConfig(client)
  // }else if (!(isValidTime(client.begin) && isValidTime(client.end) && isValidTime(client.beginWeekend) && isValidTime(client.endWeekend))){
  //   sendInvalidTimeMessage(client);
  //   sendCancelConfig(client)
  // }
  // else
  res.json({ "configNew": setConfig(client)}).status(200);
  
});

app.get('/command/config', (req, res) => { 
  console.log("GET commands/config")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"

  res.json({ "getConfig": getConfig(client)}).status(200);
})

app.put('/command/config', (req, res) => {
  console.log("PUT commands/config")
  console.log(req.headers); 
  console.log(req.body);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"
  var data=[]

  Object.keys(req.body).forEach(function(key){

    let configKey=key
    let configValue=req.body[key]

    switch (configKey) {
        case "gym":
            data.push( updateField(client, "gym", configValue.toLowerCase().replace(/\s/g, '')));
            break;
            
        case "email":
          data.push( updateField(client, "email", configValue));
            break;
  
        case "password":
          data.push( updateField(client, "password", configValue));
            break;
  
        case "location":
          data.push( updateField(client, "location", configValue));
            break;
  
        case "locationBackup":
          data.push( updateField(client, "locationBackup", configValue));
            break;
  
        case "begin":
          data.push( updateField(client, "begin", configValue));
            break;
  
        case "end":
          data.push( updateField(client, "end", configValue));
            break;
  
        case "beginWeekend":
          data.push( updateField(client, "beginWeekend", configValue));
            break;
  
        case "endWeekend":
          data.push( updateField(client, "endWeekend", configValue));
            break;
  
        default:
            sendFieldErrorMessage(client, configKey, configValue);
            res.json({ "config": {code: 1, desc: "Invalid Field"} });
            break;
    }
  })

  res.json({ "config": data }).status(200);  
});

app.get('/command/reserved', (req, res) => { 
  console.log("GET /commands/reserved")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"

  res.json({ "reserved": checkReserved(client) }).status(200);
});

app.get('/isUser', (req, res) => { 
  console.log("GET /isUser")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"

  if (isUser(client)){
    let current= getAutobookStatus(client);
    var future;
    if (current == "OFF")
      future = "ON"
    else
      future = "OFF"

    res.json({ 
      "isUser": isUser(client), 
      "getConfig": getConfig(client), 
      "isAutobook": current,
      "isAutobookNot": future
    }).status(200);

  }else{
    res.json({ "isUser": false }).status(200);
  }
});

app.get('/isAutobook', (req, res) => { 
  console.log("GET /isAutobook")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"

  let current= getAutobookStatus(client);
  var future;
  if (current == "OFF")
    future = "ON"
  else
    future = "OFF"
  

  res.json({ 
      "isAutobook": current,
      "isAutobookNot": future}
  ).status(200);
});


app.get('/isValidTime', (req, res) => { 
  console.log("GET /isValidTime")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  let time=req.headers["time"]
  client.platform="Facebook"

  res.json({ "isValidTime": isValidTime(time) }).status(200);
});

app.get('/isValidLocation', (req, res) => { 
  console.log("GET /isValidLocation")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.gym=req.headers["gym"].toLowerCase().replace(/\s/g, '')
  let location=req.headers["location"]
  client.platform="Facebook"

  res.json({ "isValidLocation": isValidLocation(client, location) }).status(200);
});

app.get('/isValidLogin', (req, res) => { 
  console.log("GET /isValidLogin")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.gym=req.headers["gym"].toLowerCase().replace(/\s/g, '')
  client.email=req.headers["email"]
  client.password=req.headers["password"]
  client.platform="Facebook"

  res.json({ "isValidLogin": isValidLogin(client) }).status(200);
});

app.get('/isSubscriber', (req, res) => { 
  console.log("GET /isSubscriber")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"

  res.json({ "isSubscriber": isSubscriber(client) }).status(200);
});

app.get('/getGym', (req, res) => { 
  console.log("GET /getGym")
  console.log(req.headers);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"

  var gym;
  switch (getGym(client)){
    case "lafitness":
      gym="LA Fitness"
      break;
    case "crunchfitness":
      gym="Crunch Fitness"
      break;
    case "fi4less":
      gym="Fit4Less"
      break;
  }

  res.json({ gym }).status(200);
});

app.post('/subscribe', (req, res) => { 
  console.log("POST /subscribe")
  console.log(req.body);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  let timestamp=req.body.timestamp
  client.platform="Facebook"
  
  res.json({ "subscribed": startSubscription(timestamp, client) }).status(200);
});

// Unused for now
app.post('/unsubscribe', (req, res) => { 
  console.log("POST /unsubscribe")
  console.log(req.body);

  let client = Object.create(Client);
  client.username=req.headers["username"]
  client.userid=req.headers["userid"]
  client.platform="Facebook"
  
  res.json({ "unsubscribed": endSubscription(client) }).status(200);
});

app.post('/messages', (req, res) => { 

  let body = req.body;
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      let webhook_event = entry.messaging[0];
      // console.log(webhook_event);
      
      console.log("--------------------------------------------------------\n[USER MESSAGE]");
      
      let text = webhook_event.message.text

      let client = Object.create(Client);
      client.userid=webhook_event.sender.id
      client.platform="Facebook"
      console.log("userid:" + client.userid);
      console.log("user input:" + text);
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/messages', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "test"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      res.sendStatus(403);      
    }
  }
});



//Payments


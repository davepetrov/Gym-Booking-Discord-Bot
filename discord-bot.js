const {Client, MessageEmbed} = require('discord.js');
const bot = new Client();
const exec = require('child_process').exec
let PREFIX = "!";
let db = require('better-sqlite3')('./db/fit.db');

function setConfig(message, userid, email, password, location, begin, end){
    console.log("setConfig");
    
    if (!isFit4lessUser(userid)){
        console.log("not user, creating");
        // add new entry
        db.prepare(`INSERT INTO USER (discordId, email, password, location, begin, end) VALUES ('${userid}', '${email}', '${password}', '${location}', '${begin}', '${end}')`).run();
        
        const configsetmsg = new MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x61bf33)
            .setDescription('Setting up new config for you. You can now use !book to book');
        message.author.send(configsetmsg); 
    }
    else{
        console.log("is user, updating");
        // update the config
        db.prepare(`UPDATE USER SET email='${email}', password='${password}', location='${location}', begin='${begin}', end='${end}' WHERE discordId='${userid}'`).run();
        
        const configsetmsg = new MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x009cdf)
            .setDescription('Updating your existing config. You can now use !book to book');
        message.author.send(configsetmsg); 
    }
    return;
}

function sendConfigErrorMessage(message){
    console.log("sendConfigErrorMessage");

    const configmsg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription('Dont forget to setup your configuration using !config');

    message.author.send(configmsg);
    return;
}

function sendFieldErrorMessage(message, field){
    console.log("sendConfigErrorMessage");

    const configmsg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription(`Field ${field} is not a valid configuration, please check !help`);

    message.author.send(configmsg);
    return;
}

function sendHelpMessage(message){
    console.log("sendHelpMessage");

    const helpmsg = new MessageEmbed()
        .setTitle("HELP")
        .setColor(0xff0000)
        .setDescription(
            'Setup saved configuration: !config [EMAIL]  [PASSWORD] [EXACT FIT4LESS LOCATION]  [MINIMUM TIME RANGE (24hr)]  [MAXIMUM  TIME RANGE (24hr)]'+
            'Book manually: !book'+
            'Toggle booking automatically: !autobook'+
            'Check your booked times: !reserved'+
            'Get all possible locations: !locations'+
            'More help: !help');

    message.author.send(helpmsg);
    return;
}

function sendLocationsMessage(message){
    console.log("sendLocationsMessage");

    message.author.send("Available Locations", {
        files:['./locations.txt']
    });
    message.author.send("Copy the location and use that as a location argument when using !book")
}

function sendDefaultMessage(message){
    console.log("sendDefaultMessage");
    const errormsg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription('Use help for correct usage(s)');

    message.author.send(errormsg);
    return;
}

function isFit4lessUser(discordId){
    
    // TODO: Fix this. Does this return 0 or false/ 1 or true
    const a = db.prepare(`SELECT * FROM USER WHERE discordId=${discordId}`).get();
    return a!=undefined;
}

function book(message, discordId){

    if (!isFit4lessUser(userid)){
        sendConfigErrorMessage(message);
        return;
    }

    console.log("book");
    var email =  db.prepare('SELECT email FROM USER WHERE discordId='+discordId).get()
    var password =  db.prepare('SELECT password FROM USER WHERE discordId='+discordId).get()
    var location =  db.prepare('SELECT location FROM USER WHERE discordId='+discordId).get()
    var begin =  db.prepare('SELECT begin FROM USER WHERE discordId='+discordId).get()
    var end =  db.prepare('SELECT end FROM USER WHERE discordId='+discordId).get()

    if (message!=null){
        const publicmsg = new MessageEmbed()
        .setTitle('Booking set for user '+email+'at '+location+' from '+begin+' to '+end)
        .setColor(0xff0000)
        .setDescription(("Checking Fit4less for available times, this may take a minute..."));

        message.reply(publicmsg); //Public
    }

    exec('python3 fit4less-workout-booker.py book '+password+ ''+email+ +location+ ''+begin+ ''+end,
        function (error, stdout, stderr) {
            if (message!=null){
                const bookingMsg = new MessageEmbed()
                    .setTitle("You are booked for the following times")
                    .setColor(0xffa500)
                    .setDescription((stdout));
                
                message.author.send(bookingMsg) //private
            }
            if (error !== null) {
                console.log('exec error: ' + error);
            }
    });
    
}

function checkReserved(message, discordId){
    if (!isFit4lessUser(userid)){
        sendConfigErrorMessage(message);
        return;
    }

    console.log("checkReserved");
    var email =  db.prepare("SELECT email FROM USER WHERE discordId="+discordId).run();
    var password =  db.prepare("SELECT password FROM USER WHERE discordId="+discordId).run();

    console.log(email, password);

    if (message != null){
        const publicmsg = new MessageEmbed()
            .setTitle("Checking Fit4less for reserved times, this may take a minute...")
            .setColor(0xff0000);
        message.author.send(publicmsg);
    }
    exec('python3 fit4less-workout-booker.py reserved'+' '+password+' '+email,
        function (error, stdout, stderr) {
            if (message!=null){
                const reservedmessage = new MessageEmbed()
                    .setTitle("You are booked for the following times")
                    .setColor(0xffa500)
                    .setDescription((stdout));
                message.author.send(reservedmessage) //private
            }
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
}

function autobookToggle(message, userid){

    if (!isFit4lessUser(userid)){
        sendConfigErrorMessage(message);
        return;
    }

    var togglevalue =  db.prepare(`SELECT autobook FROM USER WHERE discordId=${userid}`).get().autobook;
    var newtogglevalue = (togglevalue===0) ? 1 : 0
    db.prepare(`UPDATE USER SET autobook=${newtogglevalue} WHERE discordId=${userid}`).run();

    console.log(togglevalue, "->", newtogglevalue);
    if (newtogglevalue===0){
        const togglemsg = new MessageEmbed()
            .setTitle("AUTOBOOK")
            .setColor(0xFF0000) 
            .setDescription(`Autobook feature Toggled OFF - You will have to manually use !book to book for the next 3 days`);
        message.author.send(togglemsg) ;

    }else{
        const togglemsg = new MessageEmbed()
            .setTitle("AUTOBOOK")
            .setColor(0x00FF00) 
            .setDescription(`Autobook feature Toggled ON - You will now be autobooked and guarenteed a spot until this feature is toggled off`);
        message.author.send(togglemsg) ;
    }
    return;
}

function updateField(message, userid, fieldKey, fieldVal){

    if (!isFit4lessUser(userid)){
        sendConfigErrorMessage(message);
        return;
    }

    const updatemsg = new MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x009cdf) 
            .setDescription(`Updating your config ${fieldKey} with ${fieldVal}`);
        message.author.send(updatemsg) ;

    db.prepare(`UPDATE USER SET ${fieldKey}=${fieldVal} WHERE discordId=${userid}`).run();
    return;
}

// Bot online msg
bot.on('ready', () =>{
    console.log("Fit4Less Bot is now Online with new updates");
})

// Bot recieves prompt
bot.on('message', message=>{  
    console.log("---------------------------\n")
    if (!message.content.startsWith(PREFIX)) return; // Not a command

    var username = message.author.username;
    console.log("username:"+username)
    var userid = message.author.id;
    console.log("userid:"+userid)

    let args = message.content.substring(PREFIX.length).split(" ");
    
    switch (args[0]){
        case 'config': 
            if (args.length >=2){
                switch (args[0]){
                    case "-email":
                        updateField(message, userid, "email", val);
                        break;

                    case "-password":
                        updateField(message, userid, "password", val);
                        break;

                    case "-location":
                        updateField(message, userid, "location", val);
                        break;

                    case "-begin":
                        updateField(message, userid, "begin", val);
                        break;

                    case "-end":
                        updateField(message, userid, "email", val);
                        break;

                    default:
                        sendFieldErrorMessage(message, args[0]);
                        break
                }
            }
            if (args.length!=6){
                sendHelpMessage(message);
                break;
            }
            var email =  args[1];
            var password =  args[2];
            var location =  args[3];
            var begin =  args[4];
            var end =  args[5];
            setConfig(message, userid, email, password, location, begin, end);
            break;
            
        case 'autobook':
            //Toggle Autobooking
            autobookToggle(message, userid);
            break;

        case 'book': //Books the time for you within the specfic time range
            //book with all the config
            book(message, userid);
            break;

        case 'reserved': //Lists you the times you are current booked for
            //check reserved times with all the config
            checkReserved(message, userid);
            break;

        case 'locations':
            sendLocationsMessage(message);
            break;

        case 'help':
            sendHelpMessage(message);
            break;
            
        default:
            sendDefaultMessage();
    }  
})

// Create an event listener for new guild members
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    if (!channel) return;

    // Send the message, mentioning the member
    channel.send(`Welcome to Fit4Less Bot Server, ${member}`);
});

// Autobook for all the users with autobooking toggled on
setInterval(function(){
    console.log("checking interbal stuff");
    var date = new Date(); // Create a Date object to find out what time it is
    var datezone = date.getTime() + (date.getTimezoneOffset() * 60000);
    var estDate = new Date(datezone - (3600000*5));

    //Book at 12:00am EST
    if(estDate.getHours() === 0 && estDate.getMinutes()===1){ 
        var toggledUsers = db.prepare("Select * from USER on USER.autobook=1").all();
        for (var user in toggledUsers){
            console.log(`Autobooked for ${user.discordId}`);
            book(null, user.discordId);
        }
    }
}, 60000); // Repeat every 60000 milliseconds (1 min)

//Run
const fs = require('fs');
const data = fs.readFileSync('discord-hidden-key.txt', 'UTF-8');
const lines = data.split(/\r?\n/);
lines.forEach((line) => {
    var token = line;
    bot.login(token);
});

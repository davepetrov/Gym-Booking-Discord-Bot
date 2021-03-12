const {Client, MessageEmbed} = require('discord.js');
const bot = new Client();
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
let PREFIX = "!";
let db = require('better-sqlite3')('./db/fit.db');
let dbName="USER"; // TEST for testing OR USER for deploy

function setConfig(message, userid, email, password, location, begin, end){

    if (!/^([01]\d|2[0-3]):?([0-5]\d)$/.test(begin) || !/^([01]\d|2[0-3]):?([0-5]\d)$/.test(end)){
        sendFormatErrorMessage(message);
        return;
    }
    console.log("setConfig");
    
    if (!isFit4lessUser(userid)){
        console.log("not user, creating");
        // add new entry
        db.prepare(`INSERT INTO ${dbName} (discordId, email, password, location, begin, end) VALUES ('${userid}', '${email}', '${password}', '${location}', '${begin}', '${end}')`).run();
        
        const msg = new MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x61bf33)
            .setDescription('Setting up new config for you. *You can now use !book to book*');
        message.author.send(msg); 
    }
    else{
        console.log("Is user, updating");
        // update the config
        db.prepare(`UPDATE ${dbName} SET email='${email}', password='${password}', location='${location}', begin='${begin}', end='${end}' WHERE discordId='${userid}'`).run();
        
        const msg = new MessageEmbed()
            .setTitle(":muscle:CONFIG:muscle:")
            .setColor(0x009cdf)
            .setDescription('Updating your existing config. *You can now use !book to book*');
        message.author.send(msg); 
    }
    return;
}

function sendConfigErrorMessage(message){
    console.log("sendConfigErrorMessage");

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription('Dont forget to setup your configuration using !config');

    message.author.send(msg);
    return;
}

function sendFieldErrorMessage(message, field){
    console.log("sendFieldErrorMessage");

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription(`Field ${field} is not a valid configuration, *please check !help* `);

    message.author.send(msg);
    return;
}

function sendFormatErrorMessage(message){
    console.log("sendFieldErrorMessage");

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription(`Your time slot time is in the wrong format. ##:## format is accepted`);

    message.author.send(msg);
    return;
}

function sendHelpMessage(message){
    console.log("sendHelpMessage");

    const msg = new MessageEmbed()
        .setTitle(":question:HELP:question:")
        .setColor(0xff0000)
        .setDescription('Check out my github for a list of all available commands, with a full description of what each command does:\n https://github.com/davepetrov/Gym-Booking-Discord-Bot');

    message.author.send(msg);
    return;
}

function sendLocationsMessage(message){
    console.log("sendLocationsMessage");

    message.author.send("Available Locations", {
        files:['./locations.txt']
    });
    message.author.send("Copy the location and use that as a location ar+gument when using !book")
}

function sendDefaultMessage(message){
    console.log(":grey_question:sendDefaultMessage:grey_question:");
    const msg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription('Use help for correct usage(s)');

    message.author.send(msg);
    return;
}

function isFit4lessUser(discordId){
    const user = db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get();
    return user!=undefined;
}

function book(message, discordId){
    if (!isFit4lessUser(discordId)){
        sendConfigErrorMessage(message);
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get()

    console.log("Performing action on", user.email, user.password);
    if (message!=null){
        console.log("Booking time for user manually");

        const msg = new MessageEmbed()
        .setTitle(`:muscle:Booking:muscle:`)
        .setColor(0xff0000)
        .setDescription((`Checking Fit4less for available times, this may take a few seconds \nBooking set for  ${message.author.username} at ${user.location}`));

        message.reply(msg); //Public
    }
    else{
        console.log("Booking time for user automatically");
    }

    execSync(`python3 handler.py fit4less book ${user.password} ${user.email} ${user.location} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            console.log("Booking complete")
    });

    if (message!=null){
        checkReserved(message,discordId);
    }
    
}

function autobook(discordId){
    if (!isFit4lessUser(discordId)){
        console.log("not user")
        return;
    }
    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get()

    console.log("Performing action on", user.email, user.password);
    console.log("Booking time for user automatically");
    

    exec(`python3 handler.py fit4less autobook ${user.password} ${user.email} ${user.location} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error, stderr);
            }
            console.log("Booking complete")
    });
    
}

function checkReserved(message, discordId){
    if (!isFit4lessUser(discordId)){
        sendConfigErrorMessage(message);
        return;
    }

    console.log("checkReserved");
    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get();

    exec(`python3 handler.py fit4less reserved ${user.password} ${user.email}`,
        function (error, stdout, stderr) {
            if (message!=null){
                const msg = new MessageEmbed()
                    .setTitle(":grey_exclamation:Future bookings:grey_exclamation:")
                    .setColor(0xffa500)
                    .setDescription((stdout)+"\n Check your reserved times on the [Fit4less](https://myfit4less.gymmanager.com/portal/booking/index.asp?) site ");
                message.author.send(msg) //private
            }
            if (error !== null) {
                console.log('exec error: ' + error, stderr);
            }
            else{
                console.log(stdout)
                console.log("Checking reserved complete")
            }
        });
}

function autobookToggle(message, userid){
    console.log("autobook toggle")

    if (!isFit4lessUser(userid)){
        sendConfigErrorMessage(message);
        return;
    }

    var togglevalue =  db.prepare(`SELECT autobook FROM ${dbName} WHERE discordId=${userid}`).get().autobook;
    var newtogglevalue = (togglevalue===0) ? 1 : 0
    db.prepare(`UPDATE ${dbName} SET autobook=${newtogglevalue} WHERE discordId=${userid}`).run();

    console.log(togglevalue, "->", newtogglevalue);
    if (newtogglevalue===0){
        const msg = new MessageEmbed()
            .setTitle(":dash:AUTOBOOK:dash:")
            .setColor(0xFF0000) 
            .setDescription(`Autobook feature Toggled OFF - *You will have to manually use !book to book for the next 3 days*`);
        message.author.send(msg) ;

    }else{
        const msg = new MessageEmbed()
            .setTitle(":fire:AUTOBOOK:fire:")
            .setColor(0x00FF00) 
            .setDescription(`Autobook feature Toggled ON - *You will now be autobooked and guaranteed a spot until this feature is toggled off*`);
        message.author.send(msg) ;
    }
    return;
}

function updateField(message, userid, fieldKey, fieldVal){

    if (fieldKey=="begin" || fieldKey=="end"){
        var time = fieldVal;
        if (!/^([01]\d|2[0-3]):?([0-5]\d)$/.test(time)){
            sendFormatErrorMessage(message);
            return;
        }

    }
    console.log(`updating field: ${fieldKey}: ${fieldVal}`);

    if (!isFit4lessUser(userid)){
        sendConfigErrorMessage(message);
        return;
    }

    const msg = new MessageEmbed()
        .setTitle("CONFIG")
        .setColor(0x009cdf) 
        .setDescription(`Updating your config **${fieldKey}** with **${fieldVal}**`);
    message.author.send(msg) ;

    db.prepare(`UPDATE ${dbName} SET ${fieldKey}='${fieldVal}' WHERE discordId=${userid}`).run();
    return;
}

// Bot online msg
bot.on('ready', () =>{
    console.log("Fit4Less Bot is now Online with new updates");
})

// Bot recieves prompt
bot.on('message', message=>{  
    if (!message.content.startsWith(PREFIX)) return; // Not a command
    console.log("\n")

    var username = message.author.username;
    console.log("username:"+username)
    var userid = message.author.id;
    console.log("userid:"+userid)

    let args = message.content.substring(PREFIX.length).split(" ");
    
    switch (args[0]){
        case 'config': 
            if (args.length == 3){
                switch (args[1]){
                    case "-email":
                        updateField(message, userid, "email", args[2]);
                        break;

                    case "-password":
                        updateField(message, userid, "password", args[2]);
                        break;

                    case "-location":
                        updateField(message, userid, "location", args[2]);
                        break;

                    case "-begin":
                        updateField(message, userid, "begin", args[2]);
                        break;

                    case "-end":
                        updateField(message, userid, "end", args[2]);
                        break;

                    default:
                        sendFieldErrorMessage(message, args[2]);
                        break;
                }
                break;
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
            sendDefaultMessage(message);
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
    console.log("[Checking  autobook...]")
    var date = new Date(); // Create a Date object to find out what time it is
    var datezone = date.getTime() + (date.getTimezoneOffset() * 60000);
    var estDate = new Date(datezone - (3600000*5));

    //Book at 12:00am EST
    // if(estDate.getHours() === 0 && estDate.getMinutes() === 1){ 
        var toggledUsers = db.prepare(`Select * from ${dbName} WHERE ${dbName}.autobook=1`).all();
        toggledUsers.forEach(function (user) {
            console.log(`\nAutobooking for ${user.discordId}`);
            autobook(user.discordId)
        });
   // }
}, 900000); // Repeat every 60000 milliseconds (1 min)

//Run
const fs = require('fs');
const data = fs.readFileSync('discord-hidden-key.txt', 'UTF-8');
const lines = data.split(/\r?\n/);
lines.forEach((line) => {
    var token = line;
    bot.login(token);
});

const {Client, MessageEmbed} = require('discord.js');
const bot = new Client();
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
let PREFIX = "!";
let db = require('better-sqlite3')('./db/fit.db');
let dbName="TEST"; // TEST for testing OR USER for deploy
let autobookCount=0


// MESSAGES
function sendConfigErrorMessage(message, discordId){
    console.log(`[sendConfigErrorMessage] ${discordId}`);

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription('Dont forget to setup your configuration using !config');

    message.author.send(msg);
    return;
}

function sendFieldErrorMessage(message, discordId, field, value){
    console.log(`[sendFieldErrorMessage] ${discordId}, ${field}:${value}`);

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription(`Sorry, ${field} is not a valid configuration field, *please check !help* `);

    message.author.send(msg);
    return;
}

function sendFormatErrorMessage(message, discordId){
    console.log(`[sendFormatErrorMessage] ${discordId}`);

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription(`Your time slot time is in the wrong format. ##:## format is accepted`);

    message.author.send(msg);
    return;
}

function sendHelpMessage(message, discordId){
    console.log(`[sendHelpMessage] ${discordId}`);

    const msg = new MessageEmbed()
        .setTitle(":question:HELP:question:")
        .setColor(0xff0000)
        .setDescription('Check out my github for a list of all available commands, with a full description of what each command does:\n https://github.com/davepetrov/Gym-Booking-Discord-Bot');

    message.author.send(msg);
    return;
}

function sendLocationsMessage(message, discordId){
    console.log(`[sendLocationsMessage] ${discordId}`);
    message.author.send("Available Locations", {
        files:['./locations.txt']
    });
    message.author.send("Copy the EXACT location (Case sensitive, must include '-') and use that as a location parameter when setting up your configuration. Check !help for more help")
}

function sendDefaultMessage(message, discordId){
    console.log(`[sendDefaultMessage] ${discordId}`);
    const msg = new MessageEmbed()
        .setTitle(":grey_question:ERROR:grey_question:")
        .setColor(0xff0000)
        .setDescription('Use help for correct usage(s)');

    message.author.send(msg);
    return;
}

// HELPERS + COMMANDS

function isUser(discordId){
    const user = db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get();
    if (user==undefined){
        console.log("not user")
        return false
    }
    console.log("is user")
    return true
}


function setConfig(message, discordId, email, password, location, begin, end){
    console.log(`[setConfig] ${discordId}`);

    if (!/^([01]\d|2[0-3]):?([0-5]\d)$/.test(begin) || !/^([01]\d|2[0-3]):?([0-5]\d)$/.test(end)){
        sendFormatErrorMessage(discordId, message);
        return;
    }    
    
    if (!isUser(discordId)){
        console.log("Creating entry");
        // add new entry
        db.prepare(`INSERT INTO ${dbName} (discordId, email, password, location, begin, end) VALUES ('${discordId}', '${email}', '${password}', '${location}', '${begin}', '${end}')`).run();
        
        const msg = new MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x61bf33)
            .setDescription('Setting up new config for you. *You can now use !book to book*');
        message.author.send(msg); 
    }
    else{
        console.log("Updating entry");
        // update the config
        db.prepare(`UPDATE ${dbName} SET email='${email}', password='${password}', location='${location}', begin='${begin}', end='${end}' WHERE discordId='${discordId}'`).run();
        
        const msg = new MessageEmbed()
            .setTitle(":muscle:CONFIG:muscle:")
            .setColor(0x009cdf)
            .setDescription('Updating your existing config. *You can now use !book to book*');
        message.author.send(msg); 
    }
    return;
}


function book(message, discordId){
    console.log(`[book] ${discordId}`);
    if (!isUser(discordId)){
        sendConfigErrorMessage(discordId, message);
        console.log("failed to book")
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get()
    console.log("Booking time manually");
    console.log("Performing action on", user.email, user.password);

    const msg = new MessageEmbed()
    .setTitle(`:muscle:Booking:muscle:`)
    .setColor(0xff0000)
    .setDescription((`Checking Fit4less for available times, this may take a few seconds \nBooking set for  ${message.author.username} at ${user.location}`));

    message.reply(msg); //Public

    execSync(`python3 handler.py fit4less book ${user.password} ${user.email} ${user.location} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            console.log(stdout)
            console.log("Booking complete")
    });
    checkReserved(message,discordId);
    
}

function autobook(discordId){
    console.log(`[Autobook] ${discordId}, count: ${autobookCount}`)
    if (!isUser(discordId)){
        console.log("failed to autobook")
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get()
    console.log("Performing action on", user.email, user.password);
    
    exec(`python3 handler.py fit4less autobook ${user.password} ${user.email} ${user.location} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error, stderr);
            }
            console.log(stdout)
            console.log("Auto Booking complete")
    });

    autobookCount+=1;
    console.log("\n");
}

function checkReserved(message, discordId){
    console.log("checkReserved");
    if (!isUser(discordId)){
        sendConfigErrorMessage(discordId, message);
        console.log("failed to checkReserved")
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE discordId=${discordId}`).get();

    exec(`python3 handler.py fit4less reserved ${user.password} ${user.email}`,
        function (error, stdout, stderr) {
            const msg = new MessageEmbed()
                .setTitle(":grey_exclamation:Future bookings:grey_exclamation:")
                .setColor(0xffa500)
                .setDescription((stdout)+"\n Check your reserved times on the [Fit4less](https://myfit4less.gymmanager.com/portal/booking/index.asp?) site ");
            message.author.send(msg) //private

            console.log(stdout)
            console.log("Checking reserved complete")
            
        });
}

function autobookToggle(message, discordId){
    console.log("autobookToggle")

    if (!isUser(discordId)){
        sendConfigErrorMessage(discordId, message);
        console.log("failed to autobookToggle")
        return;
    }

    var togglevalue =  db.prepare(`SELECT autobook FROM ${dbName} WHERE discordId=${discordId}`).get().autobook;
    var newtogglevalue = (togglevalue===0) ? 1 : 0
    db.prepare(`UPDATE ${dbName} SET autobook=${newtogglevalue} WHERE discordId=${discordId}`).run();

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

function updateField(message, discordId, fieldKey, fieldVal){

    if (!isUser(discordId)){
        sendConfigErrorMessage(discordId, message);
        return;
    }
    
    if (fieldKey=="begin" || fieldKey=="end"){
        var time = fieldVal;
        if (!/^([01]\d|2[0-3]):?([0-5]\d)$/.test(time)){
            sendFormatErrorMessage(discordId, message);
            return;
        }

    }
    console.log(`updating field: ${fieldKey}: ${fieldVal}`);

    const msg = new MessageEmbed()
        .setTitle("CONFIG")
        .setColor(0x009cdf) 
        .setDescription(`Updating your config **${fieldKey}** with **${fieldVal}**`);
    message.author.send(msg) ;

    db.prepare(`UPDATE ${dbName} SET ${fieldKey}='${fieldVal}' WHERE discordId=${discordId}`).run();
    return;
}

// Bot online msg
bot.on('ready', () =>{
    console.log("Fit4Less Bot is now Online with new updates");
})

// Bot recieves prompt
bot.on('message', message=>{  
    console.log("[USER MESSAGE]")
    if (!message.content.startsWith(PREFIX)) return; // Not a command

    var username = message.author.username;
    console.log("username:"+username)
    var userid = message.author.id;
    console.log("userid:"+userid)

    let args = message.content.substring(PREFIX.length).split(" ");
    let command = args[0];
    
    switch (command){
        case 'config': 
            if (args.length == 3){
                let configKey=args[1];
                let configValue=args[2];
                switch (configKey){
                    case "-email":
                        updateField(message, userid, "email", configValue);
                        break;

                    case "-password":
                        updateField(message, userid, "password", configValue);
                        break;

                    case "-location":
                        updateField(message, userid, "location", configValue);
                        break;

                    case "-begin":
                        updateField(message, userid, "begin", configValue);
                        break;

                    case "-end":
                        updateField(message, userid, "end", configValue);
                        break;

                    default:
                        sendFieldErrorMessage(message, configKey, configValue);
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
            sendLocationsMessage(message, userid);
            break;

        case 'help':
            sendHelpMessage(message, userid);
            break;
            
        default:
            sendDefaultMessage(message, userid);
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

// setInterval(function(){
    console.log(`[Checking  autobook...Autobook count set ${autobookCount}]\n--------------------------------`)
    var date = new Date(); // Create a Date object to find out what time it is
    var datezone = date.getTime() + (date.getTimezoneOffset() * 60000);
    var estDate = new Date(datezone - (3600000*5));

    //Book at 12:00am EST
    // if(estDate.getHours() === 0 && estDate.getMinutes() === 0){ 
        var toggledUsers = db.prepare(`Select * from ${dbName} WHERE ${dbName}.autobook=1`).all();
        toggledUsers.forEach(function (user) {
            autobook(user.discordId)
        });
        
    // }
// }, 600000); // Repeat every 60000 milliseconds (1 min)

//Run
const fs = require('fs');
const data = fs.readFileSync('discord-hidden-key.txt', 'UTF-8');
const lines = data.split(/\r?\n/);
lines.forEach((line) => {
    var token = line;
    bot.login(token);
});

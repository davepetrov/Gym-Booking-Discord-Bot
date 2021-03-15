const {Client, MessageEmbed} = require('discord.js');
const bot = new Client();
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const fs = require('fs');
const fetch = require('node-fetch');
let PREFIX = "!";
let db = require('better-sqlite3')('db/fit.db');
let dbName="USER"; // TEST for testing OR USER for deploy
let autobookCount=0
let autobookSet=0



// MESSAGES
function sendConfigErrorMessage(message, id){
    console.log(`[sendConfigErrorMessage] ${id}`);

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription('Dont forget to setup your configuration using !config [email] [password] [location] [backup location] [start time] [end time]');

    message.author.send(msg);
    return;
}

function sendFieldErrorMessage(message, id, field, value){
    console.log(`[sendFieldErrorMessage] ${id}, ${field}:${value}`);

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription(`Sorry, ${field} is not a valid configuration field, *please check !help* `);

    message.author.send(msg);
    return;
}

function sendFormatErrorMessage(message, id){
    console.log(`[sendFormatErrorMessage] ${id}`);

    const msg = new MessageEmbed()
        .setTitle(":question:ERROR:question:")
        .setColor(0xff0000)
        .setDescription(`Your time slot time is in the wrong format. ##:## format is accepted`);

    message.author.send(msg);
    return;
}

function sendHelpMessage(message, id){
    console.log(`[sendHelpMessage] ${id}`);

    const msg = new MessageEmbed()
        .setTitle(":question:HELP:question:")
        .setColor(0xff0000)
        .setDescription('Check out my github for a list of all available commands, with a full description of what each command does:\n https://github.com/davepetrov/Gym-Booking-Discord-Bot');

    message.author.send(msg);
    return;
}

function sendLocationsMessage(message, id){
    console.log(`[sendLocationsMessage] ${id}`);

    const msg = new MessageEmbed()
        .setTitle(":question:Locations:question:")
        .setColor(0xff0000)
        .setDescription("Copy the EXACT location (Case sensitive, must include '-') and use that as a location parameter when setting up your configuration. Check !help for more help");


    message.author.send(msg);

    message.author.send({
        files:['./resources/locations.txt']
    });
    return;
}

    
function sendDefaultMessage(message, id){
    console.log(`[sendDefaultMessage] ${id}`);
    const msg = new MessageEmbed()
        .setTitle(":grey_question:ERROR:grey_question:")
        .setColor(0xff0000)
        .setDescription('Use help for correct usage(s)');

    message.author.send(msg);
    return;
}

// HELPER

function isUser(message){
    let id=message.author.id;
    let username=message.author.username;

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    if (user==undefined){
        console.log("Not a user")
        return false
    }
    updateUsername(id, username);
    return true
}

function isUserAuto(id){

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    if (user==undefined){
        console.log("Not a user")
        return false
    }
    return true
}

function isValidLocation(message, location){
    const validLocations=[]
    const data = fs.readFileSync('./resources/locations.txt', 'UTF-8');
    const lines = data.split(/\r?\n/);
    lines.forEach((line) => {
        validLocations.push(line);
    });

    if (!validLocations.includes(location)){
        console.log("invalid location")
        const msg = new MessageEmbed()
            .setTitle(":grey_exclamation:CONFIG:grey_exclamation:")
            .setColor(0xff0000)
            .setDescription('Invalid Fit4less location, location remains the same');
        message.author.send(msg); 
        return false
    }

    return true
}

function updateUsername(id, username){
    db.prepare(`UPDATE ${dbName} SET username='${username}' WHERE id=${id}`).run()
}

function isValidLogin(message, email, password){
    try{
        prog=execSync(`python3 -m application fit4less login ${password} ${email}`);
    }
    catch(error){
        console.log("newlogin failed")
        const msg = new MessageEmbed()
            .setTitle(":grey_exclamation:CONFIG:grey_exclamation:")
            .setColor(0x009cdf)
            .setDescription('Invalid Fit4less login, login remains the same');
        message.author.send(msg); 
        
        return false
    }
    return true
}

function isValidTime(message, begin, end){
    if (!(/^([01]\d|2[0-3]):?([0-5]\d)$/.test(begin) && /^([01]\d|2[0-3]):?([0-5]\d)$/.test(end))){
        sendFormatErrorMessage(message, message.author.id);
        return false
    }
    return true

}


// CONFIG
function getConfig(message, id){
    console.log(`[getConfig] ${id}`);
    if (!isUser(message)){
        sendConfigErrorMessage(message);
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    const msg = new MessageEmbed()
        .setTitle(":muscle:CONFIG:muscle:")
        .setColor(0x61bf33)
        .setDescription(`**Email**: ${user.email}\n**Password**: ${user.password}\n**Location**: ${user.location}\n**Backup Location**: ${user.locationBackup}\n**Timeslots**: ${user.begin} - ${user.end}\n`);
    message.author.send(msg); 
    return;

}

function setConfig(message, id, email, password, location, locationBackup, begin, end){
    console.log(`[setConfig] ${id}`);

    if (!isValidTime(message, begin, end)){
        sendFormatErrorMessage(message, id);
        return;
    }    

    if (!isValidLogin(message, email, password)){
        return;
    }

    if (!isValidLocation(message, location) || !isValidLocation(message, locationBackup)){
        return;
    }
    
    if (!isUser(message)){
        console.log("Creating entry");
        // add new entry
        db.prepare(`INSERT INTO ${dbName} (id, email, password, location, locationBackup, begin, end) VALUES ('${id}', '${email}', '${password}', '${location}', '${locationBackup}', '${begin}', '${end}')`).run();

        const msg = new MessageEmbed()
            .setTitle(":muscle:CONFIG:muscle:")
            .setColor(0x61bf33)
            .setDescription('**Creating** new config for you. *You can now use !book to book*');
        message.author.send(msg); 
    }
    else{
        console.log("Updating entry");
        // update the config
        db.prepare(`UPDATE ${dbName} SET email='${email}', password='${password}', location='${location}', locationBackup='${locationBackup}', begin='${begin}', end='${end}' WHERE id='${id}'`).run();
        
        const msg = new MessageEmbed()
            .setTitle(":muscle:CONFIG:muscle:")
            .setColor(0x009cdf)
            .setDescription('**Updating** your existing config. *You can now use !book to book*');
        message.author.send(msg); 
    }

    getConfig(message, id);
    return;
}

function updateField(message, id, fieldKey, fieldVal){
    console.log(`[updating field]: ${fieldKey}: ${fieldVal}`);

    if (!isUser(message)){
        sendConfigErrorMessage(message, id);
        return;
    }

    if (fieldKey=="location" || fieldKey=="locationBackup"){
        if (!isValidLocation(message, fieldVal)){
            return;
        }
    }
    
    if (fieldKey=="begin" || fieldKey=="end"){
        var time = fieldVal;
        if (!isValidTime(time, time)){
            return;
        }

    }
    const msg = new MessageEmbed()
        .setTitle("CONFIG")
        .setColor(0x009cdf) 
        .setDescription(`Updating your config **${fieldKey}** with **${fieldVal}**`);
    message.author.send(msg) ;

    db.prepare(`UPDATE ${dbName} SET ${fieldKey}='${fieldVal}' WHERE id=${id}`).run();

    getConfig(message, id);

    return;
}

// MAIN COMMANDS

function book(message, id){
    console.log(`[book] ${id}`);
    if (!isUser(message)){
        sendConfigErrorMessage(message, id);
        console.log("failed to book")
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get()

    console.log("Booking time manually");
    console.log("Performing action on", user.email, user.password);

    const msg = new MessageEmbed()
        .setTitle(`:muscle:Booking:muscle:`)
        .setColor(0xff0000)
        .setDescription((`Checking Fit4less for available times, this may take a few seconds \nBooking set for  ${message.author.username} at ${user.location}/ ${user.locationBackup}`));

    message.reply(msg); //Public
    if (user.locationBackup==null){
        locationBackup='null'
    }
    else{
        locationBackup=user.locationBackup;
    }
    execSync(`python3 -m application fit4less book ${user.password} ${user.email} ${user.location} ${locationBackup} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            console.log(stderr)
            console.log("Booking complete")
    });
    checkReserved(message,id);
    return;
}

function autobook(id){
    console.log(`[Autobook] ${id}, count: ${autobookCount}`)
    if (!isUserAuto(id)){
        console.log("failed to autobook")
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get()
    console.log("Performing action on", user.email, user.password);

    if (user.locationBackup==null){
        locationBackup='null'
    }
    else{
        locationBackup=user.locationBackup;
    }

    exec(`python3 -m application fit4less autobook ${user.password} ${user.email} ${user.location} ${locationBackup} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error, stderr);
            }
            console.log(stderr)
            console.log("Auto Booking complete")
    });

    autobookCount+=1;
    console.log("\n");
}

function checkReserved(message, id){
    console.log("checkReserved");
    if (!isUser(message)){
        sendConfigErrorMessage(message, id);
        console.log("failed to checkReserved")
        return;
    }

    var user =  db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();

    exec(`python3 -m application fit4less reserved ${user.password} ${user.email}`,
        function (error, stdout, stderr) {
            const msg = new MessageEmbed()
                .setTitle(":grey_exclamation:Future bookings:grey_exclamation:")
                .setColor(0xffa500)
                .setDescription((stdout)+"\n Check your reserved times on the [Fit4less](https://myfit4less.gymmanager.com/portal/booking/index.asp?) site ");
            message.author.send(msg) //private
            console.log(stdout)
            console.log(stderr)
            console.log("Checking reserved complete")
            
        });
}

function autobookToggle(message, id){
    console.log("autobookToggle")

    if (!isUser(message)){
        sendConfigErrorMessage(message, id);
        console.log("failed to autobookToggle")
        return;
    }

    var togglevalue =  db.prepare(`SELECT autobook FROM ${dbName} WHERE id=${id}`).get().autobook;
    var newtogglevalue = (togglevalue===0) ? 1 : 0
    db.prepare(`UPDATE ${dbName} SET autobook=${newtogglevalue} WHERE id=${id}`).run();

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


// Bot online msg
bot.on('ready', () =>{
    console.log("Fit4Less Bot is now Online with new updates");
});


// Bot recieves prompt
bot.on('message', message=>{  
    if (!message.content.startsWith(PREFIX)) return; // Not a command
    console.log("--------------------------------------------------------\n[USER MESSAGE]")

    var username = message.author.username;
    var userid = message.author.id;
    console.log("username:"+username)
    console.log("userid:"+userid)

    let args = message.content.substring(PREFIX.length).split(" ");
    let command = args[0];
    
    switch (command){
        case 'config': 
            if (args.length ==1){
                getConfig(message, userid);
                break;
            }
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

                    case "-locationBackup":
                        updateField(message, userid, "locationBackup", configValue);
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

            if (args.length!=7){
                sendHelpMessage(message, userid);
                break;
            }
            var email =  args[1];
            var password =  args[2];
            var location =  args[3];
            var locationBackup =  args[4];
            var begin =  args[5];
            var end =  args[6];
            setConfig(message, userid, email, password, location, locationBackup, begin, end);
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
    // const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    // if (!channel) return;
    
    message.author.send(`Welcome to Fit4Less Bot Server, ${member}`);
});

// Autobook for all the users with autobooking toggled on

setInterval(function(){
    console.log(`[Checking  autobook...Autobook count set ${autobookSet}]\n--------------------------------------------------------`)
    
    var toggledUsers = db.prepare(`Select * from ${dbName} WHERE ${dbName}.autobook=1`).all();
    toggledUsers.forEach(function (user) {
            autobook(user.id)
        });
    console.log(`[DONE autobook ${autobookSet}]\n--------------------------------------------------------`)
    autobookSet+=1;

}, 1800000); // Repeat every 60000 milliseconds (1 min)
            
// Run

const data = fs.readFileSync('resources/discord-hidden-key.txt', 'UTF-8');
const lines = data.split(/\r?\n/);
lines.forEach((line) => {
    var token = line;
    bot.login(token);
});
    
                
                
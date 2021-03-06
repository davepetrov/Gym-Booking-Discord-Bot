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
        
        const msg = new MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x61bf33)
            .setDescription('Setting up new config for you. *You can now use !book to book*');
        message.author.send(msg); 
    }
    else{
        console.log("is user, updating");
        // update the config
        db.prepare(`UPDATE USER SET email='${email}', password='${password}', location='${location}', begin='${begin}', end='${end}' WHERE discordId='${userid}'`).run();
        
        const msg = new MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x009cdf)
            .setDescription('Updating your existing config. *You can now use !book to book*');
        message.author.send(msg); 
    }
    return;
}

function sendConfigErrorMessage(message){
    console.log("sendConfigErrorMessage");

    const msg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription('Dont forget to setup your configuration using !config');

    message.author.send(msg);
    return;
}

function sendFieldErrorMessage(message, field){
    console.log("sendFieldErrorMessage");

    const msg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription(`Field ${field} is not a valid configuration, *please check !help*`);

    message.author.send(msg);
    return;
}

function sendHelpMessage(message){
    console.log("sendHelpMessage");

    const msg = new MessageEmbed()
        .setTitle("HELP")
        .setColor(0xff0000)
        .setDescription(
            'Check out my github for a list of all available commands, with a full description of what each command does:\n https://github.com/davepetrov/Gym-Booking-Discord-Bot');

    message.author.send(msg);
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
    const msg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription('Use help for correct usage(s)');

    message.author.send(msg);
    return;
}

function isFit4lessUser(discordId){
    const user = db.prepare(`SELECT * FROM USER WHERE discordId=${discordId}`).get();
    return user!=undefined;
}

function book(message, discordId){
    if (!isFit4lessUser(discordId)){
        sendConfigErrorMessage(message);
        return;
    }

    var user =  db.prepare('SELECT * FROM USER WHERE discordId='+discordId).get()

    console.log(user.email, user.password);
    if (message!=null){
        console.log("Booking time for user manually");

        const msg = new MessageEmbed()
        .setTitle(`Booking set for user ${user.email} at ${user.location} from ${user.begin} to ${user.end}`)
        .setColor(0xff0000)
        .setDescription(("Checking Fit4less for available times, this may take a minute...Sit tight"));

        message.reply(msg); //Public
    }
    else{
        console.log("Booking time for user automatically");
    }

    exec(`python3 fit4less-workout-booker.py book ${user.password} ${user.email} ${user.location} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            if (message!=null){
                const msg = new MessageEmbed()
                    .setTitle("You are booked for the following times")
                    .setColor(0xffa500)
                    .setDescription((stdout));
                
                message.author.send(msg) //private
            }
            if (error !== null) {
                console.log('exec error: ' + error);
            }
    });
    
}

function checkReserved(message, discordId){
    if (!isFit4lessUser(discordId)){
        sendConfigErrorMessage(message);
        return;
    }

    console.log("checkReserved");
    var user =  db.prepare(`SELECT * FROM USER WHERE discordId=${discordId}`).get();

    if (message != null){
        const msg = new MessageEmbed()
            .setTitle("Check Reserved times")
            .setDescription("*This may take a minute...Sit tight*")
            .setColor(0xff0000);
        message.author.send(msg);
    }
    exec(`python3 fit4less-workout-booker.py reserved ${user.password} ${user.email}`,
        function (error, stdout, stderr) {
            if (message!=null){
                const msg = new MessageEmbed()
                    .setTitle("You are booked for the following times")
                    .setColor(0xffa500)
                    .setDescription((stdout));
                message.author.send(msg) //private
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
        const msg = new MessageEmbed()
            .setTitle("AUTOBOOK")
            .setColor(0xFF0000) 
            .setDescription(`Autobook feature Toggled OFF - *You will have to manually use !book to book for the next 3 days*`);
        message.author.send(msg) ;

    }else{
        const msg = new MessageEmbed()
            .setTitle("AUTOBOOK")
            .setColor(0x00FF00) 
            .setDescription(`Autobook feature Toggled ON - *You will now be autobooked and guaranteed a spot until this feature is toggled off*`);
        message.author.send(msg) ;
    }
    return;
}

function updateField(message, userid, fieldKey, fieldVal){
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

    db.prepare(`UPDATE USER SET ${fieldKey}='${fieldVal}' WHERE discordId=${userid}`).run();
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

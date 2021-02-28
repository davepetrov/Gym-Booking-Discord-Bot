const {Client, MessageEmbed} = require('discord.js');
const bot = new Client();
const exec = require('child_process').exec
let PREFIX = "!";

function sendConfigErrorMessage(message){
    const configmsg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription('Dont forget to setup your configuration using !config');

    message.author.send(configmsg) //private
}

function sendHelpMessage(message){
    const helpmsg = new MessageEmbed()
        .setTitle("HELP")
        .setColor(0xff0000)
        .setDescription(
            'Setup saved configuration: !config [EMAIL]  [PASSWORD] [EXACT FIT4LESS LOCATION]  [MINIMUM TIME RANGE (24hr)]  [MAXIMUM  TIME RANGE (24hr)]\n'+
            'Book a time manually: !book/n'+
            'Check your booked times: !reserved\n'+
            'Get all possible locations: !locations'+
            'More help: !help');

    message.author.send(helpmsg) //private
}

function sendLocationsMessage(message){
    message.author.send("Available Locations", {
        files:['./locations.txt']
    });
    message.author.send("Copy the location and use that as a location argument when using !book")
}

function sendHDefaultMessage(message){
    const erromsg = new MessageEmbed()
        .setTitle("ERROR")
        .setColor(0xff0000)
        .setDescription('Use help for correct usage(s)');

    message.author.send(erromsg) //private
}

function isFit4lessUser(db, discordId){
    // if matches users discord id:
    //     user in the db
    //     return true
    // else:
    //     user not in the db
    //     return false

    return db->query("SELECT EXISTS (SELECT * FROM USER ON discordId=${discordId})");

    return exists;
}

function book(db, message){
    var email =  db.exec("SELECT email FROM USER ON discordId=${userid}")
    var password =  db.exec("SELECT password FROM USER ON discordId=${userid}")
    var location =  db.exec("SELECT location FROM USER ON discordId=${userid}")
    var begin =  db.exec("SELECT begin FROM USER ON discordId=${userid}")
    var end =  db.exec("SELECT end FROM USER ON discordId=${userid}")
    
    sendBookingMessage(message){
        const publicmsg = new MessageEmbed()
        .setTitle('Booking set for user ${email} at ${location} from ${start} to ${end}')
        .setColor(0xff0000)
        .setDescription(("Checking Fit4less for available times, this may take a minute..."));

    message.reply(publicmsg); //Public
    exec('python3 fit4less-workout-booker.py book ${password} ${email} ${location} ${start} ${end}',
        function (error, stdout, stderr) {
            
            const bookingmessage = new MessageEmbed()
                .setTitle("You are booked for the following times")
                .setColor(0xffa500)
                .setDescription((stdout));

            message.author.send(bookingmessage) //private
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    }
}

checkReserved(db, message){
    var email =  db.exec("SELECT email FROM USER ON discordId=${userid}")
    var password =  db.exec("SELECT password FROM USER ON discordId=${userid}")

    const publicmsg = new MessageEmbed()
        .setTitle("Checking Fit4less for reserved times, this may take a minute...")
        .setColor(0xff0000);
    message.author.send(publicmsg);

    exec('python3 fit4less-workout-booker.py reserved'+' '+password+' '+email,
        function (error, stdout, stderr) {
            const reservedmessage = new MessageEmbed()
                .setTitle("You are booked for the following times")
                .setColor(0xffa500)
                .setDescription((stdout));
            message.author.send(reservedmessage) //private
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
}

bot.on('ready', () =>{
    console.log("Fit4Less Bot is now Online with new updates");
})


bot.on('message', message=>{    
    if (!message.content.startsWith(PREFIX) || message.author.bot) return; // Not a command

    let db = new sqlite3.Database('./db/fit.db', (err) => {
        if (err) {
        console.error(err.message);
        }
        console.log('Connected to the Fit4Less Booking database.');
    });

    var username = message.author.username;
    var userid = message.author.id;

    let args = message.content.substring(PREFIX.length).split(" ");
    console.log(args.length, "arguments sent");
    
    switch (args[0]){
        case 'config': 
            if (args.length!=6){
                sendHelpMessage(message);
                break;
            }

            var email =  args[1];
            var password =  args[2];
            var location =  args[3];
            var begin =  args[4];
            var end =  args[5];

            if (!isFit4lessUser(db, userid)){
                // add new entry
                db.run('INSERT INTO USERS (discordId, email, password, location, begin, end) VALUES (${userid}, ${email}, ${password}, ${location}, ${begin}, ${end})');
            }
            // update the config
            db.run('UPDATE USERS SET discordId=${userid}, email=${email}, password=${password}, location=${location}, begin=${begin}, end=${end}');
            break;
            
        case 'book': //Books the time for you within the specfic time range
            if (!isFit4lessUser(db, user)){
                sendConfigErrorMessage(message);
                break
            }

            //book with all the config
            book(db, message);
            break;

        case 'reserved': //Lists you the times you are current booked for
            if (!isFit4lessUser(db, user)){
                sendConfigErrorMessage(message);
                break;
            }

            //check reserved times with all the config
            checkReserved(db, message);
            break;

        case 'locations':
            sendLocationsMessage(message);
            break;

        case 'help':
            sendHelpMessage(message);
            break;
            
        default:
            sendHDefaultMessage();
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

//Run
const fs = require('fs');
const data = fs.readFileSync('discord-hidden-key.txt', 'UTF-8');
const lines = data.split(/\r?\n/);
lines.forEach((line) => {
    var token = line;
    bot.login(token);
});

const {
    Client,
    MessageEmbed
} = require("discord.js");
const bot = new Client();
const execSync = require("child_process").execSync;
const exec = require("child_process").exec;
const fs = require("fs");
let PREFIX = "!";
let db = require("better-sqlite3")("db/fit.db");
let dbName = "USER"; // TEST for testing OR USER for deploy
let dbAuditName = "BOOKINGS"; 
let autobookCount = 0;
let autobookSet = 0;

// Run
const data = fs.readFileSync("resources/discord-hidden-key.txt", "UTF-8");
const lines = data.split(/\r?\n/);
lines.forEach((line) => {
    var token = line;
    bot.login(token);
});

// MESSAGES
function sendConfigErrorMessage(message, id) {
    console.log(`[sendConfigErrorMessage] ${id}`);

    const msg = new MessageEmbed()
        .setTitle(":question: ERROR :question:")
        .setColor(0xff0000)
        .setDescription(
            "Dont forget to setup your configuration using !config [email] [password] [location] [backup location] [start time] [end time]"
        );

    message.author.send(msg);
    return;
}

function sendFieldErrorMessage(message, id, field, value) {
    console.log(`[sendFieldErrorMessage] ${id}, ${field}:${value}`);

    const msg = new MessageEmbed()
        .setTitle(":question: ERROR :question:")
        .setColor(0xff0000)
        .setDescription(
            `Sorry, ${field} is not a valid configuration field, *please check !help* `
        );

    message.author.send(msg);
    return;
}

function sendFormatErrorMessage(message, id) {
    console.log(`[sendFormatErrorMessage] ${id}`);

    const msg = new MessageEmbed()
        .setTitle(":question: ERROR :question:")
        .setColor(0xff0000)
        .setDescription(
            `Your time slot time is in the wrong format. ##:## format is accepted`
        );

    message.author.send(msg);
    return;
}

function sendHelpMessage(message, id) {
    console.log(`[sendHelpMessage] ${id}`);

    const msg = new MessageEmbed()
        .setTitle(":question: HELP :question:")
        .setColor(0xff0000)
        .setDescription(
            "Check out my github for a list of all available commands, with a full description of what each command does:\n https://github.com/davepetrov/Gym-Booking-Discord-Bot"
        );
        
    message.author.send(msg);
    return;
}

function sendLocationsMessage(message, id) {
    console.log(`[sendLocationsMessage] ${id}`);

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();

    const msg = new MessageEmbed()
        .setTitle(`:question: Locations for ${user.gym} :question:`)
        .setColor(0xff0000)
        .setDescription(
            "Copy the EXACT location (Case sensitive, must include '-') and use that as a location parameter when setting up your configuration. Check !help for more help"
        );

    message.author.send(msg);

    if (user.gym=='fit4less'){
        message.author.send({
            files: ["./resources/fit4less-locations.txt"],
        });
    }else{
        message.author.send({
            files: ["./resources/lafitness-locations.txt"],
        });
    }
    return;
}

function sendInvalidLocationMessage(message, id){
    console.log(`[sendInvalidLocationMessage] ${id}`);
    const msg = new MessageEmbed()
        .setTitle(":grey_question: ERROR :grey_question:")
        .setColor(0xff0000)
        .setDescription("Your location is not a valid, check !locations");

    message.author.send(msg);
    return;
}

function sendGymClosedMessage(message, id){
    console.log(`[sendGymClosedMessage] ${id}`);
    const msg = new MessageEmbed()
        .setTitle(":grey_question: ERROR :grey_question:")
        .setColor(0xff0000)
        .setDescription("Your gym is currently closed, check another location");

    message.author.send(msg);
    return;
}

function sendMaxBookedMessage(message, id){
    console.log(`[sendMaxBookedMessage] ${id}`);
    const msg = new MessageEmbed()
        .setTitle(":grey_question: ERROR :grey_question:")
        .setColor(0xff0000)
        .setDescription("You are booked to the max at this moment");

    message.author.send(msg);
    return;
}

function sendDefaultMessage(message, id) {
    console.log(`[sendDefaultMessage] ${id}`);
    const msg = new MessageEmbed()
        .setTitle(":grey_question: ERROR :grey_question:")
        .setColor(0xff0000)
        .setDescription("Use help for correct usage(s)");

    message.author.send(msg);
    return;
}

// HELPERS

function isUser(message) {
    let id = message.author.id;
    let username = message.author.username;

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    if (user == undefined) {
        console.log("Not a user");
        return false;
    }
    updateUsername(id, username);
    return true;
}

function isUserAuto(id) {
    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    if (user == undefined) {
        console.log("Not a user");
        return false;
    }
    return true;
}

function isValidGym(message, location) {
    if (!["lafitness", "fit4less"].includes(location)){
        console.log("invalid gym");
        const msg = new MessageEmbed()
            .setTitle(":grey_exclamation: CONFIG :grey_exclamation:")
            .setColor(0xff0000)
            .setDescription("Invalid gym (Not 'fit4less' or 'lafitness'), gym remains the same");
        message.author.send(msg);
        return false;
    }
    return true
}

function isValidLocation(message, location, gym) {
    let id = message.author.id;
    // const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();

    const validLocations = [];
    var data;
    if (gym == 'fit4less' ){
        data = fs.readFileSync("./resources/fit4less-locations.txt", "UTF-8");
    }else{
        data = fs.readFileSync("./resources/lafitness-locations.txt", "UTF-8");
    }
    const lines = data.split(/\r?\n/);
    lines.forEach((line) => {
        validLocations.push(line);
    });
    try{
        if (!validLocations.includes(location)) {
            sendInvalidLocationMessage(message, id)
        }
    } catch(error){
        console.log('final exit code is', error.status)
        console.log(error.stderr)
        return false
    }

    return true;
}

function updateUsername(id, username) {
    db.prepare(
        `UPDATE ${dbName} SET username='${username}' WHERE id=${id}`
    ).run();
}

function isValidLogin(message, email, password, gym) {

    
    let id = message.author.id;
    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();

    var checkGym;
    if (gym==undefined){
        checkGym=user.gym
    }else{
        checkGym=gym
    }

    try {
        execSync(`python3 -m application ${checkGym} login ${password} ${email}`,
            function (error, stdout, stderr) {
                console.log(stderr);
                console.log(stdout);

            }
        );
    } catch (error) {
        console.log("new login failed");
        const msg = new MessageEmbed()
            .setTitle(":grey_exclamation: CONFIG :grey_exclamation:")
            .setColor(0x009cdf)
            .setDescription(`Invalid ${user.gym} login`);
        message.author.send(msg);

        return false;
    }
    return true;
}

function isValidTime(message, begin, end) {
    if (
        !(
            /^([01]\d|2[0-3]):?([0-5]\d)$/.test(begin) &&
            /^([01]\d|2[0-3]):?([0-5]\d)$/.test(end)
        )
    ) {
        sendFormatErrorMessage(message, message.author.id);
        return false;
    }
    return true;
}

// CONFIG
function getConfig(message, id) {
    console.log(`[getConfig] ${id}`);
    if (!isUser(message)) {
        sendConfigErrorMessage(message);
        return;
    }

    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    const msg = new MessageEmbed()
        .setTitle(":muscle: CONFIG :muscle:")
        .setColor(0x61bf33)
        .setDescription(
            `**Gym**: ${user.gym}\n**Email**: ${user.email}\n**Password**: ${user.password}\n**Location**: ${user.location}\n**Backup Location**: ${user.locationBackup}\n**Timeslots**: ${user.begin} - ${user.end}\n`
        );
    message.author.send(msg);
    return;
}

function setConfig(
    message,
    id,
    gym,
    email,
    password,
    location,
    locationBackup,
    begin,
    end
) {
    console.log(`[setConfig] ${id}`);

    if (!isValidGym(message, gym)) {
        return;
    }

    if (!isValidTime(message, begin, end)) {
        sendFormatErrorMessage(message, id);
        return;
    }

    if (
        !isValidLocation(message, location, gym,) ||
        !isValidLocation(message, locationBackup, gym)
    ) {
        return;
    }

    if (!isUser(message)) {
        if (!isValidLogin(message, email, password, gym)) {
            return;
        }
        console.log("Creating entry");
        // add new entry
        db.prepare(
            `INSERT INTO ${dbName} (id, gym, email, password, location, locationBackup, begin, end) VALUES ('${id}', '${gym}', '${email}', '${password}', '${location}', '${locationBackup}', '${begin}', '${end}')`
        ).run();

        const msg = new MessageEmbed()
            .setTitle(":muscle:CONFIG:muscle:")
            .setColor(0x61bf33)
            .setDescription(
                "**Creating** new config for you. *You can now use !book to book with your new config*"
            );
        message.author.send(msg);
    } else {
        if (!isValidLogin(message, email, password, undefined)) {
            return;
        }
        console.log("Updating entry");
        // update the config
        db.prepare(
            `UPDATE ${dbName} SET gym='${gym}', email='${email}', password='${password}', location='${location}', locationBackup='${locationBackup}', begin='${begin}', end='${end}' WHERE id='${id}'`
        ).run();

        const msg = new MessageEmbed()
            .setTitle(":muscle:CONFIG:muscle:")
            .setColor(0x009cdf)
            .setDescription(
                "**Updating** your existing config. *You can now use !book to book with your updated config*"
            );
        message.author.send(msg);
    }

    getConfig(message, id);
    return;
}

function updateField(message, id, fieldKey, fieldVal) {
    console.log(`[updating field]: ${fieldKey}: ${fieldVal}`);

    if (!isUser(message)) {
        sendConfigErrorMessage(message, id);
        return;
    }

    if (fieldKey == "gym" ) {
        if (!isValidGym(message, fieldVal)) {
            return;
        }
    }

    if (fieldKey == "location" || fieldKey == "locationBackup") {
        if (!isValidLocation(message, fieldVal, undefined)) {
            return;
        }
    }

    if (fieldKey == "begin" || fieldKey == "end") {
        if (!isValidTime(fieldVal, fieldVal)) {
            return;
        }
    }
    const msg = new MessageEmbed()
        .setTitle("CONFIG")
        .setColor(0x009cdf)
        .setDescription(
            `Updating your config **${fieldKey}** with **${fieldVal}**`
        );
    message.author.send(msg);

    db.prepare(
        `UPDATE ${dbName} SET ${fieldKey}='${fieldVal}' WHERE id=${id}`
    ).run();

    getConfig(message, id);

    return;
}



// LOGGERS
function logBookResponse(id, command, status){
    // # Errorcodes: 
    // # 0 : Success
    // # 1 : Invalid location
    // # 2 : Gym closed
    // # 3 : Max booked
    // # 4 : Was able to check for bookings without running into errors but unable to booking
    // # 4 : Not logged in 
    // # 500: Api error
    // # 400: User error
    // # Else: Unknown error
    if (status==0){
        var desc="Successfully booked"
    }else if (status==1){
        var desc="Incorrect location"
    }else if (status==2){
        var desc="Gym closed"
    }else if (status==3){
        var desc="Maxed booked"
    }else if (status==4){
        var desc="No spots available"
    }else if (status==500){
        var desc="API Error"
    }else{
        var desc="Unknown Error"
    }
    db.prepare(`INSERT INTO ${dbAuditName} (user_id, command, status, desc) VALUES ('${id}', '${command}', '${status}', '${desc}')`).run();
}

function logReservedResponse(id, status){
    // # Errorcodes: 
    // # 0 : Success
    // # 500: Api error
    // # 400: User error
    if (status==0){
        var desc="Recieved Reserved response"
    }else if (status==500){
        var desc="API Error"
    }else{
        var desc="Unknown Error"
    }
    db.prepare(`INSERT INTO ${dbAuditName} (user_id, command, status, desc) VALUES ('${id}', 'reserved', '${status}', '${desc}')`).run();
}
// MAIN COMMANDS

function book(message, id) {
    console.log(`[book] ${id}`);
    if (!isUser(message)) {
        sendConfigErrorMessage(message, id);
        console.log("failed to book");
        return;
    }
    
    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    
    const msg = new MessageEmbed()
        .setTitle(`:muscle: Booking... :muscle:`)
        .setColor(0xff0000)
        .setDescription(
            `Checking ${user.gym} for available times, this may take a few seconds \nBooking set for  ${message.author.username} at ${user.location}/ ${user.locationBackup}`
        );
    message.reply(msg); //Public

    console.log("Booking time manually");
    console.log("Performing action on", user.email, user.password);

    locationBackup= (user.locationBackup==null) ? "null" : user.locationBackup

    try{
        execSync(`python3 -m application ${user.gym} book ${user.password} ${user.email} ${user.location} ${locationBackup} ${user.begin} ${user.end}`);
    } catch(error){
        console.log(error.stderr);
        console.log('final exit code is', error.status);
        logBookResponse(id, 'book', error.status);

         // # 1 : Invalid location
    // # 2 : Gym closed
    // # 3 : Max booked
        // if (error.status==1){
        //     sendInvalidLocationMessage(message, id);

        // }else if (error.status=2){
        //     sendGymClosedMessage(message, id);

        // }else if (error.status=3){
        //     sendMaxBookedMessage(message, id);
        // }
        // else{
        //     checkReserved(message, id);
        // }
    }


    return;
}

function autobook(id) {
    console.log(`[Autobook] ${id}, count: ${autobookCount}`);
    if (!isUserAuto(id)) {
        return;
    }

    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    console.log("Performing action on", user.email, user.password);

    if (user.locationBackup == null) {
        locationBackup = "null";
    } else {
        locationBackup = user.locationBackup;
    }

    exec(`python3 -m application ${user.gym} autobook ${user.password} ${user.email} ${user.location} ${locationBackup} ${user.begin} ${user.end}`,
        function (error, stdout, stderr) {
            console.log(stderr);
            console.log(stdout);
        }
    ).on('exit', code => {
        console.log('final exit code is', code);
        logBookResponse(id, 'autobook', code)
    });

    autobookCount += 1;
    console.log("\n");
}

function checkReserved(message, id) {
    console.log("checkReserved");
    if (!isUser(message)) {
        sendConfigErrorMessage(message, id);
        console.log("failed to checkReserved");
        return;
    }

    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();

    exec(`python3 -m application ${user.gym} reserved ${user.password} ${user.email}`,
        function (error, stdout, stderr) {
            const msg = new MessageEmbed()
                .setTitle(":grey_exclamation:Future bookings:grey_exclamation:")
                .setColor(0xffa500)
                .setDescription(stdout);
            message.author.send(msg); //private
            console.log(stdout);
            console.log(stderr);
            console.log("Checking reserved complete");
        }
    ).on('exit', code => {
        console.log('final exit code is', code);
        logReservedResponse(id, code)
    });
}

function autobookToggle(message, id) {
    console.log("autobookToggle");

    if (!isUser(message)) {
        sendConfigErrorMessage(message, id);
        console.log("failed to autobookToggle");
        return;
    }

    var togglevalue = db
        .prepare(`SELECT autobook FROM ${dbName} WHERE id=${id}`)
        .get().autobook;
    var newtogglevalue = togglevalue === 0 ? 1 : 0;
    db.prepare(
        `UPDATE ${dbName} SET autobook=${newtogglevalue} WHERE id=${id}`
    ).run();

    console.log(togglevalue, "->", newtogglevalue);
    if (newtogglevalue === 0) {
        const msg = new MessageEmbed()
            .setTitle(":dash:AUTOBOOK:dash:")
            .setColor(0xff0000)
            .setDescription(
                `Autobook feature Toggled OFF - *You will have to manually use !book to book for the next 3 days*`
            );
        message.author.send(msg);
    } else {
        const msg = new MessageEmbed()
            .setTitle(":fire:AUTOBOOK:fire:")
            .setColor(0x00ff00)
            .setDescription(
                `Autobook feature Toggled ON - *You will now be autobooked and guaranteed a spot until this feature is toggled off*`
            );
        message.author.send(msg);
    }
    return;
}

// Bot recieves prompt
bot.on("message", (message) => {
    if (!message.content.startsWith(PREFIX)) return; // Not a command
    console.log(
        "--------------------------------------------------------\n[USER MESSAGE]"
    );

    var username = message.author.username;
    var userid = message.author.id;
    console.log("username:" + username);
    console.log("userid:" + userid);

    let args = message.content.substring(PREFIX.length).split(" ");
    let command = args[0];

    switch (command) {
        case "config":
            if (args.length == 1) {
                getConfig(message, userid);
                break;
            }
            if (args.length == 3) {
                let configKey = args[1];
                let configValue = args[2];
                switch (configKey) {
                    case "-gym":
                        updateField(message, userid, "gym", configValue);
                        break;
                        
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
                        sendFieldErrorMessage(message, userid, configKey, configValue);
                        break;
                }
                break;
            }

            if (args.length != 8) {
                sendHelpMessage(message, userid);
                break;
            }
            var gym = args[1];
            var email = args[2];
            var password = args[3];
            var location = args[4];
            var locationBackup = args[5];
            var begin = args[6];
            var end = args[7];
            setConfig(
                message,
                userid,
                gym,
                email,
                password,
                location,
                locationBackup,
                begin,
                end
            );
            break;

        case "autobook":
            autobookToggle(message, userid);
            break;

        case "book": //Books the time for you within the specfic time range
            book(message, userid);
            break;

        case "reserved": //Lists you the times you are current booked for
            checkReserved(message, userid);
            break;

        case "locations":
            sendLocationsMessage(message, userid);
            break;

        case "help":
            sendHelpMessage(message, userid);
            break;

        default:
            sendDefaultMessage(message, userid);
            break;
    }
});

// Create an event listener for new guild members
bot.on("guildMemberAdd", (member) => {
    message.author.send(`Welcome to Gym Server, ${member}`);
});



// Autobook for all the users with autobooking toggled on

function autobookTrigger(){
    console.log(`[Checking  autobook...Autobook count set ${autobookSet}]\n--------------------------------------------------------`);

    var toggledUsers = db.prepare(`Select * from ${dbName} WHERE ${dbName}.autobook=1`).all();
    toggledUsers.forEach(function (user) {
        autobook(user.id);
    });
    console.log(`[DONE autobook ${autobookSet}]\n--------------------------------------------------------`);
    autobookSet += 1;
}

// Bot online msg
bot.on("ready", () => {
    console.log("Gym Bot is now Online with new updates");
    bot.user.setActivity("[DM ME TO USE]", {type: "PLAYING"})
    // autobookTrigger();
});

setInterval(function () {
    var d = new Date();
    var time = d.getMinutes();
    if (time==0 || time==15|| time==30 || time==45){
        autobookTrigger();
    }
}, 60000); // Repeat every 60000 milliseconds (1 min)
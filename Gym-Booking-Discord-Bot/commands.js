// Imports
const {
    axios,
    Discord,
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
    sendInvalidLocationMessage, 
    sendConfigErrorMessage, 
    sendDonationErrorMessage, 
    sendGymClosedMessage, 
    sendMaxBookedMessage,
    sendInvalidTimeMessage, 
    sendLockDownMessage,
    sendUpdateUserMessage,
    sendCreateUserMessage,
    sendAutobookToggleMessage,
    sendNotGymUserMessage,
    sendNoReservationsMessage
} = require('./chat-messages.js');

const { 
    isUser,
    isValidGym,
    isValidLocation,
    isValidTime
} = require("./valid-checkers.js");

const { 
    logBookResponse, 
    logReservedResponse,
} = require("./event-loggers.js");

const {
    isSubscriber,
} = require("./subscriber-helpers.js");

// Methods

function getConfig(client) {
    console.log(`[getConfig] ${client.userid}`);

    if (!isUser(client)) {
        sendConfigErrorMessage(client);
        return {statusCode: 0, desc:"Not a user"}

    }

    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${client.userid}`).get();
    var subStatus = user.donated === 1 ? "✅" : "❌";
    var autobookStatus = user.autobook === 1 ? "✅" : "❌";
    
    
    if (client.platform=="Discord"){
        var imgurl;
        switch (user.gym){
            case "fit4less":
                imgurl="https://s3-media0.fl.yelpcdn.com/bphoto/T92xYSBIJE5Zo6TznLceBw/l.jpg";
                break;
            case "lafitness":
                imgurl="https://media.glassdoor.com/sqll/309696/la-fitness-international-llc-squarelogo.png";
                break;
            case "crunchfitness":
                imgurl="https://assets.simon.com/tenantlogos/30202.png"
                break;
        }
        const msg = new Discord.MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x61bf33)
            .setThumbnail(imgurl)
            .addFields(
                {name: "Premium", value: subStatus, inline: true},
                {name: "Gym", value: user.gym, inline: true},
                {name: "Email", value: user.email, inline: true},
                {name: "Password", value: user.password, inline: true},
                {name: "Location", value: user.location, inline: true},
                {name: "Backup Location", value: user.locationBackup, inline: true},
                {name: "Autobooking", value: autobookStatus, inline: true},
                {name: "Weekday Time Slot", value: user.begin +' - '+ user.end, inline: true},
                {name: "Weekend Time Slot", value: user.beginWeekend +' - '+ user.endWeekend, inline: true}
                );

        if (user.donated ==1 && user.autobook==0) {
            msg.setFooter("We noticed you have Premium, toggle auto-booking using `!autobook`");
        }

        if (user.donated ==0) {
            msg.setFooter("Dont have Premium?, upgrade at shorturl.at/frFR1");
        }

        client.message.author.send(msg);
    } else if (client.platform=="Facebook"){
        //pass
    }
    return {statusCode: 0, premiumStatus: subStatus, gym: user.gym, email: user.email, password: user.password, location: user.location, locationBackup: user.locationBackup, autobookStatus, begin: user.begin, end: user.end, beginWeekend: user.beginWeekend, endWeekend: user.endWeekend}
}

function setConfig(client) {
    console.log(`[setConfig] ${client.userid}`);

    if (!isUser(client)) {
        console.log("Creating entry");

        db.prepare(`INSERT INTO ${dbName} (id, gym, email, password, location, locationBackup, begin, end, beginWeekend, endWeekend, platform) VALUES ('${client.userid}', '${client.gym}', '${client.email}', '${client.password}', '${client.location}', '${client.locationBackup}', '${client.begin}', '${client.end}', '${client.beginWeekend}', '${client.endWeekend}', '${client.platform}')`).run();
        sendCreateUserMessage(client);
        return {statusCode: 0, action:"create", desc: "Creating user"}

    } else {
        console.log("Updating entry");

        db.prepare(`UPDATE ${dbName} SET gym='${client.gym}', email='${client.email}', password='${client.password}', location='${client.location}', locationBackup='${client.locationBackup}', begin='${client.begin}', end='${client.end}', beginWeekend='${client.beginWeekend}', endWeekend='${client.endWeekend}', platform='${client.platform}' WHERE id='${client.userid}'`).run();
        sendUpdateUserMessage(client);
        return {statusCode: 0, action:"update", desc: "Updating existing user"}
    }
}

function updateField(client, fieldKey, fieldVal) {
    console.log(`[updateField]: ${fieldKey}: ${fieldVal}`);

    
    if (client.platform=="Discord"){
        if (!isUser(client)) {
            sendConfigErrorMessage(client.id);
            return {code: 2, desc: "Not user"}
        }
    
        if (fieldKey == "gym" ) {
            if (!isValidGym(fieldVal)) {
                sendInvalidGymMessage(client)
                return {code: 3, desc: "Invalidgym"}
            }
        }
    
        if (fieldKey == "location" || fieldKey == "locationBackup") {
            if (!isValidLocation(fieldVal, undefined)) {
                sendInvalidLocationMessage(client)
                return {code: 3, desc: "Invalid Location/Backup Location"}
            }
            
        }
    
        if (fieldKey == "begin" || fieldKey == "end" || fieldKey == "beginWeekend" || fieldKey == "endWeekend" ) {
            if (!isValidTime(fieldVal)) {
                sendInvalidTimeMessage(client);
                return {code: 3, desc: "Invalid Time"}
            }
        } 

        const msg = new Discord.MessageEmbed()
            .setTitle("CONFIG")
            .setColor(0x009cdf)
            .setDescription(
                `Updating your config: **${fieldKey}** to **${fieldVal}**`
            );
            client.message.author.send(msg);

        getConfig(client);

    }else if (client.platform == "Facebook"){
        var options = {
            method: 'POST',
            url: `https://graph.facebook.com/v10.0/me/messages?access_token=${facebookToken}`,
            data: {
                "messaging_type": "RESPONSE",
                "recipient": {
                  "id": client.userid
                },
                "message": {
                  "text": `Updating *${fieldKey}* to *${fieldVal}* within your gym configuration`
                }
            }
        }
        axios.request(options).then(function (response) {}).catch(function (error) {console.error(error);});
    }

    db.prepare(`UPDATE ${dbName} SET ${fieldKey}='${fieldVal}' WHERE id=${client.userid}`).run();
    return {code: 0, desc: `Updated Field ${fieldKey}: ${fieldVal}`}
}

// MAIN COMMANDS

function book(client) {

    let id = client.userid;
    let username = client.username;
    console.log(`[book] ${id}`);

    if (!isUser(client)) {
        sendConfigErrorMessage(client);
        console.log("failed to book");
        return {statusCode: null, desc: "Not a BookMeBot user"}
    }

    // if (client.platform=="Discord"){
    //     sendLockDownMessage(client);
    // }
    // return {statusCode: 2, desc: "Gym Closed"}
    
    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
            .setTitle(`:muscle: Booking :muscle:`)
            .setColor(0xff0000)
            .setDescription(
                `Checking ${user.gym} for available times, this may take a few seconds`
            )
            .addFields(
                {name: "Location", value: user.location, inline: true},
                {name: "Backup Location", value: user.locationBackup, inline: true},
                {name: "Weekday Time Slot", value: user.begin +' - '+ user.end, inline: true},
                {name: "Weekend Time Slot", value: user.beginWeekend +' - '+ user.endWeekend, inline: true}
                );
        client.message.reply(msg);
    }

    console.log("Booking time manually");
    console.log("Performing action on", user.email, user.password);

    locationBackup= (user.locationBackup==null) ? "null" : user.locationBackup

    try{
        execSync(`python3 -m api ${user.gym} book '${user.password}' '${user.email}' '${user.location}' '${locationBackup}' '${user.begin}' '${user.end}' '${user.beginWeekend}' '${user.endWeekend}'`);
    } catch(error){
        // console.log("error",error)
        stderr=error.stderr.toString('utf8')
        stdout=error.stdout.toString('utf8')
        console.log("stderr", stderr);
        console.log("stdout", stdout);
        console.log('final exit code is', error.status);

        // # 0 : At least one booking
        // # 1 : Invalid location
        // # 2 : Gym closed
        // # 3 : Max booked
        // # 6 : Not a gym member

        logBookResponse(client, 'book', error.status);

        switch (error.status){

            case 200:
                if (client.platform=="Discord"){
                    checkReserved(client)
                }
                return {statusCode: 200, desc: "Successfully booked"}

            case 1:
                sendInvalidLocationMessage(client);
                return {statusCode: 1, desc: "Invalid Location"}
            case 2:
                sendGymClosedMessage(client);
                return {statusCode: 2, desc: "Gym Closed"}
            case 3:
                sendMaxBookedMessage(client);
                if (client.platform=="Discord"){
                    checkReserved(client)
                }
                return {statusCode: 3, desc: "Maximum Booked"}
            case 6:
                sendNotGymUserMessage(client);
                return {statusCode: 6, desc: "Not a gym member"}
            default:
                return {statusCode: 500, desc: "API Error"}
            }
    }

}

function autobook(client) {
    let id = client.userid;
    let username = client.username;
    console.log(`[autobook] ${id}`);
    
    if (!isUser(client)) 
        return;
    
    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();
    console.log("Performing action on", user.email, user.password);

    if (user.locationBackup == null) 
        locationBackup = "null";
    else 
        locationBackup = user.locationBackup;
    
    console.log(`python3 -m api ${user.gym} autobook '${user.password}' '${user.email}' '${user.location}' '${locationBackup}' '${user.begin}' '${user.end}' '${user.beginWeekend}' '${user.endWeekend}'`)

    exec(`python3 -m api ${user.gym} autobook '${user.password}' '${user.email}' '${user.location}' '${locationBackup}' '${user.begin}' '${user.end}' '${user.beginWeekend}' '${user.endWeekend}'`,
        function (error, stdout, stderr) {
            console.log(stderr);
            console.log(stdout);
        }
    ).on('exit', code => {
        console.log('final exit code is', code);
        logBookResponse(client, 'autobook', code);
    });

    console.log("\n");
}

function checkReserved(client) {
    let id = client.userid;
    console.log(`[checkReserved] ${id}`);

    if (!isUser(client)) {
        sendConfigErrorMessage(client);
        console.log("failed to checkReserved");
        return {statusCode: null, desc: "Not a user"}
    }

    var user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${id}`).get();

    try{
        execSync(`python3 -m api ${user.gym} reserved ${user.password} ${user.email}`);
    } catch(error){
        // console.log("error",error)
        stderr=error.stderr.toString('utf8')
        stdout=error.stdout.toString('utf8')
        console.log("stderr", stderr);
        console.log("stdout", stdout);
        console.log('final exit code is', error.status);

        // # 1 : Invalid location
        // # 2 : Gym closed
        // # 3 : Max booked
        // # 6 : Not a gym member

        logReservedResponse(client, error.status)

        switch (error.status){
            case 200:
                if (client.platform=="Discord"){
                    const msg = new Discord.MessageEmbed()
                        .setTitle(":grey_exclamation:Future bookings:grey_exclamation:")
                        .setColor(0xffa500)
                        .setDescription(stdout);
                    client.message.author.send(msg);
                }
                return {statusCode: 200, desc: stdout}
            case 4:
                sendNoReservationsMessage(client);
                return {statusCode: 4, desc: "No Reservations available"}
            case 6:
                sendNotGymUserMessage(client);
                return {statusCode: 6, desc: "Not a gym member"}
            default:
                return {statusCode: 500, desc: "API Error"}
        }
    }
    
}


function autobookToggle(client) {
    let id = client.userid;
    console.log(`[autobookToggle] ${id}`);

    if (!isUser(client)){
        console.log("failed to autobookToggle");
        return {statusCode: 1, desc: "Failed to toggle autobook - Not a user"}
    }

    if (!isSubscriber(client)){
        sendDonationErrorMessage(client);
        console.log("failed to autobookToggle");
        return {statusCode: 2, desc: "Failed to toggle autobook - Not a sub"}
    }

    var toggleValue = db.prepare(`SELECT autobook FROM ${dbName} WHERE id=${id}`).get().autobook;
    if (toggleValue == 0){toggleValue = false; newToggleValue = true;}
    else{toggleValue = true; newToggleValue = false}

    db.prepare(`UPDATE ${dbName} SET autobook=${newToggleValue} WHERE id=${id}`).run();

    sendAutobookToggleMessage(client, newToggleValue);

    console.log(toggleValue, "->", newToggleValue);
    
    return {statusCode: 200, desc: "Successfully toggled autobook", toggleStatusNew: newToggleValue}
}

module.exports={
    getConfig,
    setConfig,
    updateField,
    book,
    autobook,
    checkReserved,
    autobookToggle,
 };
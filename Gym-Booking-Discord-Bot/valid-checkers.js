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
    updateUsername
} = require("./event-loggers.js")

const { 
    sendInvalidTimeMessage, 
    sendInvalidLocationMessage, 
    sendInvalidGymMessage, 
    sendInvalidLoginMessage
} = require("./chat-messages.js");

// Methods
function isUser(client) {
    console.log("[isUser]")

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id='${client.userid}'`).get();
    if (user == undefined) {
        console.log("Not a user");
        return false;
    }
    updateUsername(client);
    console.log("Is a user")
    return true;
}

function isValidGym(gym) {
    console.log("[isValidGym]")
    if (!["lafitness", "fit4less", "crunchfitness"].includes(gym)){
        return false;
    }
    return true
}

function isValidLocation(client, location) {
    console.log("[isValidLocation]")

    const validLocations = [];
    var data;
    switch (client.gym){
        case "fit4less":
            data = fs.readFileSync("./resources/fit4less-locations.txt", "UTF-8");
            break;
        case "lafitness":
            data = fs.readFileSync("./resources/lafitness-locations.txt", "UTF-8");
            break;
        case "crunchfitness":
            data = fs.readFileSync("./resources/crunchfitness-locations.txt", "UTF-8");
            break;
    }
    const lines = data.split(/\r?\n/);
    lines.forEach((line) => {
        validLocations.push(line);
    });

    return validLocations.includes(location)

}

function isValidTime(time) {
    console.log("[isValidTime]")

    return /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])/.test(time) || /^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])/.test(time)

}

function isValidLogin(client) {
    console.log("[isValidLogin]")

    try{
        execSync(`python3 -m api ${client.gym} login ${client.password} ${client.email}`);
    } catch(error){
        // console.log("error",error)
        console.log("stdout",error.stdout.toString('utf8'));
        console.log('final exit code is', error.status);
        switch (error.status){
            case 5:
                return false;
            case 0:
                return true;
        }
    }
    return true;
}

function getGym(client) {
    console.log("[getGym]")

    if (!isUser(client)){
        console.log("No Gym")
        return null
    }

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${client.userid}`).get();
    return user.gym
}

function getAutobookStatus(client){
    console.log("[getAutobookStatus]");

    if (!isUser(client)){
        return null
    }

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${client.userid}`).get();
    var val;
    if(user.autobook==0){
        val = "OFF";
    }
    else{
        val = "ON";
    }
    return val
}

module.exports={
    isUser,
    isValidGym,
    isValidLocation,
    isValidLogin,
    isValidTime,
    getGym,
    getAutobookStatus
 };
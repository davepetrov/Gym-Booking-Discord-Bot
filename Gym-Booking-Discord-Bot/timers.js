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
} = require("./constants.js");

const { 
    autobook, 
} = require("./commands.js");

const { 
    updateSubscriptionsDiscord, 
    updateSubscriptionsFacebook
} = require("./subscriber-helpers.js");

const { 
    sendAvailabilityNotification, 
} = require("./chat-notifications.js");

var autobookSet = 0;
console.log("BMB TIMERS: Actively performing timed actions");

function doAutobookingTrigger(){
    var d = new Date();
    var time = d.getMinutes();
    if (time==0 || time==30){
    // if (time==0 || time==15|| time==30 || time==45){

        console.log(`[Autobooking... Autobook count set ${autobookSet}]\n--------------------------------------------------------`);
        var toggledUsers = db.prepare(`Select * from ${dbName} WHERE ${dbName}.autobook=1`).all();

        toggledUsers.forEach(function (user) {
            let client = Object.create(Client);
            client.userid=user.id;
            client.username=user.username
            autobook(client);

        });
        autobookSet += 1;
    }
}
setInterval(function () {
    doAutobookingTrigger()
}, 60000); 

doAutobookingTrigger()

// setInterval(function () {
//     updateSubscriptionsDiscord()
//     updateSubscriptionsFacebook()
// }, 300000); 

// setInterval(function () {
//     var d = new Date();
//     var time = d.getMinutes();
//     if (time==0 || time==15|| time==30 || time==45){
//         var toggledUsers = db.prepare(`Select * from ${dbName} WHERE ${dbName}.autobook=1 AND ${dbName}.donated=1`).all();

//         toggledUsers.forEach(function (user) {
//             let client = Object.create(Client);
//             client.userid=user.id;
//             client.username=user.username
//             client.platform=user.platform
//             client.gym=user.gym
//             client.email=user.email
//             client.password=user.password
//             client.location=user.location
//             client.locationBackup=user.locationBackup
//             client.begin=user.begin
//             client.end=user.end
//             client.beginWeekend=user.beginWeekend
//             client.endWeekend=user.endWeekend
//             console.log("SEND Availability Notification")
//             // sendAvailabilityNotification(client);
//         });
//         autobookSet += 1;
//     }
// }, 60000); 

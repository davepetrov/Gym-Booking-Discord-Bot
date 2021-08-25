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

function sendAvailabilityNotification(client) {
    let id = client.userid;
    console.log(`[sendAvailabilityNotification] ${id}`);

    if (client.platform != "Facebook"){
        return;
    }

    var availabilityStdout;
    
    exec(`python3 -m api ${user.gym} available ${user.password} ${user.email} ${user.location} ${locationBackup} ${user.begin} ${user.end} ${user.beginWeekend} ${user.endWeekend}`,
        function (error, stdout, stderr) {
            availabilityStdout = stdout
            console.log(stdout);
            console.log(stderr);
            console.log("Checking reserved complete");
        }
    ).on('exit', code => {
        console.log('final exit code is', code);
        logReservedResponse(client, code)
    });

    var options = {
        method: 'POST',
        url: `https://graph.facebook.com/v10.0/me/messages?access_token=${facebookToken}`,
        data: {
            "messaging_type": "RESPONSE",
            "recipient": {
              "id": client.userid
            },
            "message": {
              "text": `Available Slots\n\n${availabilityStdout}`
            }
        }
    }
    axios.request(options).then(function (response) {
        
    }).catch(function (error) {
        console.error(error);
    });


    // Use discord api to send message to discord id 
    
}

module.exports={
    sendAvailabilityNotification
 };

// Methods
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


function logBookResponse(client, command, status){
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
    var desc;
    switch (status){
        case 0:
            desc="Successfully booked"
            break;
        case 1:
            desc="Incorrect location"
            break;
        case 2:
            desc="Gym closed"
            break;
        case 3:
            desc="Maxed booked"
            break;
        case 4:
            desc="No spots available/No Reservations"
            break;
        case 500:
            desc="API Error"
            break;
        default:
            desc="Unknown Error"
            break;
    }
    db.prepare(`INSERT INTO ${dbAuditName} (user_id, command, status, desc) VALUES ('${client.userid}', '${command}', '${status}', '${desc}')`).run();
}

function logReservedResponse(client, status){
    // # Errorcodes: 
    // # 0 : Success
    // # 500: Api error
    // # 400: User error
    var desc;
    switch (status){
        case 0:
            desc="Received Reserved response"
            break;
        case 500:
            desc="API Error"
            break;
        default:
            desc="Unknown Error"
            break;
    }
    db.prepare(`INSERT INTO ${dbAuditName} (user_id, command, status, desc) VALUES ('${client.userid}', 'reserved', '${status}', '${desc}')`).run();
}

function updateUsername(client) {
    db.prepare(`UPDATE ${dbName} SET username='${client.username}' WHERE id=${client.userid}`).run();
}

module.exports={
    logBookResponse,
    logReservedResponse,
    updateUsername,
};
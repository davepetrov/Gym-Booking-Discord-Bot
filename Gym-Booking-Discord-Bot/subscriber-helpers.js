

//Methods
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
const { isUser } = require("./valid-checkers.js");

function isSubscriber(client) {

    // Already Know client is a user so we're chillin
    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id=${client.userid}`).get();

    if (user.donated == 1) {
        console.log("is Donator");
        return true;
    }
    return false;
}

function endSubscription(client) {
    console.log("[endSubscription]")

    if (!isUser(client)){
        console.log("Unable to end subscription")
        return false
    }

    console.log("Ending subscription for", client.userid)
    db.prepare(`UPDATE ${dbName} SET donated=0 WHERE id=${client.userid}`).run();
    return true
}

function startSubscription(timestamp, client) {
    console.log("[startSubscription]")

    if (!isUser(client)){
        console.log("Unable to start subscription")
        return {status: 2, desc: "Not a user"}
    }

    console.log("Starting subscription for", client.userid, 'at', timestamp)
    db.prepare(`UPDATE ${dbName} SET donated=1, transactionDate='${timestamp}' WHERE id='${client.userid}'`).run();

    const user = db.prepare(`SELECT * FROM ${dbName} WHERE id='${client.userid}'`).get();
    if (user.donated==0){
        return {status: 1, desc: "Something went wrong with the database"}
    }
    return {status: 0, desc: "Succesfully subscribed"}

}

function updateSubscriptionsDiscord(){
    // Doesnt work
    var id;
    var username;  
    var offset=0;
    var has_more=true
    var donation;

    // while (has_more){ //Need to fix, axios call is async so has_more keep going to infi
    var options = {
        method: 'GET',
        url: `https://api.upgrade.chat/v1/orders?access_token=${accessToken}&offset=${offset}`,
        headers: {'content-type': 'application/json'}
    };
    
    axios.request(options).then(function (response) {
        for (var i=0; i<response.data.total; i++){
            donation = response.data.data[i]
            
            let client = Object.create(Client);
            client.username=donation.user.username;
            client.userid = donation.user.discord_id;
            
            console.log("Checking upgrade.chat for new donation:" , client.userid, client.username);
    
            if (isSubscriber(client)){
                if (donation.deleted) endSubscription(client);
            }
            else{
                if (!donation.deleted) startSubscription(client);
            }   
        }
        // has_more=response.data.has_more;

    
    }).catch(function (error) {
        console.error(error);
    });
    offset+=1;

    // }
}

function updateSubscriptionsFacebook(){
    console.log("[updateSubscriptionsFacebook]");

    const users = db.prepare(`SELECT * FROM ${dbName} WHERE platform='Facebook'`).get();
    for (let user of users.all()){

        let client = Object.create(Client);
        client.username = user.username;
        client.userid = user.id;

        if (isSubscriber(client) && strtotime(user.transactionDate) < strtotime('-30 days')){
            endSubscription(client);
        } 
    }
}

module.exports={
    isSubscriber,
    startSubscription,
    endSubscription,
    updateSubscriptionsDiscord,
    updateSubscriptionsFacebook
};
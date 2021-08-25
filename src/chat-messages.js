
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

// const { 
//     getConfig, 
//     setConfig, 
//     updateField, 
//     book, 
//     checkReserved,
//     autobookToggle, 
// } = require("./commands.js");

// MESSAGES
function sendConfigErrorMessage(client) {
    let id = client.userid;
    console.log(`[sendConfigErrorMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle(":question: ERROR :question:")
        .setColor(0xff0000)
        .setDescription(
            "Dont forget to setup your configuration using `!config new`"
        );
        client.message.author.send(msg);

    }else if (client.platform=="Facebook"){
        var options = {
            method: 'POST',
            url: `https://graph.facebook.com/v10.0/me/messages?access_token=${facebookToken}`,
            data: {
                "messaging_type": "RESPONSE",
                "recipient": {
                  "id": client.userid
                },
                "message": {
                  "text": "Don't forget to setup your configuration by typing 'new'"
                }
            }
        }
        axios.request(options).then(function (response) {
            
        }).catch(function (error) {
            console.error(error);
        });
    }
}

function sendFieldErrorMessage(client, field, value) {
    let id = client.userid;
    console.log(`[sendFieldErrorMessage] ${id}, ${field}:${value}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle(":question: ERROR :question:")
        .setColor(0xff0000)
        .setDescription(
            `Sorry, ${field} is not a valid configuration field, *please check !help*`
        );
        client.message.author.send(msg);

    }
}

function sendInvalidTimeMessage(client) {
    let id = client.userid;
    console.log(`[sendInvalidTimeMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
            .setTitle(":question: ERROR :question:")
            .setColor(0xff0000)
            .setDescription(
                `Your time slot time is in the wrong format. ##:## format is accepted`
            );
        client.message.author.send(msg);
    }
}

function sendHelpMessage(client) {
    let id = client.userid;
    console.log(`[sendHelpMessage] ${id}`);

    const desc = config["message"]["sendHelpMessage"].join("\n");

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
            .setTitle(":question: COMMANDS :question:")
            .setColor(0x7EC8E3)
            .setDescription(desc)
            .setFooter("Any issues? DM us on Instagram @BookMeBot");
        client.message.author.send(msg);
    }
}

function sendDonationErrorMessage(client){
    let id = client.userid;
    console.log(`[sendDonationErrorMessage] ${id}`);
    

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
            .setTitle("❌ SUBSCRIPTION ❌")
            .setColor(0xffa500)
            .setDescription("You must be have Premium to be eligible for this feature.\n *To unlock premium, click [Here]( https://upgrade.chat/753734592212762625");
        client.message.author.send(msg);
    }
}

function sendLocationsMessage(client) {
    let id = client.userid;
    console.log(`[sendLocationsMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
            .setTitle(`🗺️ Locations} 🗺️`)
            .setColor(0x7EC8E3)
            .setDescription(
                "Find your location by going to www.BookMeBot.com/locations and copy your exact location here. Check !help for more help"
            );
        client.message.author.send(msg);
    }
}

function sendConfigGym(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with a gym** *Accepted Gyms include LaFitness or Fit4Less or CrunchFitness*`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
}

function sendConfigEmail(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with your ${client.gym} login email/username**`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
}

function sendConfigPassword(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with you ${client.gym} login password**`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
}

function sendConfigLocation(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with a valid ${client.gym} location**`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
}

function sendConfigLocationBackup(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with a valid ${client.gym} BACKUP location**`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
}

function sendConfigStart(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with a time you go to the gym on the WEEKDAY** *Proper Format: ##:##*`)
        .setColor(0x009cdf)
        client. message.author.send(msg);
    }
}

function sendConfigEnd(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with a time you leave the gym on the WEEKDAY** *Proper Format: ##:##*`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
}

function sendConfigWeekendStart(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with a time you go to the gym on the WEEKEND** *Proper Format: ##:##*`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
}

function sendConfigWeekendEnd(client){
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setDescription(`**Reply with a time you leave the gym on the WEEKEND** *Proper Format: ##:##*`)
        .setColor(0x009cdf)
        client.message.author.send(msg);
    }
    
}

function sendInvalidLocationMessage(client){
    
    let id = client.userid;
    console.log(`[sendInvalidLocationMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle("Invalid Location")
        .setColor(0xff0000)
        .setDescription("Check !locations for all valid location");
        client.message.author.send(msg);
        
    }
}

function sendInvalidGymMessage(client){
    let id = client.userid;
    console.log(`[sendGymLocationMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle("Invalid Gym")
        .setColor(0xff0000)
        .setDescription("Not **Fit4less** or **LaFitness** or **CrunchFitness**");
        client.message.author.send(msg);
    }
}

function sendInvalidLoginMessage(client){
    let id = client.userid;
    console.log(`[sendGymLocationMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle(`Invalid Login`)
        .setColor(0xff0000)
        .setDescription(`BookMeBot is unable to verify your credentials, check your login information`);
        client.message.author.send(msg);
    }
}

function sendGymClosedMessage(client){
    let id = client.userid;
    console.log(`[sendGymClosedMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle(":grey_question: ERROR :grey_question:")
        .setColor(0xff0000)
        .setDescription("Your gym is currently closed, check another location");
        client.message.author.send(msg);
    }
}

function sendNotGymUserMessage(client){
    let id = client.userid;
    console.log(`[sendNotGymUserMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle(":grey_question: ERROR :grey_question:")
        .setColor(0xff0000)
        .setDescription("Seems like you're not longer an active member at your gym");
        client.message.author.send(msg);
    }
}

function sendMaxBookedMessage(client){
    let id = client.userid;
    console.log(`[sendMaxBookedMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle(":grey_question: Maximum Bookings :grey_question:")
        .setColor(0xffa500)
        .setDescription("Looks like you're completely booked at the moment. Perhaps your gym set an upper bound to how many slots you can reserve at a time?");
        client.message.author.send(msg);
        
    }
}

function sendDefaultMessage(client) {
    let id = client.userid;
    console.log(`[sendDefaultMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle(":grey_question: ERROR :grey_question:")
        .setColor(0x75E6DA)
        .setDescription("Use `!help` for correct usage(s)");
        client.message.author.send(msg);
    }
}

function sendNewConfigMessage(client) {
    let id = client.userid;
    console.log(`[sendNewConfigMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle("Setting Up Gym Configuration")
        .setColor(0x75E6DA)
        .setDescription("Type `cancel` if you choose to discontinue setting up your configuration");
        client.message.author.send(msg);
    }
}



function sendUpgradeMessage(client) {
    let id = client.userid;
    console.log(`[sendUpgradeMessage] ${id}`);
    
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setTitle("BookMeBot Premium")
        .setColor(0xFFD700)
        .addFields(
            {name: "Features", value: "- Create/Retrieve configuration "
            + "\n- Create Manual-Booking through discord"
            + "\n- Retrieve all active bookings"
            + "\n- *Toggle Auto-Booking on/off*"
            + "\n- *Be guaranteed a spot for your preferred time and location*"},
            {name: "Upgrade using our Certified Stripe Partner", value: "https://upgrade.chat/753734592212762625"});
        client.message.author.send(msg);
    }
}
    
function sendLockDownMessage(client) {
    let id = client.userid;
    console.log(`[sendLockDownMessage] ${id}`);
    
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
            .setTitle("BookMeBot")
            .setColor(0xFF0000)
            .setDescription("Due to COVID-19 gym restrictions, gyms in your region are closed. We apologize for this temporary inconvenience")
            .setFooter("If your gym is open, please let @Pea know")
        client.message.author.send(msg);
    }
    
    
}

function sendUpdateUserMessage(client){
    let id = client.userid;
    console.log(`[sendUpdateUserMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setColor(0x009cdf)
        .setDescription(
            "**Updating** your existing config. *You can now use `!book` to book with your updated config*"
        );
        client.message.author.send(msg);
        // getConfig(client);
    }
    
}
function sendCreateUserMessage(client){
    let id = client.userid;
    console.log(`[sendCreateUserMessage] ${id}`);
    
    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
        .setColor(0x61bf33)
        .setDescription(
            "**Creating** new config for you. *You can now use !book to book with your new config*"
        );
        client.message.author.send(msg);
        // getConfig(client);
    }
}

// Dont use for now
function sendCancelConfig(client) {
    // let id = client.userid;
    // console.log(`[sendLockDownMessage] ${id}`);
    
    // if (client.platform=="Facebook"){
    //     var options = {
    //         method: 'POST',
    //         url: `https://graph.facebook.com/v10.0/me/messages?access_token=${facebookToken}`,
    //         data: {
    //             "messaging_type": "RESPONSE",
    //             "recipient": {
    //               "id": client.userid
    //             },
    //             "message": {
    //               "text": "Cancelling configuration"
    //             }
    //         }
    //     }
    //     axios.request(options).then(function (response) {
            
    //     }).catch(function (error) {
    //         console.error(error);
    //     });
    // }   
}

function sendAutobookToggleMessage(client, newToggleValue){
    let id = client.userid;
    console.log(`[sendAutobookToggleMessage] ${id}`);

    if (client.platform=="Discord"){
        var msg = new Discord.MessageEmbed().setTitle(":dash:AUTOBOOK:dash:");
    
        if (newToggleValue === false) 
            msg.setColor(0xff0000).setDescription("Autobooking Toggled OFF ❌ ");
        else 
            msg.setColor(0x00ff00).setDescription("Autobooking Toggled ON ✅ - *You will now be autobooked and guaranteed a spot starting NOW until you toggle autobooking off with `!autobook`*");
        
        client.message.author.send(msg);
    }
    
}

function sendNoReservationsMessage(client){
    let id = client.userid;
    console.log(`[sendNoReservationsMessage] ${id}`);

    if (client.platform=="Discord"){
        const msg = new Discord.MessageEmbed()
            .setTitle(":grey_exclamation:No Reservations:grey_exclamation:")
            .setColor(0xffa500)
            .setDescription("Seems like you have no active reservations");
        client.message.author.send(msg);
    }
}

module.exports={
    sendUpdateUserMessage,
    sendCreateUserMessage,
    sendConfigErrorMessage,
    sendFieldErrorMessage,
    sendInvalidTimeMessage,
    sendHelpMessage,
    sendDonationErrorMessage,
    sendLocationsMessage,
    sendInvalidLocationMessage,
    sendInvalidGymMessage,
    sendInvalidLoginMessage,
    sendGymClosedMessage,
    sendMaxBookedMessage,
    sendDefaultMessage,
    sendNewConfigMessage,
    sendConfigGym,
    sendConfigEmail,
    sendConfigPassword,
    sendConfigLocation,
    sendConfigLocationBackup,
    sendConfigStart,
    sendConfigEnd,
    sendUpgradeMessage,
    sendConfigWeekendStart,
    sendConfigWeekendEnd,
    sendLockDownMessage,
    sendCancelConfig,
    sendAutobookToggleMessage,
    sendNotGymUserMessage,
    sendNoReservationsMessage
};

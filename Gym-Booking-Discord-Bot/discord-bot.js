/***

Author: David Petrov
Run using `node discord-bot.js`

Desc: This program starts the BookMeBot discord bot

Node Dependencies include:
    "axios": "^0.21.1",
    "better-sqlite3": "^7.1.5",
    "discord.js": "^12.5.3"

    Can be found in the package.json file if this is outdated
***/

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
    sendConfigWeekendEnd
} = require("./chat-messages.js");

const { 
    getConfig, 
    setConfig, 
    updateField, 
    book, 
    checkReserved,
    autobookToggle, 
} = require("./commands.js");

const { 
    isValidGym,
    isValidLocation,
    isValidTime,
    isValidLogin
} = require("./valid-checkers.js");

// Start
bot.login(discordToken);

// Bot online msg
bot.on("ready", () => {
    console.log("BMB DISCORD: Gym Bot is now Online with new updates");
    bot.user.setActivity("[DM ME TO USE]", {type: "PLAYING"})
});

// Bot recieves prompt
bot.on("message", (message) => {
    if (!message.content.startsWith(PREFIX)) return; // Not a command
    
    console.log("--------------------------------------------------------\n[USER MESSAGE]");

    let client = Object.create(Client);
    client.platform= "Discord";
    client.username = message.author.username;
    client.userid = message.author.id;
    client.message = message; 

    let args = message.content.substring(PREFIX.length).split(" ");
    let command = args[0];

    console.log("username:" + client.username);
    console.log("userid:" + client.userid);

    switch (command) {
        case "config":
            if (args.length == 1) {
                getConfig(client);
                break;
            }
            else if (args.length == 2 && args[1] == "new") {
                
                const filter = m => m.author.id == message.author.id;
                sendNewConfigMessage(client);
                sendConfigGym(client);

                // message.reply('**Reply with a gym** *Accepted Gyms include LaFitness or Fit4Less or CrunchFitness*');
                message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                    client.gym = collected.first().content.toLowerCase();
                    if (client.gym=="cancel") { message.reply(`**Cancelling configuration**`); return;}
                    if (!isValidGym(client.gym)){ 
                        sendInvalidGymMessage(client)
                        message.reply(`**Cancelling configuration**`);
                        return;
                    }

                    sendConfigEmail(client);
                    message.channel.awaitMessages(filter, {max: 1}).then(collected => {
                        client.email = collected.first().content;
                        if (client.email=="cancel") { message.reply(`**Cancelling configuration**`); return;}

                        sendConfigPassword(client)
                        message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                            client.password = collected.first().content;

                            if (client.password=="cancel") { message.reply(`**Cancelling configuration**`); return;}
                            if (!isValidLogin(client)) {
                                sendInvalidLoginMessage(client);
                                message.reply(`**Cancelling configuration**`);
                                return;
                            }
                            sendLocationsMessage(client)
                            sendConfigLocation(client);
                            message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                                client.location = collected.first().content;
                                if (client.location=="cancel") { message.reply(`**Cancelling configuration**`); return;}

                                if (!isValidLocation(client,client.location)) {
                                    sendInvalidLocationMessage(client);
                                    message.reply(`**Cancelling configuration**`);
                                    return;
                                };
                            
                                sendLocationsMessage(client)
                                sendConfigLocationBackup(client)
                                message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                                    client.locationBackup = collected.first().content;
                                    if (client.locationBackup=="cancel") { message.reply(`**Cancelling configuration**`); return;}

                                    if (!isValidLocation(client,client.locationBackup)) {
                                        sendInvalidLocationMessage(client);
                                        message.reply(`**Cancelling configuration**`);
                                        return
                                    
                                    };

                                    sendConfigStart(client)
                                    message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                                        client.begin = collected.first().content;
                                        if (client.begin=="cancel") { message.reply(`**Cancelling configuration**`); return;}

                                        if (!isValidTime(client.begin)) {
                                            sendInvalidTimeMessage(client);
                                            message.reply(`**Cancelling configuration**`);
                                            return;
                                        }

                                        sendConfigEnd(client);
                                        message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                                            client.end = collected.first().content;
                                            if (client.end=="cancel") { message.reply(`**Cancelling configuration**`); return;}
                                            
                                            if (!isValidTime(client.end)) {
                                                sendInvalidTimeMessage(client);
                                                message.reply(`**Cancelling configuration**`);
                                                return;
                                            }

                                            sendConfigWeekendStart(client)
                                            message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                                                client.beginWeekend = collected.first().content;
                                                if (client.beginWeekend=="cancel") { message.reply(`**Cancelling configuration**`); return;}

                                                if (!isValidTime(client.beginWeekend)) {
                                                    sendInvalidTimeMessage(client);
                                                    message.reply(`**Cancelling configuration**`);
                                                    return;
                                                }

                                                sendConfigWeekendEnd(client);
                                                message.channel.awaitMessages(filter,{max: 1}).then(collected => {
                                                    client.endWeekend = collected.first().content;
                                                    if (client.endWeekend=="cancel") { message.reply(`**Cancelling configuration**`); return;}
                                                    
                                                    if (!isValidTime(client.endWeekend)) {
                                                        sendInvalidTimeMessage(client);
                                                        message.reply(`**Cancelling configuration**`);
                                                        return;
                                                    }

                                                    setConfig(client);
                                                    
                                                }).catch((e) => {
                                                    message.reply('Error: Operation canceled'+e);
                                                });
                                            }).catch(() => {
                                                message.reply('Error: Operation canceled');
                                            });
                                        }).catch(() => {
                                            message.reply('Error: Operation canceled');
                                        });
                                    }).catch(() => {
                                        message.reply('Error: Operation canceled');
                                    });
                                }).catch(() => {
                                    message.reply('Error: Operation canceled');
                                });
                            }).catch(() => {
                                message.reply('Error: Operation canceled');
                            });
                        }).catch(() => {
                            message.reply('Error: Operation canceled');
                        });
                    }).catch(() => {
                        message.reply('Error: Operation canceled');
                    });
            }).catch(() => {
                message.reply('Error: Operation canceled');
            });
            break

            }
            else if (args.length == 3) {
                let configKey = args[1];
                let configValue = args[2];
                switch (configKey.toLowerCase()) {
                    case "gym":
                        updateField(client, "gym", configValue);
                        
                        break;
                        
                    case "email":
                        updateField(client, "email", configValue);
                        break;

                    case "password":
                        updateField(client, "password", configValue);
                        break;

                    case "location":
                        updateField(client, "location", configValue);
                        break;

                    case "backuplocation":
                        updateField(client, "locationBackup", configValue);
                        break;

                    case "weekdaybegintime":
                        updateField(client, "begin", configValue);
                        break;

                    case "weekdayendtime":
                        updateField(client, "end", configValue);
                        break;

                    case "weekendbegintime":
                        updateField(client, "beginWeekend", configValue);
                        break;

                    case "weekendendtime":
                        updateField(client, "endWeekend", configValue);
                        break;

                    default:
                        sendFieldErrorMessage(client, configKey, configValue);
                        break;
                }
                break;
            }
            sendHelpMessage(client);
            break;

        case "autobook":
            autobookToggle(client);
            break;

        case "book": //Books the time for you within the specfic time range
            book(client);
            break;

        case "reserved": //Lists you the times you are current booked for
            checkReserved(client);
            break;

        case "locations":
            sendLocationsMessage(client);
            break;

        case "premium":
        case "upgrade":
            sendUpgradeMessage(client);
            break;

        case "help":
            sendHelpMessage(client);
            break;

        default:
            sendDefaultMessage(client);
            break;
    }
});


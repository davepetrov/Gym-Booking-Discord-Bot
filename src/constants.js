const execSync = require("child_process").execSync;
const exec = require("child_process").exec;
const fs = require('fs');
const Discord = require("discord.js");
const axios = require('axios');


const bot = new Discord.Client();
const config = require("./resources/config.json");
const db = require("better-sqlite3")(config["db-path"]);
const dbName = config["users-logs-database"]; ; // TEST for testing OR USER for deploy
const guildId = config["guild-id"];
const premiumRoleId = config["premium-role-id"];
const accessToken = config["upgrade-chat"]["access-token"];
const dbAuditName = config["booking-logs-database"]; 

const discordToken=config["discord"]["discord-token"];
const discordAccessToken=config["discord"]["access-token"];
const PREFIX = config["command-prefix"];
const facebookToken =config["facebook-access-token"];

var Client = {
    message: Discord.Message,
    platform: String, //Discord or Facebook
    username: String,
    userid: String,
    gym: String,
    email: String,
    password: String,
    location: String,
    locationBackup: String,
    begin: String,
    end: String,
    beginWeekend: String,
    endWeekend: String
}; 


module.exports={
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
};


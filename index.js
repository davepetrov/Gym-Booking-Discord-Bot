const Discord = require('discord.js');
const bot = new Discord.Client();
const token = 'NzUzNzM0NTEyNzEzNzkzNjg5.X1qf9w.RvOK6SfyYRC1LGtveeNoOLfqjdo';

var exec = require("child_process").exec

let PREFIX = "!";

bot.on('ready', () =>{
    console.log("Fit4Less Bot is Online")
})

bot.on('message', message=>{
    let args = message.content.substring(PREFIX.length).split(" ");
    var ready = 0;
    switch (args[0]){
        case 'login':
            console.log(args.length, "arguments sent")
            if (args.length==5 && (args[1] === 'set' || args[1] === 'update')){
                var password = args[2];
                var email = args[3];
                var location = args[4].replace("-", ' ');
                ready = 1;
                message.reply("Login set for user "+email+ " with pass "+ password + " at " + location);
                
                
            }else{
                message.reply("Invalid command, Usage: !login set/update [PASSWORD] [EMAIL] [EXACT FIT4LESS LOCATION]");
            }
            break;
        case 'book':
            if (ready === 1){
                message.reply("Booking time slots for you");
                
                // exec("./python3 fit4less-workout-booker.py dp05092001 peamap101@gmail.com 'North York Centerpoint Mall'");
            }
            else{
                message.reply("Please login into fit4less to begin booking");
                message.reply("Usage: !login set/update [PASSWORD] [EMAIL] [EXACT FIT4LESS LOCATION]");
            }
            break;
    }
    
})

bot.login(token);

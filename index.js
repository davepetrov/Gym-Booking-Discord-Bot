const {Client} = require('discord.js');
const bot = new Client();
const token = 'NzUzNzM0NTEyNzEzNzkzNjg5.X1qf9w.RvOK6SfyYRC1LGtveeNoOLfqjdo';
const exec = require('child_process').exec

let PREFIX = "!";

bot.on('ready', () =>{
    console.log("Fit4Less Bot is Online")
})


bot.on('message', message=>{
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    let args = message.content.substring(PREFIX.length).split(" ");
    var ready = 0;
    console.log(args.length, "arguments sent");
    switch (args[0]){
        case 'book':
            if (args.length==4){
                var password = args[1];
                var email = args[2];
                var location = args[3].replace(/-/g, ' ');
                console.log(location);
                message.reply("Booking set for user "+email+ " at " + location); //Public
                message.author.send("Thanks for using Fit4Less Bot. Logging into Fit4Less with "+ email+' : '+ password); //private
                console.log('./python3 fit4less-workout-booker.py '+password+' '+email+ ' '+location)
                // exec('./python3 fit4less-workout-booker.py '+password+' '+email+ ' '+location, 
                //     (error, stdout, stderr) => console.log(stdout))
                exec('python3 fit4less-workout-booker.py '+password+' '+email+ ' '+location,
                    function (error, stdout, stderr) {
                        console.log(stdout);
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
        
            }else{
                message.reply("Invalid command, Usage: !book [PASSWORD] [EMAIL] [EXACT FIT4LESS LOCATION]");
            }
            break;
    }  
})

bot.login(token);

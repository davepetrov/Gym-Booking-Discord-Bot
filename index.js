const {Client} = require('discord.js');
const bot = new Client();
const token = 'NzUzNzM0NTEyNzEzNzkzNjg5.X1qf9w.RvOK6SfyYRC1LGtveeNoOLfqjdo';
const exec = require('child_process').exec

let PREFIX = "!";

bot.on('ready', () =>{
    console.log("Fit4Less Bot is Online");
})


bot.on('message', message=>{
    if (!message.content.startsWith(PREFIX) || message.author.bot) return; // Not a command

    let args = message.content.substring(PREFIX.length).split(" ");
    var ready = 0;
    console.log(args.length, "arguments sent");
    switch (args[0]){
        case 'book': //Books the time for you within the specfic time range
            if (args.length==6){
                console.log(location);
                var password = args[1];
                var email = args[2];
                var location = args[3];
                message.reply("Booking set for user "+email+ " at " + location); //Public
                message.author.send("Thanks for using Fit4Less Bot. Logging into Fit4Less with "+ email+' : '+ password); //private
                message.author.send("Checking Fit4less for available times, this may take a minute...");
                exec('python3 fit4less-workout-booker.py '+'book'+' '+password+' '+email+ ' '+location+' ' + args[4] +' '+args[5],
                    function (error, stdout, stderr) {
                        message.author.send(stdout) //private
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
        
            }else{
                message.reply("Use !help for correct usage");
            }
            break;
        case 'reserved': //Lists you the times you are current booked for
            if (args.length==3){
                console.log(location);
                var password = args[1];
                var email = args[2];
                message.author.send("Checking Fit4less for reserved times, this may take a minute...");
                exec('python3 fit4less-workout-booker.py '+'reserved'+' '+password+' '+email,
                    function (error, stdout, stderr) {
                        message.author.send(stdout) //private
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
            }
            else{
                message.reply("Use !help for correct usage");
            }
            break;

        case 'locations':
            message.author.send("Available Locations", {
                files:['./locations.txt']
            });
            message.author.send("Copy the location and use that as a location argument when using !book")
            
            break;
             
        case 'help':
            message.reply("!book [PASSWORD]  [EMAIL]  [EXACT FIT4LESS LOCATION]  [MINIMUM TIME RANGE (24hr)]  [MAXIMUM  TIME RANGE (24hr)]");
            message.reply("!reserved [PASSWORD]  [EMAIL]"); 
            message.reply("!locations"); 
            message.reply("!help");
            break;
    }  
})

bot.login(token);

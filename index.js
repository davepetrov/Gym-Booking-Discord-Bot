const {Client, MessageEmbed} = require('discord.js');
const bot = new Client();
const token = 'NzUzNzM0NTEyNzEzNzkzNjg5.X1qf9w.fe12kb9nHAjTe-8Zt2CWOlry8IE';
const exec = require('child_process').exec


let PREFIX = "!";

bot.on('ready', () =>{
    console.log("Fit4Less Bot is Online with new updates");
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
                const publicmsg = new MessageEmbed()
                    .setTitle("Booking set for user "+email+ " at " + location)
                    .setColor(0xff0000)
                    .setDescription(("Checking Fit4less for available times, this may take a minute..."));

                message.reply(publicmsg); //Public
                exec('python3 fit4less-workout-booker.py '+'book'+' '+password+' '+email+ ' '+location+' ' + args[4] +' '+args[5],
                    function (error, stdout, stderr) {
                        
                        const bookingmessage = new MessageEmbed()
                            .setTitle("You are booked for the following times")
                            .setColor(0xffa500)
                            .setDescription((stdout));

                        message.author.send(bookingmessage) //private
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
        default:
            message.author.send("Use !help for correct usage")
    }  
})


// Create an event listener for new guild members
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to Fit4Less Bot Server, ${member}`);
  });

bot.login(token);

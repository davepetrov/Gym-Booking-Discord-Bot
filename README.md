![Gym-Booking-Discord-Bot](https://socialify.git.ci/davepetrov/Gym-Booking-Discord-Bot/image?description=1&font=Inter&language=1&owner=1&pattern=Diagonal%20Stripes&theme=Light)

# ANNOUNCEMENT
`A new version of the bot is coming out on Friday Evening. Features include automated booking with toggle switch, Saved ENCRYPTED config so you wouldnt need to constantly type your login when you use the !book and !reserved commands. `

*  *  *  *  *

## Description
A Discord bot that helps you book the gym times during COVID-19. Nowadays, gyms are completely booked, but now its time to workout after months of endless quarantine. Let the bot do the annoying part...the booking! Through discord, you can specify a time range that you want to work out, the specific gym(s) you are signed up for, and the bot will book the time slot for you before anyone else can take your spot and will remind you when your next work out will be. Now you can go to the gym without worrying about missing an available time slot that fits your schedule.

This bot was originally a personal project, but with Canada opening in the following weeks, more traffic is picking up so ive decided to open up the bot for public use

*  *  *  *  *

# How to use the bot 

### Add it to your server!
Simply add this bot to your discord server by clicking [here](https://discord.com/api/oauth2/authorize?client_id=812832537516310568&permissions=0&scope=bot)
### Join the discord server! (New Feature/Bug fix announcements)
You can also join my discord server by clicking [here](https://discord.gg/rrb9K42CDU). You can type your commands in the "Book here" text channel. 

###### *Note*: The bot is currently up and running. **If there are any issues**, please contact me by creating an issue request on GitHub with an attatched screenshot


*  *  *  *  *

## Commands
`!config`
#### Parameters:
- Email address
- Password
- Exact fit4less location
- Exact fit4less location (Backup)
- Minimum time range to book (24 hour)
- Maximum time range to book (24 hour)

This command sets up the configuration with all of your login details, preferred location, and your time interval for which you would want the bot to book for. The bot will find the earliest time slot available within this timestamp and book for that day, if available. For example if you are not already a user, you can call `!config default@email password123 gym-location gym-location-backup 11:00 17:00` to be added to our list of users with all the custom configuration. If you are already a user, calling the exact same command will update your previous config. *Times are in 24 hour format (##:##) and all locations are found if you call the `!locations` command*

You can also use `!config -{Field} {Value}` to update a particular field in your configuration. For example, if you want to update your previous email, call `!config -email new@email`. List of available fields include: email, password, location, locationBackup, begin, end

<img src="/images/config1-showcase.png" width="700"> <img src="/images/config2-showcase.png" width="700">

`!book` In short, this command does all the automated booking, reserving all the times within the specific time block you give it. Suppose the user is free and wants to book a time between 11:00 and 17:00 for the "Centerpoint-Mall" location. The user calls the !book command from the server and gets a private message revealing the private login information with all the booked times. *You need to setup your configuration before calling this command*

`!autobook` You can toggle on and off if you want the bot to auto book for you without you having to use the !book command every 3 days. *You need to setup your configuration before calling this command*

<img src="/images/autobook-showcase.png" width="700">

`!reserved`
Lists all of the current scheduled times. *You need to setup your configuration before calling this command*  

`!locations`
The bot replies with a list of available locations, the user will copy whichever location into the [location] field when setting up the config.

`!help`
Lists all the commands with short descriptions

*  *  *  *  *
# Donate
*Please note that the bot is free. If you feel that this utility made your life easier, do not hesitate to send a donation :) Enjoy your stress free workout*

<img src="https://1000logos.net/wp-content/uploads/2017/05/emblem-Paypal.jpg" width="20"> https://www.paypal.com/paypalme2/davidpetrovcode

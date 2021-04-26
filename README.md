[![Gym-Booking-Discord-Bot](images/readme-image.jpg)](https://bookmebot.com/)

*  *  *  *  *

## Description
The Book Me Bot™ gym chatbot allows you to easily view and autobook available times at your local gym, helping you stick to your important workout schedule and stay on track during COVID-19.

Sometimes it feels like there is no end in sight for COVID-19 restrictions. Even after vaccines are administered, government officials believe that the current situation may last for years to come. This means that even when gyms reopen, they will still enforce strict capacity rules and you will be required to book your workout time well in advance.

PROBLEM: We've all been in the same position before - you log into your gym portal, click on the calendar to view available workout times, and see that everything is booked for the next month. How are you supposed to get your pump on these days?

SOLUTION: visit www.bookmebot.com to book your workout quickly and easily, while also guaranteeing reservation times for your future workouts. Through the Discord app, you can select your gym, specify your workout time range, and let the bot book your time slot ahead of anyone else. You will also receive a reminder about your upcoming workout. Guarantee your gym booking time, EVERY TIME!



*  *  *  *  *

# How to use the bot 

### Join the discord public server! (New Feature/Bug fix announcements)
You can also join my discord server [here](https://discord.gg/PQzB4mmKMd). You can type your commands and interact with the bot by **direct messaging** the bot. *Please do not put your private config in public chats.*

###### *Note*: The bot is currently up and running. **If there are any issues**, please contact me by creating an issue request on GitHub with an attatched screenshot


*  *  *  *  *

## Commands
`!config`
#### Parameters:
- Gym (lafitness/ fit4less)
- Email Address/ Username depending on your gym
- Password
- Exact fit4less location
- Exact fit4less location (Backup)
- Minimum time range to book (24 hour)
- Maximum time range to book (24 hour)

This command sets up the configuration with all of your login details, preferred location, and your time interval for which you would want the bot to book for. The bot will find the earliest time slot available within this timestamp and book for that day, if available. For example if you are not already a user, you can call `!config new` to be added to our list of users with all the custom configuration. If you are already a user, calling the exact same command will update your previous config. *Times are in 24 hour format (##:##) and all locations are found if you call the `!locations` command*

You can also use `!config -{Field} {Value}` to update a particular field in your configuration. For example, if you want to update your previous email, call `!config -email new@email`. List of available fields include: gym, email/username, password, location, locationBackup, begin, end

#### Usage(s):

- `!config` *To get the config. You need to setup your configuration before calling this command*
- `!config new` *To get add/update your entire gym configuration*
- `!config -[FIELD] [VALUE]` *To update a specific field. You need to setup your configuration before calling this command*


`!book` 

In short this command does all the automated booking, reserving all the times within the specific time block you give it. Suppose the user is free and wants to book a time between 11:00 and 17:00 for the "Centerpoint-Mall" location. The user calls the !book command from the server and gets a private message revealing the private login information with all the booked times. *You need to setup your configuration before calling this command*

`!autobook` 

You can toggle on and off if you want the bot to auto book for you without you having to use the !book command every 3 days. *You need to setup your configuration before calling this command*

`!reserved`

Lists all of the current scheduled times. *You need to setup your configuration before calling this command*  

`!locations`

The bot replies with a list of available locations, the user will copy whichever location into the [location] field when setting up the config.

`!help`

Lists all the commands with short descriptions

*  *  *  *  *
# Donate
*Please note that the bot is free. If you feel that this utility made your life easier, do not hesitate to send a donation :) Enjoy your stress free workout. 

To donate, join the public server [here](https://discord.gg/PQzB4mmKMd) and type 'donate' in the donations text chat

# Gym-Booking-Discord-Bot
A Discord bot that helps you book the gym times during COVID-19. Nowadays, gyms are packed (out of the workout after months of quarentining), and completely booked. Let us solve this! Through discord, you can specify a time range that you want to work out, the specific gym(s) you are signed up for, and the bot will book the time slot for you, before anyone else can take your spot and will remind you when your next work out will be.

# How to use the bot
Join https://discord.gg/hA2nmE6 and use the following commands!

## Commands
### !book
#### Parameters:
  - Password
  - Email address
  - Exact fit4less location
  - Minimum time range to book
  - Maximum time range to book
#### Description/example:
In short, this command does all the automated booking, reserving all the times within the spedific time block you give it. Suppose the user is free and wants to book a time between 11:00 and 17:00 for the location "Centerpoint-Mall". The user calls the command from the server, gets a private message revealing the private login information.
  
  <img src="/images/book-showcase2.png" width="600">
  <img src="/images/book-showcase1.png" width="600">
  
  
### !reserved
#### Parameters:
- Password 
- Email
#### Description:
Lists all the times the user is currently schedueledfor

<img src="/images/reserved-showcase.png" width="600">
  
  
### !locations
The bot replies with a list of availabe locations, the user will copy whichever location into the [location] paramters when booking with !book
   
### !help
Lists all the commands with short descriptions

## TODO:
Add a login command that saves the user's information

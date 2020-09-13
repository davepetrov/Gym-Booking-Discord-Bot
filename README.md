# Gym-Booking-Discord-Bot [Still in the works]
A Discord bot that helps you book the gym times during COVID-19. Nowadays, gyms are packed (out of the workout after months of quarentining), and completely booked. Let us solve this! Through discord, you can specify a time range that you want to work out, the specific gym(s) you are signed up for, and the bot will book the time slot for you, before anyone else can take your spot and will remind you when your next work out will be.

# How to use the bot
Join https://discord.gg/hA2nmE6 and use the following commands!
### !book
  #### Parameters:
  password, email, exact fit4less location, minimum wanted time range to book for, maximum wanted time range to book for

  Suppose the user is free and wants to book a time between 11:00 and 17:00 for the location "Centerpoint-Mall". The user calls the command from the server, gets a private message revealing the private login information. The login fails, bot will tell you
  ![book-showcase](/images/book-showcase2.png)
  ![book-showcase](/images/book-showcase1.png)
  
  
### !reserved
  #### Parameters:
  password, email

  Lists all the times the user is currently schedueled for
  ![reserved-showcase](/images/reserved-showcase.png)
  
  
### !locations
   The bot replies with a list of availabe locations, the user will copy whichever location into the [location] paramters when booking with !book
   
### !help
    Lits all the commands in a single message

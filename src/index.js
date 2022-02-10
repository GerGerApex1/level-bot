require('dotenv').config()
const { Client, Collection } = require('discord.js')
const initalize = require('./initalize')

const client = new Client({
    intents: ['GUILDS', "GUILD_MEMBERS", "GUILD_MESSAGES"],
})
client.xpSystem = new Collection()
client.config = { events: new Collection(), messageCommands: new Collection(), xpSystem: {} }
initalize(client)
client.on("ready", () => {
    console.log('Bot is now ready.\nMore infomation: [Bot Tag: ' + client.user.tag + " Bot Prefix: " + process.env.Prefix)
})
client.login(process.env.DISCORD_TOKEN)
//const chalk = require("chalk")
const mongoose = require("mongoose")
const fs = require('fs');
const { Collection, MessageEmbed } = require("discord.js");
// Paths
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
const messageCommands = fs.readdirSync('./src/messageCommands').filter(file => file.endsWith('.js'));


module.exports = async (client) => {
    const configFile = require('../config.json')
    console.log('-------------------Loading Functions----------------')
    async function loadDatabase() {
        if (process.env.MONGODB_URI === '') return console.log('Variable: MONGO_URI is blank/empty.')
        await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: true, useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Bot is connected to the database.')
        return true
    }
    async function loadConfig() {
        client.config.xpSystem = configFile.xpSystem
        for (const i in configFile.events) {
            client.config.events.set(i, configFile.events[i])
        }
        for (const i in configFile.messageCommands) {
            client.config.messageCommands.set(i, configFile.messageCommands[i])
        }
    }
    async function loadEvents() {
        for await (const file of eventFiles) {
            if (!file === '') return;
            const event = require(`./events/${file}`);
            if (event.name === undefined && event.type === undefined && event.on === undefined) return console.log(`Automatically Disabled Event File: ${file}`);
            const eventConfig = client.config.events.get(event.name)
            if (typeof eventConfig != "boolean" || eventConfig === false) return console.log(`Event: ${event.name} is disabled or set as empty from the config file.`)
            if (event.on === true) {
                client.on(event.type, (...args) => {
                    try {
                        event.run(...args, client);
                    } catch (error) {
                        console.log(`Oops. An error.\n\n ${error}\n Name: ${event.name} Event Type: ${event.type}`)
                    }
                });
                console.log("Sucessfully loaded on event: " + event.name)

            } else if (event.on === false) {
                client.once(event.type, async (...args) => {
                    try {
                        event.run(...args, client);
                    } catch (error) {
                        console.log(`Oops. An error.\n\n ${Error}\n Name: ${event.name} Event Type: ${event.type}`)
                    }
                });
                console.log("Sucessfully loaded once event " + event.name)
            } else {
                console.log(`Unknown value: ${file.on} on ${file} `)
            }
        }
        return true
    }
    async function loadMessageCommands() {
        const commandList = new Collection()
        for await (const file of messageCommands) {
            if (!file === "") return;
            const command = require(`./messageCommands/${file}`);
            if (!command.name) return;
            const commandConfig = client.config.messageCommands.get(command.name)
            if (typeof commandConfig != "boolean" || commandConfig === false) return console.log(`Command: ${command.name} is disabled or set as empty from the config file. `)
            commandList.set(command.name, command)
            console.log(`Command Enabled Sucessfully : ${command.name}`)
        }
        client.on('messageCreate', message => {
            if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;
            const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            if (!commandList.has(command)) return;

            try {
                commandList.get(command).run(message, client)
            } catch (error) {
                if (process.env.ENABLE_MESSAGE_ERROR === "true") {
                    const embed = new MessageEmbed()
                        .setTitle("Oops... An error.")
                        .setDescription(`Error Message: \`\`\`${error}\`\`\`\n Please contact the bot owner.`)
                    message.channel.send({ embeds: [embed] })
                } else {
                    console.log(`Oops. An error.\n\n ${Error}\n Command: ${command}`)
                }
            }
        })
        return true
    }
    loadConfig()
    await loadDatabase()
    await loadMessageCommands()
    await loadEvents()
    console.log('-------------Completed Loading Functions------------')
}
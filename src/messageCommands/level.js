const { MessageEmbed } = require('discord.js')
const schema = require('../schemas/userData')

async function getUserData(_userId) {
    const result = schema.findOne({
        _id: _userId,
    })
    return result
}


module.exports = {
    name: "level",
    description: "shit",
    async run(message, client) {
        const { totalXp, levelXp, level } = await getUserData(message.author.id)
        const embed = new MessageEmbed()
            .setTitle("Level Info")
            .setDescription("Your current stats")
            .setFields(
                { name: "Current Level", value: `${level}`, inline: false },
                { name: "Total Xp", value: `${totalXp}`, inline: false },
                { name: "Current Xp", value: `${levelXp}`, inline: false },
            )
            .setFooter("Command Executed by: " + message.author.tag)
            .setThumbnail(message.author.avatarURL())
        message.channel.send({ embeds: [embed] })
    },
}
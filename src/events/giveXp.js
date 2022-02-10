const mongoose = require('mongoose')
const schema = require('../schemas/userData')

async function updateUserData(userId, level, totalXp, levelXp) {
    const result = await schema.findOneAndUpdate({
        _id: userId,
    }, {
        levelXp,
        totalXp,
        level,
    }, {
        upsert: true,
    })
    return result;
}
async function getUserData(_userId) {
    const result = schema.findOne({
        _id: _userId,
    })
    return result
}

module.exports = {
    name: "giveXp",
    type: "messageCreate",
    on: true,
    async run(message, client) {
        if (message.author.bot) return;
        if (await getUserData(message.author.id) != null) {
            const configXp = client.config.xpSystem.xpPerMessage
            let { totalXp, levelXp, level } = await getUserData(message.author.id)

            const userXpAdded = Math.floor(Math.random() * (configXp.maxXp - configXp.minXp)) + configXp.minXp
            client.xpSystem.set(message.author.id, {
                xp: totalXp += userXpAdded,
                level: level,
            })

            // eslint-disable-next-line no-inline-comments
            const formulaToNextLevel = 5 * Math.pow(level, 2) + (50 * level) + 100 // Using Mee6 formula from https://github.com/Mee6/Mee6-documentation/blob/master/docs/levels_xp.md . You can change it whatever you want.
            totalXp += userXpAdded
            levelXp += userXpAdded

            if (levelXp >= formulaToNextLevel) {
                level = level + 1
                levelXp = levelXp - formulaToNextLevel
                client.xpSystem.set(message.author.id, {
                    currentXp: levelXp,
                    totalXp: totalXp,
                    level: level,
                })
                message.channel.send(`${message.author.tag} has reached lvl ${level} `)
            }
            await updateUserData(message.author.id, level, totalXp, levelXp)
        } else {
            const { defaultLevel, defaultXp } = client.config.xpSystem
            await updateUserData(message.author.id, defaultLevel, defaultXp, defaultXp)
        }
    },
}
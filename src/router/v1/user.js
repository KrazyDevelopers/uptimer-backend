const login = require("../../models/login");
const userData = require("../../models/user");
const { decode } = require("../../utility");

module.exports = (router, shit, next) => {
    router.get('/code', async (req, res) => {
        const { validity = "0", isOwner = "0" } = req.query;

        let { code } = req.query;

        code = (decode(code) || "");

        if (!code) return res.send(validity === "1" ? { valid: false } : null);

        const d = await login.findOne({ code });

        if (validity === "1") {
            return res.send({ valid: !d ? false : true })
        } else {
            const db = await userData.findOne({ id: d.id });

            if (!db) return res.send({ valid: false })

            if (db) {
                delete db.accessToken;
                delete db.refreshToken;
            }

            if (isOwner === "1") db.owner = router.owners.includes(code.slice(process.env.LOGIN_SECRET.length + 4));

            return res.send({
                id: db.id,
                username: db.username,
                avatar: db.avatar,
                email: db.email,
            })
        }
    });

    router.get("/:code/guilds", async (req, res) => {
        let { code } = req.params;

        try {
            code = (decode(code) || "");
        } catch (e) {
            code = null;
        }

        const d = await login.findOne({ code });

        if (!code || !d) return res.send({ valid: false });

        const data = await userData.findOne({ id: d.id })

        const botGuilds = router.client.guilds.cache.toJSON();

        let userGuilds = (await (await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${data.accessToken}`
            }
        })).json()) || [];
        
        userGuilds = Array.isArray(userGuilds) ? userGuilds.filter((guild) => (guild.permissions & 0x20) === 0x20).map(v => {
            v.icon = v.icon ? `https://cdn.discordapp.com/icons/${v.id}/${v.icon}.${v.icon.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/attachments/723104565708324915/990084783948320908/unknown.png";

            return v;
        }) : [];

        const mutualGuilds = userGuilds.filter(g => botGuilds.some(v => v.id === g.id));
        const inviteGuilds = userGuilds.filter(g => !botGuilds.some(v => v.id === g.id));

        res.send({
            mutualGuilds, inviteGuilds
        })
    })

    next();
}
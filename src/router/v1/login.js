const login = require("../../models/login");
const userData = require("../../models/user");
const { randomID } = require('create-random-id');
const { parse } = require("../../utility");

module.exports = (router, shit, next) => {
    router.get('/', async (req, res) => {
        const { code } = req.query;

        if (!code) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=722071202654322688&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20email`);

        const response = await (await fetch(`https://discord.com/api/oauth2/token?grant_type=authorization_code&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&code=${code}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=authorization_code&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&code=${code}`
        })).json();

        if (response.error) return res.send(response);

        const data = await (await fetch(`https://discord.com/api/v10/users/@me`, {
            headers: {
                Authorization: `Bearer ${response.access_token}`
            }
        })).json();

        const { id, username, email, avatar: av } = data;
        const avatar = av ? `https://cdn.discordapp.com/avatars/${id}/${av}.${av.startsWith("a_") ? "gif" : "png"}` : "https://cdn.discordapp.com/attachments/723104565708324915/990084783948320908/unknown.png"

        const tokenRaw = process.env.LOGIN_SECRET + randomID(4) + data.id, token = parse(tokenRaw);

        const x = await login.findOneAndUpdate({ id }, { createdAt: Date.now(), code: tokenRaw }) || await login.create({ id, createdAt: Date.now(), code: tokenRaw });
        const y = await userData.findOneAndUpdate({ id }, { username, email, avatar, accessToken: response.access_token, refreshToken: response.refresh_token }) || await userData.create({ id, createdAt: Date.now(), username, email, avatar, accessToken: response.access_token, refreshToken: response.refresh_token });

        res.redirect(`http://localhost:3000/login?token=${encodeURIComponent(token)}`)
    });

    next();
}
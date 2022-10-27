const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: String,
    accessToken: String,
    refreshToken: String,
})

module.exports = model("uptimer_bot-User_config", userSchema);
const { model, Schema } = require('mongoose');

module.exports = model('login_data_code_stored', new Schema({
    code: String,
    id: String,
    createdAt: Number,
}))
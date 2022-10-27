require("dotenv").config();

// Imports
const Discord = require('discord.js');
const { fastify } = require("fastify");

// database connection
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

// Setting up the Server
const app = fastify({
});

// Creating the client instance
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", 32768],
    partials: ["REACTION", "MESSAGE"]
});

client.owners = ["723049421021118535", "441943765855240192"];

// Logging in the client!
client.login(process.env.TOKEN);

app.client = client;
app.owners = client.owners;

app.register(require('@fastify/cors'), {
    origin: true,
    methods: ["GET"],
    credentials: true,
});

app.register(require("./utility/handler"));

app.setNotFoundHandler((req, res) => {
    res.status(404).send({ message: "Invalid Route" });
});

app.listen({ port: process.env.PORT || 3001, host: process.env.HOST || "0.0.0.0" }, async (s, r) => {
    console.log(`Server Started ${s || r}`);
});

// Error Handling
process.on('uncaughtException', function (err) {
    console.log(`[${new Date().toDateString()}] Caught exception: `);
    console.log(err);
});
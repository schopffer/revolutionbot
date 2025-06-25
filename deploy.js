require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const CLIENT_ID = process.env.CLIENT_ID;  // Mets ton bot ID dans .env
const GUILD_ID = '1385409088263028939';  // Ton serveur Discord

const commands = [
  new SlashCommandBuilder()
    .setName('blague')
    .setDescription('Raconte une blague pour rigoler 😄'),

  // Tu peux ajouter d’autres commandes ici
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Déploiement des commandes...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commandes déployées sur le serveur');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
  }
})();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

const commands = [
  new SlashCommandBuilder()
    .setName('blague')
    .setDescription('Raconte une blague')
    .toJSON(),
  // ajoute d'autres commandes ici...
];

(async () => {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Déploiement des commandes...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Commandes déployées.');
  } catch (error) {
    console.error(error);
  }
})();

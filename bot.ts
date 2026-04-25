import * as fs from 'node:fs';
import * as path from 'node:path';
import { Client, Events, GatewayIntentBits, Collection, MessageFlags } from "discord.js";
import { TOKEN } from "./env.js";
import "./databaseManager.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands : any = new Collection();

client.on(Events.InteractionCreate, async (interaction : any) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command ${interaction.commandName} found.`);
        return;
    }

    try { await command.execute(interaction); }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral,
            });
        }

        else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

// Filling in the commands property so we know what function to run when an interaction occurs
{
    const foldersPath = path.join(import.meta.dirname, "commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter((file : any) => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(filePath);

            if ("data" in command && "execute" in command) {
                commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    console.log("aaa" + process.argv);
    if (process.argv.includes("--deploy-commands")) {
        console.log("DEPLOYING COMMANDS!!!");
        await import("./deploy-commands.js");
        console.log("Done");
    }
}

client.login(TOKEN);


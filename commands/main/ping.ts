import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChatInputCommandInteraction, SlashCommandStringOption, MessagePayload } from "discord.js";
import { platforms } from "../../platformEntries.js";
import * as database from "../../databaseManager.js";
import * as env from "../../env.js";
import * as fs from "node:fs";
import * as path from "node:path";


const TIMESTAMP_DIR = path.join(import.meta.dirname, "../../timestamps");
const ONE_HOUR_MS = 60 * 60 * 1000;

function WriteTimestamp(platformIndex: number) {
	const data = fs.readFileSync(TIMESTAMP_DIR, "utf8");
	var times = data.toString().split(';');

	times[platformIndex] = Date.now().toString();
	fs.writeFileSync(TIMESTAMP_DIR, times.join(";"));
}


function GetTimestamp(platformIndex: number) {
	const data = fs.readFileSync(TIMESTAMP_DIR, "utf8");
	var times = data.toString().split(';');
	return Number(times[platformIndex]);
}


export const data = new SlashCommandBuilder().setName("lfg").setDescription("Ping a platform to play with");

const platformOption = new SlashCommandStringOption();
platformOption.setRequired(true).setName("platform").setDescription("The platform you're looking to play on");
for (var platformEntry in platforms) {
	const platform = platforms[platformEntry]!;
	platformOption.addChoices({ name: platform.display, value: platformEntry });
}

data.addStringOption(platformOption);
data.addStringOption(description =>
	description.setRequired(false)
		.setMaxLength(1000)
		.setDescription("A descriptor for your LFG post")
		.setName("description"));


export async function execute(interaction: ChatInputCommandInteraction) {
	if (interaction.channelId != env.CHANNEL_ID) {
		await interaction.reply( { content: `This isn't https://discord.com/channels/${env.GUILD_ID}/${env.CHANNEL_ID}!`, flags: MessageFlags.Ephemeral } )
		return;
	}

	const commandPlatform = interaction.options.getString("platform", true);
	const userData = database.GetUserData(interaction.user.id);

	if (userData === null || userData[commandPlatform] === undefined) {
		await interaction.reply(
			{
				content: `It looks like you don't have an identifier set for ${commandPlatform}!\nPlease set one with \`/identifier set\` so people know how to add you!`,
				flags: MessageFlags.Ephemeral
			});
		return;
	}


	const platformData = platforms[commandPlatform]!;
	const pingEmbed = new EmbedBuilder().setColor(Number(platformData.color)).setTitle(`${interaction.user.globalName} Is Looking For A Game!`);

	var identifier = userData[commandPlatform];

	const lastPingTime = GetTimestamp(platformData.index);
	if (lastPingTime && Date.now() - lastPingTime < ONE_HOUR_MS) {
		const nextAllowedTime = lastPingTime + ONE_HOUR_MS;
		await interaction.reply({ content: `Try pinging again <t:${Math.floor(nextAllowedTime / 1000)}:R>!`, flags: MessageFlags.Ephemeral });
		return;
	}


	const foundDescription = interaction.options.getString("description");
	pingEmbed.addFields(
		{ name: platformData.identifier, value: identifier },
		{ name: "DESCRIPTION", value: foundDescription ?? "None" });

	WriteTimestamp(platformData.index);
	await interaction.reply({ content: `<@&${platformData.roleId}>!`, embeds: [pingEmbed] });
}
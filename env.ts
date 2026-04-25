process.loadEnvFile("./config.env");

export const TOKEN : string = process.env.TOKEN!;
export const CLIENT_ID : string = process.env.CLIENT_ID!;
export const GUILD_ID : string = process.env.GUILD_ID!;
export const CHANNEL_ID : string = process.env.CHANNEL_ID!;
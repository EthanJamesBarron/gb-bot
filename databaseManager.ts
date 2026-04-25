// The database is synchronous due to the more reliable nature
// We're not scaling big enough that this approach is going to become a problem
// --== TODO: IMPLEMENT VERBOSE LOGGING, THIS IS WAY TOO BAREBONES ==--
import * as levelDB from "level";
import { start } from "node:repl";

const database = new levelDB.Level("lfgDatabase", { valueEncoding: "json" });


export function GetUserData(userId: string) {
    try {
        var userData = database.getSync(userId.toString());
        if (userData === undefined) {
            userData = GenerateUserData(userId);
        }

        const json = JSON.parse(userData);
        return json;
    }

    catch (err) {
        return null;
    }
}

// Return bool to pass successfulness?
export function SetUserData(userId: string, platform: string, identifier: string) {
    const userData = GetUserData(userId);
    if (userData === null) { return null; }

    if (platform === null) { return; }

    userData[platform] = identifier;

    database.put(userId.toString(), JSON.stringify(userData));
}

export function GenerateUserData(userId: string) {
    const startingData =
        `
        {
            "steam": "",
            "xbox": "",
            "playstation": "",
            "switch": ""
        }
        `

    database.put(userId, startingData, { sync: true });

    return startingData;
}
type Platform = { display: string, roleId: string; color: string; identifier: string; index: number, validator: Predicate<string> };
type Predicate<T> = (value: T) => boolean | string;

export const platforms: Record<string, Platform> = {
    "Steam": { display: "Steam", roleId: "416379213000736769", color: "0x21A9E9", identifier: "FRIEND CODE", index: 0, validator: validateSteam },
    "Xbox": { display: "Xbox", roleId: "514587851552325632", color: "0x5DC21E", identifier: "GAMERTAG", index: 1, validator: validateXbox },
    "PlayStation": { display: "PlayStation", roleId: "416378717644914690", color: "0x008EFF", identifier: "PSN", index: 2, validator: validatePlayStation },
    "Switch": { display: "Switch", roleId: "514587660992512021", color: "0xE92232", identifier: "FRIEND CODE", index: 3, validator: validateSwitch }
};


function validateSteam(identifier: string) {
    // Steam Friend Code
    // Must be numeric only
    // 9–10 digits long

    if (!(/^\d{8,10}$/.test(identifier))) {
        return "Invalid Steam Friend Code!";
    }
    return true;
}

function validateXbox(identifier: string) {
    // Xbox Gamertag
    // 3 to 15 characters long
    // Can contain uppercase/lowercase letters, numbers, spaces

    if (!(/^[A-Za-z0-9 ]{3,15}$/.test(identifier))) {
        return "Invalid XBOX Gamertag!";
    }
    return true;
}

function validatePlayStation(id: string) {
    // PlayStation PSN
    // Has to start with a letter followed by 2–15 characters
    // Can contain letters, numbers, underscores, hyphens
    // 3–16 characters long

    if (!(/^[A-Za-z][A-Za-z0-9_-]{2,15}$/.test(id))) {
        return "Invalid PlayStation PSN!";
    }
    return true;
}

function validateSwitch(identifier: string) {
    // Nintendo Switch Friend Code
    // Follows thy standard sw-xxxx-xxxx-xxxx
    // Each block after sw has to be 4 digits
    // Use hyphens as fixed separators

    if (!(/^sw-\d{4}-\d{4}-\d{4}$/.test(identifier.toLowerCase()))) {
        return "Invalid Switch Friend Code!";
    }
    return true;
}
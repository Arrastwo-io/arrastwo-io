//This module parses .env file data
if (!Object.fromEntries) {
    Object.fromEntries = function (entries) {
        const obj = {};
        for (const [key, value] of entries) {
            obj[key] = value;
        }
        return obj;
    };
}

module.exports = data => Object.fromEntries(data.split('\n').map(line => {
    if (!line.includes('=') || line.trim().startsWith('#')) return null;
    const key = line.slice(0, line.indexOf('='));
    const value = line.slice(line.indexOf('=') + 1);
    return (key && value) ? [key, value] : null;
}).filter(item => item !== null))

// this validates all jokes' IDs. This will be run through the CI to make sure the IDs are correct
// run this with the command "npm run reassign-ids"


// TODO: rework this


const exitWithError = (msg, err) => {
    console.log(`\n\n\x1b[31m\x1b[1m>> ${msg}:\n${err}\n\n\x1b[0m`);
    process.exit(1);
}

try
{
    const fs = require("fs-extra");
    const settings = require("../settings");

    console.log(`\nValidating joke IDs in file "${settings.jokes.jokesFilePath}"...`);

    let initialJokes = JSON.parse(fs.readFileSync(settings.jokes.jokesFilePath).toString()).jokes;
    let initialInfo = JSON.parse(fs.readFileSync(settings.jokes.jokesFilePath).toString()).info;

    if(initialInfo.formatVersion != settings.jokes.jokesFormatVersion)
        return exitWithError("Error while checking format version", `Format version in file "${settings.jokes.jokesFilePath}" (version ${initialInfo.formatVersion}) is different from the one being currently used in JokeAPI (${settings.jokes.jokesFormatVersion})`);

    let erroredJokes = [];

    initialJokes.forEach((joke, i) => {
        if(joke.id != i)
            erroredJokes.push({joke: joke, idx: i});
    });

    if(erroredJokes.length == 0)
    {
        console.log(`\x1b[32m\x1b[1mDone validating IDs of all ${initialJokes.length} jokes.\n\x1b[0m`);
        process.exit(0);
    }
    else
    {
        console.log(`\n\n\x1b[31m\x1b[1mInvalid joke ID${erroredJokes.length > 1 ? "s" : ""} found:\x1b[0m\n`);
        erroredJokes.forEach(errjoke => {
            let jokeContent = "";
            if(errjoke.joke.type == "single")
                jokeContent = errjoke.joke.joke.replace(/\n/gm, "\\n");
            else if(errjoke.joke.type == "twopart")
                jokeContent = `${errjoke.joke.setup.replace(/\n/gm, "\\n")} - ${errjoke.joke.delivery.replace(/\n/gm, "\\n")}`;

            console.log(`> #${errjoke.joke.id} | ${errjoke.joke.category} | ${jokeContent}    (Expected ID #${errjoke.idx} - joke instead has #${errjoke.joke.id})`);
        });
        console.log(`\n\x1b[33m\x1b[1mYou can run the command "npm run reassign-ids" to correct all joke IDs\n\x1b[0m`);
        process.exit(1);
    }
}
catch(err)
{
    return exitWithError("General error while validating joke IDs", err);
}

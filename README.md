# Monitorbot

Use with node v16.13 or above

## How to run:

First you need to register a discord bot/application. You can do that [here](https://discord.com/developers/applications)

You will need your client ID (also called Application ID) and client secret (discord token).

-   Docker:

    -   Use the provided docker-compose file. It will mount the repository root under `/app` inside the container.

-   Development:
    -   You can use [nodemon](https://www.npmjs.com/package/nodemon) for autoreloading. Just set a target for `npm run dev` in your IDE, or run `nodemon index.js` manually.

When the application starts, it will generate a `config.json` file in the current working directory, if it doesn't exist. Add the client ID and discord tokens to this file and restart the application.

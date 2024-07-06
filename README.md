# Instructions

To run this project you need to Node version 19 installed and PostgreSQL

* run node scripts/initDB.js in root folder to create tables in PostgreSQL
* run node app.js to launch application


## Project struture
* signin routes are in routes/siginroutes.js
* file routes are in routes/fileroutes.js
* token authentication is in middleware/authmiddleware.js
* db config is in config/config.json
* db models are in models directory

## Important notes
Each time you log out, tokens are invalidated. The tokens are different from previous tokens. Blacklist the specific token used for logout to avoid for multiple user to continue the session.
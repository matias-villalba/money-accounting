
# Money accounting App

This project has an api application build with  Loopback and with an in-memory transactional storage, and with an api rest that can be explored and tested in:

`http:localhost:3000/explorer`


### Start up the backend:
`cd money-accounting-api`

`npm i`

`npm start`

### Run test:

`npm test`


### Start up ui application (React app)
`npm i`

`npm start`

By default both apps run in port 3000. For this reason you should start up the backend app firstly, and then start up the ui app. It shuuld ask to use another PORT because 3000 is already taken. If not you should set the PORT env variable to use anothe port.
Depending on your SO it could be diferent.
For example:

`PORT=4000 npm start`.
or
`export PORT=4000 && npm start`,
etc.


### Node Version:
`v14.3.0`
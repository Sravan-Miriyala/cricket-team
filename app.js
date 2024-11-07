const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')

const app = express()
app.use(express.json())
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertDBobjToResponseObj = dbobj => {
  return {
    playerId: dbobj.player_id,
    playerName: dbobj.player_name,
    jerseyNumber: dbobj.jersey_number,
    role: dbobj.role,
  }
}

//API 1
app.get('/players/', async (request, response) => {
  const getplayersQuery = `
      SELECT
      *
      FROM
      cricket_team;
  
  `
  const playersArray = await db.all(getplayersQuery)
  response.send(playersArray.map(i => convertDBobjToResponseObj(i)))
})

//API 2
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES
    (
      ${playerName},
      ${jerseyNumber},
      ${role}); `
  const player = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})
// API 3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerQuery = `
    SELECT
    *
    FROM
    cricket_team
    WHERE 
      player_id = ${playerId};
  
  `
  const player = await db.get(getplayerQuery)
  response.send(convertDBobjToResponseObj(player))
})
//API 4
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role},
    WHERE 
        player_id = ${playerId};
  
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
//API 5
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deleteBookQuery = `
    DELETE 
    FROM
    cricket_team
    WHERE
        player_id = ${playerId};
  
  `
  await db.run(deleteBookQuery)
  response.send('Player Removed')
})

module.exports = app

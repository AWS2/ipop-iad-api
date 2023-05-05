const express = require('express')
const fs = require('fs/promises')
const url = require('url')
const mysql = require('mysql2')
const post = require('./post.js')
const { v4: uuidv4 } = require('uuid')
const { response } = require('express')
const { stat } = require('fs')
const Totem = require('./totem.js')

/* La idea de esta variable es diferenciar entre primer cliente que se conecta con ws, segundo que se conecta, etc
en la practica del Pong me sirvio, pero no estoy del todo seguro que nos vaya a hacer falta */
let clientNumber;

/* Variables para que el server mida el tiempo en partida multijugador */
let timeStartMatch;
let timeEndMatch;

/* Variable para controlar si el juego esta en ejecucion o no */

/* Variables para calcular fotogramas si dejamos eso en manso del server */
let currentFPS = 60;
let TARGET_MS = 1000 / currentFPS;
let frameCount;
let fpsStartTime;
let gameRunning;

/* Variables para ubicar los totems en el escenario */
let sceneGameWidth = 1000;
let sceneGameHeight = 1000;

// Wait 'ms' milliseconds
function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Start HTTP server
const app = express()

// Set port number
const port = process.env.PORT || 3001

// Publish static files from 'public' folder
//app.use(express.static('public'))

/* 
*** SERVERS WSS Y HTTP ***
 */

// Activate HTTP server
const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Listening for HTTP queries on: http://localhost:${port}`)
  console.log("ENVIRONMENT: The environment variables are:\nMYSQLHOST: "+process.env.MYSQLHOST + " \nMYSQLUSER: "+process.env.MYSQLUSER 
  + " \nMYSQLPASSWORD: "+process.env.MYSQLPASSWORD + " \nMYSQLDATABASE: "+process.env.MYSQLDATABASE+" \nMYSQLPORT: "+process.env.MYSQLPORT);
  // console.log("random Number Generated: "+generateRandomNumber());
  
  //showRankingTest();
  // const IP_Client = req.connection.remoteAddress;
}

// Run WebSocket server
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server: httpServer })
const socketsClients = new Map()
console.log(`Listening for WebSocket queries on ${port}`)

/* 
*** FUNCIONALIDADES DE SERVER HTTP ***
*/

/* Entrar un record o registro en el ranking, llama a una función para calcular
los puntos, he comprobado en las specs que se requiere tener los puntos almacenados 
*/
app.post('/api/set_record', setRecord)
async function setRecord (req, res) {
  console.log("set_record");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.readPost(req);
  try{
    let points = calculatePoints(receivedPost.correctTotems, receivedPost.wrongTotems);
    await queryDatabase("INSERT INTO ranking (aliasPlayer, timeStart, timeEnd, correctTotems, wrongTotems, points, cycle_idCycle) "
    +"VALUES ('"+receivedPost.aliasPlayer+", "+receivedPost.timeStart+", "+receivedPost.timeEnd+", "+receivedPost.correctTotems+", "+receivedPost.wrongTotems+"', "+points+"', "+receivedPost.idCycle+");")
    .then((results) => {
      if (results.affectedRows > 0) {
        console.log("Insert operation was successful!");
        res.end(JSON.stringify({"status":"OK","message":"Insert operation was successful!"}));
      } else {
        console.log("Insert operation did not insert any rows.");
        res.end(JSON.stringify({"status":"OK","message":"Insert operation did not insert any rows."}));
      }
    })
    .catch((error) => {
      console.error("Error executing insert query:", error);
      res.end(JSON.stringify({"status":"OK","message":"Error executing insert query"}));
    });
  }catch(e){
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({"status":"Error","message":"Failed to add the record"}));
  }
}

/* Conseguir los records o registros, el post le especificara */
app.post('/api/get_ranking', getRanking)
async function getRanking (req, res) {
  console.log("get_ranking");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.getPostObject(req);
  try{
    let start = receivedPost.start;
    let end = receivedPost.end;
    var results = await queryDatabase("SELECT * FROM ranking WHERE idRanking BETWEEN " + start +  " AND " + end + ";")    
    if(results.length > 0){
      res.end(JSON.stringify({"status":"OK","message":results}));
    }else{
      res.end(JSON.stringify({"status":"Error","message": results}));
    }
    
  }catch(e){
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({"status":"Error","message":"There has been some error"}));
  }
}



/* 
*** FUNCIONALIDADES DE SERVER WS ***
*/
// What to do when a websocket client connects
wss.on('connection', (ws) => {
  console.log("Client connected")
  console.log('socketsClients Map:');
  for (const [key, value] of socketsClients.entries()) {
    console.log(`  ${key} => ${value}`);
  }

  // Add client to the clients list

  /* Con client number podemos contar cuantos clientes se han identificado */
  const id = uuidv4()
  console.log("Client id: " + id)
  const color = Math.floor(Math.random() * 360)
  const metadata = { id, color, clientNumber}
  clientNumber++;
  socketsClients.set(ws, metadata)

  ws.send(JSON.stringify({type: "infoConnection", clientNumber: metadata.clientNumber}))

  // What to do when a client is disconnected
  ws.on("close", () => {
    socketsClients.delete(ws)
    clientNumber--;
    let idClientDisconnected = metadata.id
    console.log("Client disconnected: "+idClientDisconnected);
  })

  // What to do when a client message is received
  ws.on('message', (bufferedMessage) => {
    // console.log("Message received from client: " + bufferedMessage)

    var messageAsString = bufferedMessage.toString()
    var messageAsObject = {}
    
    try { messageAsObject = JSON.parse(messageAsString) } 
    catch (e) { console.log("Could not parse bufferedMessage from WS message") }

    /* Segun el parametro type (u otro que mandemos en el ws) podremos activar un codigo u otro
    aqui podria ir el codigo de que hacer cuando un usuario se conecta e indica que quiere jugar*/
    if(messageAsObject.type == "startGame"){
      
    }

    /* Este podria ser el mensaje del WebSocket para indicar que un usuario quiere dejar de jugar 
    Empezar a jugar y o dejar de jugar podrian ser tratados tambien con http*/
    if(messageAsObject.type == "stopGame"){
    }

    /* Aqui se deben recoger y tratar los datos que envie cada cliente respecto a su movimiento */
    if(messageAsObject.type == "movementInfo"){
      }

    // console.log("Will respond " +JSON.stringify(rst));
    ws.send(JSON.stringify(rst));
  })
})

/* 
*** OTRAS FUNCIONES COMPLEMENTARIAS ***
 */

async function showRankingTest(){
  console.log("get_rankingTest");
  console.log("The result of the query getRankingTest: "+JSON.stringify(await queryDatabase("SELECT * FROM ranking ORDER BY points DESC;")));
}


function isValidNumber(number) {
  if(typeof number =="number"){
    return true;
  }else{
    return false
  }
}

async function generateTotemsList(idCycle, numberOfTotems) {
  const totems = [];

  // Generate totems for the specified idCycle
  for (let i = 0; i < numberOfTotems; i++) {
    const totem = await generateTotem(idCycle);
    totems.push(totem);
  }

  // Get a list of other idCycles in the database
  const cycles = await queryDatabase("SELECT DISTINCT idCycle FROM cycle WHERE idCycle != ?", [idCycle]);
  const otherCycles = cycles.map((cycle) => cycle.idCycle);

  // Generate totems for the other idCycles
  for (let i = 0; i < numberOfTotems; i++) {
    const randomCycleId = otherCycles[Math.floor(Math.random() * otherCycles.length)];
    const totem = await generateTotem(randomCycleId);
    totems.push(totem);
  }

  return totems;
}

async function generateTotem(idCycle) {
  const cycles = await queryDatabase(`SELECT * FROM cycle WHERE idCycle=${idCycle}`);
  const nameCycle = cycles[0].nameCycle;

  const occupations = await queryDatabase(`SELECT * FROM ocupation WHERE cycle_idCycle=${idCycle} ORDER BY RAND() LIMIT 1`);
  const descriptionOcupation = occupations[0].descriptionOcupation;

  const posX = Math.floor(Math.random() * sceneGameWidth);
  const posY = Math.floor(Math.random() * sceneGameHeight);

  return new totem(descriptionOcupation, nameCycle, posX, posY);
}



function getDate(){
  var now = new Date();
  var formatedDate = now.getFullYear()+"/"+now.getMonth()+"/"+now.getDay()+" ";
  formatedDate += now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
  return formatedDate;
}

function startGame(){
  timeStartMatch = getDate();
  gameRunning = true;

}

/* 
*** FUNCIONES PARA LA LOGICA DEL JUEGO ***
*/

function generateTotem(idCycle){
  let text;
  let cycleLabel;
  let posX;
  let posY;
  let newTotem;

}

/* Funcion de la practica de Pong, sin la logica del pong, habra que poner la logica de nuestro juego */
function gameLoop(){
  try{
    const startTime = Date.now();

    if (currentFPS >= 1) {
      // Cridar aquí la funció que actualitza el joc (segons currentFPS)

      try{
  
        if(fps < 1){
          return;
        }


      }catch(err){
        console.log(err);
      }

      // Cridar aquí la funció que fa un broadcast amb les dades del joc a tots els clients
      var gameInfo = {};
      var rst = { type: "gameInfoBroadcast", gameInfo: gameInfo };
      broadcast(rst)
  }

  }catch(err){
    console.log(err);
  }
}

function stopLoop(){
  try{
    timeEndMatch = getDate();
  }catch(err){
    console.log(err);
  }
}

// Send a message to all websocket clients
async function broadcast (obj) {
  // console.log("Broadcasting message to all clients: " + JSON.stringify(obj))
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      var messageAsString = JSON.stringify(obj)
      client.send(messageAsString)
    }
  })
}


// Perform a query to the database
function queryDatabase (query) {

  return new Promise((resolve, reject) => {
    var connection = mysql.createConnection({
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || "root",
      password: process.env.MYSQLPASSWORD || "P@ssw0rd",
      database: process.env.MYSQLDATABASE || "ipop_game"
    });

    connection.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
     
    connection.end();
  })
}
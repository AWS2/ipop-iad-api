const express = require('express')
const fs = require('fs/promises')
const url = require('url')
const mysql = require('mysql2')
const post = require('./post.js')
const { v4: uuidv4 } = require('uuid')
const { response } = require('express')
const { stat } = require('fs')
const totem = require('./totem.js')
const playerConnected = require('./playerConnected.js');
const modelScene = require('./modelSceneClasses.js');


/* La idea de esta variable es diferenciar entre primer cliente que se conecta con ws, segundo que se conecta, etc
en la practica del Pong me sirvio, pero no estoy del todo seguro que nos vaya a hacer falta */
let clientNumber;

/* Variables para que el server mida el tiempo en partida multijugador */
let timeStartMatch;
let timeEndMatch;

/* Variable para controlar si el juego esta en ejecucion o no */
let gameRunning;
/* Variables para calcular fotogramas si dejamos eso en manos del server */
let currentFPS = 60;
let TARGET_MS = 1000 / currentFPS;
let frameCount;
let fpsStartTime;

/* Para ubicar totems en el mapa mientras los generamos esta esta classe que hace de modelo de un mapa rectangular
de momento por defecto tendra 1000 x 1000, una unidad de medida abstracta 
pero que nos permite ubicar los totems en este escenario dandoles un tamaño en este mapa*/
let currentModelScene = new modelScene.modelScene(1000, 1000);

/* Para guardar en RAM los usuarios conectados */
let listPlayersConnected = [];
let listTotemsMultiplayer = [];

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

/* 
*** FUNCIONALIDADES DE SERVER HTTP ***
*/

 
// Activate HTTP server
/* Por costumbre suelo hacer funciones y prints de testeo para probar funciones del server */
const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Listening for HTTP queries on: http://localhost:${port}`)
  console.log("The date and hour where this server started:" +getDate());
  console.log("ENVIRONMENT: The environment variables are:\nMYSQLHOST: "+process.env.MYSQLHOST + " \nMYSQLUSER: "+process.env.MYSQLUSER 
  + " \nMYSQLPASSWORD: "+process.env.MYSQLPASSWORD + " \nMYSQLDATABASE: "+process.env.MYSQLDATABASE+" \nMYSQLPORT: "+process.env.MYSQLPORT);
  // console.log("random Number Generated: "+generateRandomNumber());
  
  /* Funciones de prueba que uso para testear querys y metodos sobre la BBDD */
  
  console.log("\n__TESTS__");
  // showRankingTest();
  // showCyclesTest();
  // printRandomTotemsList(3, 10, 75, 25);
  console.log("creating test players and his totems: \n");
  addPlayer("player1", "Sistemes microinformàtics i xarxes", "127:0:0:1", uuidv4());
  addPlayer("player2", "Desenvolupament d’aplicacions multiplataforma", "127:0:0:1", uuidv4());
  recalculateTotems();
  console.log("List of players connected:"+ listPlayersConnected);

}

/* Entrar un record o registro en el ranking, llama a una función para calcular
los puntos, he comprobado en las specs que se requiere tener los puntos almacenados 
*/
app.post('/api/set_ranking', setRanking)

async function setRanking(req, res) {
  console.log("set_ranking");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.readPost(req);
  try {
    let points = calculatePoints(receivedPost.correctTotems, receivedPost.wrongTotems);
    let resultIdCycle = await ("SELECT idCycle FROM cycle WHERE nameCycle = " + receivedPost.nameCycle + ";");
    let idCycle = resultIdCycle[0].idCycle;

    let query = `INSERT INTO ranking (aliasPlayer, timeStart, timeEnd, correctTotems, wrongTotems, points, cycle_idCycle) 
                 VALUES ('${receivedPost.aliasPlayer}', '${receivedPost.timeStart}', '${receivedPost.timeEnd}', '${receivedPost.correctTotems}', 
                         '${receivedPost.wrongTotems}', '${points}', '${idCycle}');`
    queryDatabase(query).then((results) => {
        if (results.affectedRows > 0) {
          console.log("Insert operation was successful!");
          res.end(JSON.stringify({ "status": "OK", "message": "Insert operation was successful!", "inserted": true }));
        } else {
          console.log("Insert operation did not insert any rows.");
          res.end(JSON.stringify({ "status": "OK", "message": "Insert operation did not insert any rows.", "inserted": false }));
        }
      })
      .catch((error) => {
        console.error("Error executing insert query:", error);
        res.end(JSON.stringify({ "status": "OK", "message": "Error executing insert query", "inserted": false  }));
      });
  } catch (e) {
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({ "status": "Error", "message": "Error in the function to add the record", "inserted": false  }));
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
    var results = await queryDatabase("SELECT * FROM ranking WHERE idRanking BETWEEN " + start +  " AND " + end + " ORDER BY points ASC;")    
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

/* A traves de este post, el cliente puede pedir que se generen una serie de totems */
app.post('/api/generateTotems', getTotemsList)
async function getTotemsList (req, res) {
  console.log("getTotemsList");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.getPostObject(req);
  try{
    let idCycle = receivedPost.idCycle;
    let numberOfTotems = receivedPost.numberOfTotems;
    let totemWidth = receivedPost.totemWidth;
    let totemHeight = receivedPost.totemHeight;
    var results = await generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight);
    if(results.length > 0){
      res.end(JSON.stringify({"status":"OK","message":results}));
    }else{
      res.end(JSON.stringify({"status":"OK","message": results}));
    }
  }catch(e){
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({"status":"Error","message":"Error generating the totems"}));
  }
}


/* Conseguir los records o registros, el post le especificara */
app.post('/api/hide_ranking', hide_ranking)
async function hide_ranking (req, res) {
  console.log("hide_ranking");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.getPostObject(req);
  try{
    let idRanking = receivedPost.idRanking;
    let isVisible = receivedPost.visibility;
    console.log(isVisible)
    if (isVisible === true) {
      console.log("UPDATE ranking SET isVisible = false WHERE idRanking = " + idRanking + ";")
      await queryDatabase("UPDATE ranking SET isVisible = true WHERE idRanking = " + idRanking + ";")    
    } else {
      console.log("UPDATE ranking SET isVisible = false WHERE idRanking = " + idRanking + ";")
      await queryDatabase("UPDATE ranking SET isVisible = false WHERE idRanking = " + idRanking + ";")    
    }
  }catch(e){
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({"status":"Error","message":"There has been some error"}));
  }
}

/* 
*** FUNCIONALIDADES DE SERVER WS ***
*/
// Run WebSocket server
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server: httpServer })
const socketsClients = new Map()
console.log(`Listening for WebSocket queries on ${port}`)

// What to do when a websocket client connects
wss.on('connection', (ws, req) => {
  console.log('socketsClients Map:');
  for (const [key, value] of socketsClients.entries()) {
    console.log(`  ${key} => ${value}`);
  }

  // Add client to the clients list

  const IP = req.socket.remoteAddress;
  const name = req.name;
  const cycle = req.cycle;
  console.log("Client connected with IP: " + IP)

  /* Con client number podemos contar cuantos clientes se han identificado */

  /* El codigo uuidv4 es un codigo generado aleatoriamente, tiene tal cantidad de carateres
  que es practicamente imposible que se repita */
  const id = uuidv4()
  console.log("id assigned: " + id)
  const metadata = {IP, id}
  socketsClients.set(ws, metadata)
  
  // Codigo guardar conexion a la BBDD
  saveConnection(IP, id);

  /* Cuando se desconecta un cliente, se quitara tambien el usuario */
  ws.on("close", () => {
    socketsClients.delete(ws)
    let idClientDisconnected = metadata.id
    console.log("Client disconnected: "+idClientDisconnected);
    removePlayer(idClientDisconnected);
  })

  // What to do when a client message is received
  ws.on('message', (bufferedMessage) => {
    // console.log("Message received from client: " + bufferedMessage)

    var messageAsString = bufferedMessage.toString()
    var messageAsObject = {}
    
    try { messageAsObject = JSON.parse(messageAsString) } 
    catch (e) { console.log("Could not parse bufferedMessage from WS message") }

    /* Justo despues de conectarse el usuario envia nombre y ciclo, lo idoneo seria que enviara esa info por el req, pero si no funciona
    que se recojan name y cycle por aqui y se recuperen IP e id a ese ws y se guarde el ususario
    
    Guardar el usuario tambien se podria hacer en startGame*/
    if(messageAsObject.type == "sendInfoPlayer"){
      const cycle = messageAsObject.cycle;
      const name = messageAsObject.name;

      const metadata = socketsClients.get(ws);
      const IP = metadata.IP;
      const id = metadata.id;
      addPlayer(name, cycle, IP, id);
    }

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

/* 
*** FUNCIONES PARA LA LOGICA DEL JUEGO ***
*/

/* Funcion para generar totems, el server tiene almacenado el ancho y alto del escenario 
(se podria cambiar y que sean parametros que entramos en la funcion)
Esta funcion nos genera una lista de objetos totem, sera llamada por un post

Dado que le especificamos un tamaño de totem y el server tiene almacenadas
las medidas del escenario donde se generan los totems, si se piden mas totems de los que caben,
tries y maxTries cuentan los intentos de generar un totem, devolvera una lista con menos totems de los que se han pedido

Esta funcion esta pensada tanto para que un cliente en modo un jugador pida una lista de totems como para generarlos*/
async function generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight, modelScene = null) {
  const totems = [];
  const maxTries = 10;

  if (modelScene) {
    this.currentModelScene = modelScene;
  }

  let sceneGameWidth = currentModelScene.sceneGameWidth;
  let sceneGameHeight = currentModelScene.sceneGameHeight;
  let unsuitableZones = currentModelScene.unsuitableZones;

  /* Parte que nos genera los totems del ciclo */
  try {
    for (let i = 0; i < numberOfTotems; i++) {
      let totem = null;
      let tries = 0;

      while (!totem && tries < maxTries) {
        totem = await generateTotem(idCycle, totemWidth, totemHeight);

        if (totems.some(t => overlap(t, totem) 
        || isOutOfScene(totem, sceneGameWidth, sceneGameHeight) || isOverlappingUnsuitableZone(t, unsuitableZones)
        || listTotemsMultiplayer.some(m => overlap(m, totem)))) {
          totem = null;
          tries++;
        }
      }

      if (totem) {
        totems.push(totem);
      } else {
        break;
      }
    }

    /* Parte que nos genera totems de otros ciclos */
    const cycles = await queryDatabase("SELECT DISTINCT idCycle FROM cycle WHERE idCycle != "+idCycle);
    const otherCycles = cycles.map((cycle) => cycle.idCycle);

    for (let i = 0; i < numberOfTotems; i++) {
      let totem = null;
      let tries = 0;

      while (!totem && tries < maxTries) {
        const randomCycleId = otherCycles[Math.floor(Math.random() * otherCycles.length)];
        totem = await generateTotem(randomCycleId, totemWidth, totemHeight);

        if (totems.some(t => overlap(t, totem) 
        || isOutOfScene(totem, sceneGameWidth, sceneGameHeight) || isOverlappingUnsuitableZone(t, unsuitableZones)
        || listTotemsMultiplayer.some(m => overlap(m, totem)))) {
          totem = null;
          tries++;
        }
      }

      if (totem) {
        totems.push(totem);
      } else {
        break;
      }
    }

    return totems;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

/* Tres funciones basicas para comprobar que los totems no se solapen
ni consigo mismo ni con zonas no aptas ni esten parcialmente fuera del escenario */

function overlap(t1, t2) {
  return (
    t1.posX < t2.posX + t2.width &&
    t1.posX + t1.width > t2.posX &&
    t1.posY < t2.posY + t2.height &&
    t1.posY + t1.height > t2.posY
  );
}

function isOutOfScene(t, sceneWidth, sceneHeight) {
  return (
    t.posX < 0 || t.posX + t.width > sceneWidth ||
    t.posY < 0 || t.posY + t.height > sceneHeight
  );
}

function isOverlappingUnsuitableZone(totem, unsuitableZones) {
  if (!unsuitableZones) {
    return false;
  }

  for (const unsuitableZone of unsuitableZones) {
    if (overlap(totem, unsuitableZone)) {
      return true;
    }
  }

  return false;
}

async function recalculateTotems() {
  this.listTotemsMultiplayer = [];
  let sceneGameWidth = currentModelScene.sceneGameWidth;
  let sceneGameHeight = currentModelScene.sceneGameHeight;
  let unsuitableZones = currentModelScene.unsuitableZones;

  // loop through every player and generate totems for their cycle
  for (let i = 0; i < listPlayersConnected.length; i++) {
    let player = listPlayersConnected[i];

    // get cycleId from the cycle name
    const cycles = await queryDatabase("SELECT * FROM cycle WHERE nameCycle = '" + player.cycle + "'");
    const cycleId = cycles[0].idCycle;

    // generate totems for the cycle and add them to the multiplayer list
    const totems = await generateTotemsList(cycleId, 5, 75, 25);
    totems.forEach((totem) => {
      if (!listTotemsMultiplayer.some(t => overlap(t, totem) || isOutOfScene(totem, sceneGameWidth, sceneGameHeight) || isOverlappingUnsuitableZone(t, unsuitableZones))) {
        listTotemsMultiplayer.push(totem);
      }
    });
  }

  // send the list of totems to all clients
  console.log("The totems for multiplayer are: ", listTotemsMultiplayer);
  const rst = { type: "SendTotemsMultiplayer", totems: listTotemsMultiplayer };
  await broadcast(rst);
}



/* Esta funcion nos crea un totem con la descripcion 
sin las letras tipo a), b), c) etc delante ni espacios vacios por delante o detras */
async function generateTotem(idCycle, totemWidth, totemHeight) {
  const cycles = await queryDatabase(`SELECT * FROM cycle WHERE idCycle=${idCycle}`);
  const nameCycle = cycles[0].nameCycle;
  const sceneGameWidth = currentModelScene.sceneGameWidth;
  const sceneGameHeight = currentModelScene.sceneGameHeight;

  const occupations = await queryDatabase(`SELECT * FROM ocupation WHERE cycle_idCycle=${idCycle} ORDER BY RAND() LIMIT 1`);
  let descriptionOcupation = occupations[0].descriptionOcupation;

  // remove characters using regular expressions and the replace method
  descriptionOcupation = descriptionOcupation.replace(/^\w\)\s*/, ''); // remove letter and ')' at the start of the string
  descriptionOcupation = descriptionOcupation.replace(/\.\s*$/, ''); // remove '.' and spaces at the end of the string

  let posX = Math.floor(Math.random() * (sceneGameWidth - totemWidth));
  let posY = Math.floor(Math.random() * (sceneGameHeight - totemHeight));

  return new totem(descriptionOcupation, nameCycle, posX, posY, totemWidth, totemHeight);
}


/* Funcion para establecer el el escenario o mapa de juego, con un ancho y alto
y la posibilidad de añadir areas donde no de pueden generar totems */
function setModelScene(sceneGameWidth, sceneGameHeight, unsuitableZones = []) {
  const unsuitableZonesValidated = unsuitableZones.filter((zone) => zone instanceof UnsuitableZone);
  const model = new modelScene(sceneGameWidth, sceneGameHeight);
  model.unsuitableZones = unsuitableZonesValidated;
  currentModelScene = model;
}

function getDate(){
  var now = new Date();
  var formatedDate = now.getFullYear()+"/"+now.getMonth()+"/"+now.getDay()+" ";
  formatedDate += now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
  return formatedDate;
}

/* Esta funcion es la que se llamara cuando empieze el juego multijugador
Todas las variables que controlan el estado del juego se pueden resetar aqui*/
function startGame(){
  timeStartMatch = getDate();
  gameRunning = true;
  console.log("Started game execution at " + timeStartMatch);

  gameLoop();
}

/* Funcion de la practica de Pong, sin la logica del pong, habra que poner la logica de nuestro juego
que se ejecuta fotograma a fotograma */
function gameLoop(){
  try{
    const startTime = getDate();

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

/* Para guardar una conexion en BBDD */
async function saveConnection(IP, id) {
  try {
    const date = getDate();
    await queryDatabase(`INSERT INTO connections (IP, id, date) VALUES ('${IP}', '${id}', '${date}')`);
  } catch (error) {
    console.error(error);
  }
}

/* Añadir un usuario a la lista temporal */
function addPlayer(name, cycle, IP, uuidv4) {
  const newPlayer = new playerConnected(name, cycle, IP, uuidv4);
  listPlayersConnected.push(newPlayer);
}

/* Eliminar un usuario de la lista temporal */
function removePlayer(uuidv4) {
  listPlayersConnected = listPlayersConnected.filter((player) => player.uuidv4 !== uuidv4);
}

/* Para guardar un usuario en RAM, en un array y para quitarlo cuando se desconecte */


/* Esta funcion sera llamada cuando se tenga que finalizar el juego,
se puede aprovechar para resetear los valores del juego */
function stopLoop(){
  gameRunning = false;

  timeEndMatch = getDate();
  console.log("Stopped game execution at " + timeEndMatch);
}

/* 
*** OTRAS FUNCIONES COMPLEMENTARIAS y de TESTEO***
 */

async function showRankingTest(){
  console.log("showRankingTest");
  const results = await queryDatabase("SELECT * FROM ranking ORDER BY points DESC;");
  console.log("The ranking is:");
  results.forEach((result) => {
    console.log(JSON.stringify(result));
  });
}

async function showCyclesTest(){
  console.log("showCyclesTest");
  const results = await queryDatabase("SELECT * FROM cycle;");
  console.log("The cycles are:");
  results.forEach((result) => {
    console.log(JSON.stringify(result));
  });
}

async function printRandomTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight) {
  console.log("printRandomTotemsList");
  const totemsList = await generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight);
  console.log("Totems list:");
  totemsList.forEach((totem) => {
    console.log(`${totem.text}, ${totem.cycleLabel}, (${totem.posX}, ${totem.posY}), (${totem.width}, ${totem.height})`);
  });
}

function isValidNumber(number) {
  if(typeof number =="number"){
    return true;
  }else{
    return false
  }
}

// Perform a query to the database
function queryDatabase (query) {

  return new Promise((resolve, reject) => {
    var connection = mysql.createConnection({
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || "root",
      password: process.env.MYSQLPASSWORD || "localhost",
      database: process.env.MYSQLDATABASE || "ipop_game"
    });

    connection.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
     
    connection.end();
  })
}

/* En algunos metodos que llaman varias veces al metodo queryDatabase me he encontrado problemas
que parecen estar causados por el hecho de que la conexión se abre y cierra varias veces,

he creado este metodo alternativo donde antes de llamarlo se crea la conexion y se le pasa como parametro,
de esta forma solo hace query con la conexion dada, pero no la abre ni cierra */
function queryDatabaseConnection(connection, query){
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
  })
}
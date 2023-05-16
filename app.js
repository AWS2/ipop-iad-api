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
const totemsUtils = require('./totems_Utils.js');


/* La idea de esta variable es diferenciar entre primer cliente que se conecta con ws, segundo que se conecta, etc
en la practica del Pong me sirvio, pero no estoy del todo seguro que nos vaya a hacer falta */
let clientNumber;

/* Variables para que el server mida el tiempo en partida multijugador */
let timeStartMatch;
let timeEndMatch;

/* Variable para controlar si el juego esta en ejecucion o no */
let gameRunning = false;
/* Variables para calcular fotogramas si dejamos eso en manos del server */
let fps = 5;
let currentFPS = 5;
let TARGET_FPS = 5;
// let TARGET_MS = 1000 / TARGET_FPS;
const TARGET_MS = 200;
let lastBroadcastTime = 0;
let gameInterval;

/* Para ubicar totems en el mapa mientras los generamos esta esta classe que hace de modelo de un mapa rectangular
de momento por defecto tendra 1000 x 1000, una unidad de medida abstracta 
pero que nos permite ubicar los totems en este escenario dandoles un tamaño en este mapa*/
let currentModelScene = new modelScene.modelScene(1000, 1000);

/* Para guardar en RAM los usuarios conectados */
let listPlayersConnected = [];
let listTotemsMultiplayer = [];
let idTotemAvailable = 0;

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

/* *** SERVERS WSS Y HTTP ***
 */

/* *** FUNCIONALIDADES DE SERVER HTTP ***
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

  // console.log("creating test players and his totems: \n");
  // addPlayer("player1", 1, 100, 100, "Sistemes microinformàtics i xarxes",  uuidv4());
  // addPlayer("player2", 2, 200, 300, "Desenvolupament d’aplicacions multiplataforma",  uuidv4());
  // addPlayer("player3", 1, 250, 200, "Administració i finances",  uuidv4());
  // console.log("List of players connected:"+ listPlayersConnected);

  // recalculateTotems(currentModelScene, listTotemsMultiplayer, listPlayersConnected, 5, 75, 25);
  // idTotemAvailable= recalculateTotems(currentModelScene, listTotemsMultiplayer, listPlayersConnected);

  console.log("List of totems:"+ listTotemsMultiplayer);

  // let jsonRanking = {"aliasPlayer":"d","timeStart":"2023-05-08T21:12:23.554991Z","timeEnd":"2023-05-08T21:12:23.573655Z","correctTotems":0,"wrongTotems":0,"nameCycle":"Administració de sistemes informàtics en xarxa - orientat a Ciberseguretat"}
  // testSetRanking(jsonRanking);

}

/* Entrar un record o registro en el ranking, llama a una función para calcular
los puntos, he comprobado en las specs que se requiere tener los puntos almacenados 
*/
app.post('/api/set_ranking', setRanking)
async function setRanking(req, res) {
  console.log("set_ranking");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.getPostObject(req);
  try {
    let points = (receivedPost.correctTotems - (receivedPost.wrongTotems *2));
    let nameCycle = receivedPost.nameCycle;
    let resultIdCycle = await queryDatabase(`SELECT idCycle FROM cycle WHERE nameCycle = '${nameCycle}';`);
        if (resultIdCycle.length > 0) {
      let idCycle = resultIdCycle[0].idCycle;
      console.log(`Cycle id for ${nameCycle}: ${idCycle}`);

      console.log(`Time start: ${receivedPost.timeStart} Time end: ${receivedPost.timeEnd}`);
      let receivedDateStart = new Date(receivedPost.timeStart);
      let receivedDateEnd = new Date(receivedPost.timeEnd);
      console.log(`Time start receivedData: ${receivedDateStart}`);
      console.log(`Time end receivedData: ${receivedDateEnd}`);
      let formattedDateStart = receivedDateStart.toISOString().slice(0, 19).replace('T', ' ');
      let formattedDateEnd = receivedDateEnd.toISOString().slice(0, 19).replace('T', ' ');
      console.log(`Time start formatted: ${formattedDateStart}`);
      console.log(`Time end formatted: ${formattedDateEnd}`);
      let query = `INSERT INTO ranking (aliasPlayer, timeStart, timeEnd, correctTotems, wrongTotems, points, cycle_idCycle) 
                 VALUES ('${receivedPost.aliasPlayer}', '${formattedDateStart}', '${formattedDateEnd}', '${receivedPost.correctTotems}', 
                         '${receivedPost.wrongTotems}', '${points}', '${idCycle}');`
    
      queryDatabase(query).then((results) => {
          if (results.affectedRows > 0) {
            console.log("Insert operation was successful!");
            console.log({ "status": "OK", "message": "Insert operation was successful!", "inserted": true });
            res.end(JSON.stringify({ "status": "OK", "message": "Insert operation was successful!", "inserted": true }));
          } else {
            console.log("Insert operation did not insert any rows.");
            console.log({ "status": "OK", "message": "Insert operation did not insert any rows.", "inserted": false });
            res.end(JSON.stringify({ "status": "OK", "message": "Insert operation did not insert any rows.", "inserted": false }));
          }
        })
        .catch((error) => {
          console.error("Error executing insert query:", error);
          console.log({ "status": "OK", "message": "Error executing insert query", "inserted": false  });
          res.end(JSON.stringify({ "status": "OK", "message": "Error executing insert query", "inserted": false  }));
        });
    } else {
      console.log(`Cycle '${nameCycle}' not found`);
      console.log({ "status": "Error", "message": `Cycle '${nameCycle}' not found`, "inserted": false  });
      res.end(JSON.stringify({ "status": "Error", "message": `Cycle '${nameCycle}' not found`, "inserted": false  }));
    }
  } catch (e) {
    console.error("Error executing insert query:", e);
    res.end(JSON.stringify({ "status": "OK", "message": "Error executing insert query", "inserted": false  }));
  }
}

/* Funcion para hacer pruebas con setRanking, se le pasa directamente un json que simula lo que recibiria por el post */
async function testSetRanking(jsonPost) {
  console.log("testSetRanking");
  let receivedPost = jsonPost;
  try {
    let points = receivedPost.correctTotems - receivedPost.wrongTotems * 2;
    let nameCycle = receivedPost.nameCycle;

    // Get cycle id from cycle name
    let resultIdCycle = await queryDatabase(`SELECT idCycle FROM cycle WHERE nameCycle = '${nameCycle}'`);
    if (resultIdCycle.length > 0) {
      let idCycle = resultIdCycle[0].idCycle;
      console.log(`Cycle id for ${nameCycle}: ${idCycle}`);

      console.log(`Time start: ${receivedPost.timeStart} Time end: ${receivedPost.timeEnd}`);
      let receivedDateStart = new Date(receivedPost.timeStart);
      let receivedDateEnd = new Date(receivedPost.timeEnd);
      console.log(`Time start receivedData: ${receivedDateStart}`);
      console.log(`Time end receivedData: ${receivedDateEnd}`);
      let formattedDateStart = receivedDateStart.toISOString().slice(0, 19).replace('T', ' ');
      let formattedDateEnd = receivedDateEnd.toISOString().slice(0, 19).replace('T', ' ');
      console.log(`Time start formatted: ${formattedDateStart}`);
      console.log(`Time end formatted: ${formattedDateEnd}`);
      let query = `INSERT INTO ranking (aliasPlayer, timeStart, timeEnd, correctTotems, wrongTotems, points, cycle_idCycle) 
                 VALUES ('${receivedPost.aliasPlayer}', '${formattedDateStart}', '${formattedDateEnd}', '${receivedPost.correctTotems}', 
                         '${receivedPost.wrongTotems}', '${points}', '${idCycle}');`
    
      queryDatabase(query).then((results) => {
          if (results.affectedRows > 0) {
            console.log("Insert operation was successful!");
            console.log({ "status": "OK", "message": "Insert operation was successful!", "inserted": true });
          } else {
            console.log("Insert operation did not insert any rows.");
            console.log({ "status": "OK", "message": "Insert operation did not insert any rows.", "inserted": false });
          }
        })
        .catch((error) => {
          console.error("Error executing insert query:", error);
          console.log({ "status": "OK", "message": "Error executing insert query", "inserted": false  });
        });
    } else {
      console.log(`Cycle '${nameCycle}' not found`);
      console.log({ "status": "Error", "message": `Cycle '${nameCycle}' not found`, "inserted": false  });
    }
  } catch (e) {
    console.log("ERROR: " + e.stack)
    console.log({ "status": "Error", "message": "Error in the function to add the record", "inserted": false  });
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
      console.log("The ranking is:"+JSON.stringify(results));
      res.end(JSON.stringify({"status":"OK","message":results}));
      // console.log("The answer is: "+JSON.stringify(res));
    }else{
      res.end(JSON.stringify({"status":"Error","message": results}));
      // console.log("The answer is: "+res);
    }
    
  }catch(e){
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({"status":"Error","message":"There has been some error"}));
  }
}

/* A traves de este post, el cliente puede pedir que se generen una serie de totems */
app.post('/api/game_totems', getTotemsList)
async function getTotemsList (req, res) {
  console.log("getTotemsList");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.getPostObject(req);
  try{
    // let idCycle = receivedPost.idCycle;
    // let numberOfTotems = receivedPost.numberOfTotems;
    // let totemWidth = receivedPost.totemWidth;
    // let totemHeight = receivedPost.totemHeight;
    // var results = await generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight, currentModelScene, idTotemAvailable);
    var results = formatTotemsList(listTotemsMultiplayer);
    console.log("The answer will be:"+JSON.stringify(results));
    if(results.length > 0){
      res.end(JSON.stringify({"status":"OK", "type":"game_totems", "message":results}));
    }else{
      res.end(JSON.stringify({"status":"OK", "type":"game_totems","message":results}));
    }
  }catch(e){
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({"status":"Error", "type":"game_totems","message":"Error generating the totems"}));
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
    let isVisible = receivedPost.isVisible;
    // console.log(isVisible)
    if (isVisible === true) {
      console.log("UPDATE ranking SET isVisible = true WHERE idRanking = " + idRanking + ";")
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

/* *** FUNCIONALIDADES DE SERVER WS ***
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
    saveDisconnection(idClientDisconnected);

    console.log("list players:"+ listPlayersConnected.length);
    /* Si esa desconexion es la del ultimo jugador, 
    reinicia lista totems y detiene el juego, incluyendo el broadcast */
    if (listPlayersConnected.length == 0) { 
      console.log("Last player disconnected, game will stop");  
      listTotemsMultiplayer = [];
      stopLoop();
    }
  })

  // What to do when a client message is received
  ws.on('message', (bufferedMessage) => {
    console.log("Message received from client: " + bufferedMessage)
    let rst;

    var messageAsString = bufferedMessage.toString()
    var messageAsObject = {}
    
    try { messageAsObject = JSON.parse(messageAsString) } 
    catch (e) { console.log("Could not parse bufferedMessage from WS message") }

    /* Justo despues de conectarse el usuario envia nombre y ciclo, lo idoneo seria que enviara esa info por el req, pero si no funciona
    que se recojan name y cycle por aqui y se recuperen IP e id a ese ws y se guarde el ususario
    
    /* Segun el parametro type (u otro que mandemos en el ws) podremos activar un codigo u otro
    aqui podria ir el codigo de que hacer cuando un usuario se conecta e indica que quiere jugar*/
    if(messageAsObject.type == "startGame"){
      console.log("startGame");

      const nameCycle = messageAsObject.nameCycle;
      const alias = messageAsObject.player_alias;
      const spriteSelected = messageAsObject.player_sprite;

      console.log("Player wants to start game: "+alias+" "+spriteSelected+" "+nameCycle);

      const metadata = socketsClients.get(ws);
      const id = metadata.id;
      let posX =1050;
      let posY =350;
      /* Este jugador que empieza, lo añadimos a la lista de jugadores listPlayersConnected */
      addPlayer(alias, spriteSelected, posX, posY, nameCycle, id);

      /* Le pasamos nombre del ciclo, buscara la id, cuantos totems generamos y su ancho y alto */
      let idCycle = getIdCycle(nameCycle);
      // let numberOfTotems = messageAsObject.numberOfTotems;
      // let totemWidth = messageAsObject.totemWidth;
      // let totemHeight = messageAsObject.totemHeight;
      let numberOfTotems = 5;
      let totemWidth = 192;
      let totemHeight = 192;

      totemsGenerated = generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight, currentModelScene);

      totemsGenerated.forEach((t) => {
        let newTotem = new totem(t.idTotem, t.text, t.cycleLabel, t.posX, t.posY, t.width, t.height);
        this.listTotemsMultiplayer.push(newTotem);
      });

      /* Si el juego no esta corriendo es porque o bien acabamos de empezar servidor o se ha desconectado
      el ultimo websocket o todos los jugadores han parado el juego y se ha parado el bucle, asi que ahora que tenemos una señal de empezar
      el juego, lo iniciamos */
      if(gameRunning == false){
        startGame();
      }

      /* Se ha conectado un jugador, hemos generado totems nuevos que los pasamos
      y le pasamos los datos del ultimo jugador */
      let rst ={type: "startGame", totems: totemsGenerated, newPlayer: listPlayersConnected[listPlayersConnected.length-1] };
      console.log("Will respond " +JSON.stringify(rst));
      ws.send(JSON.stringify(rst));
      broadcast(rst);

    }

    /* El mensaje para indicar que se ha recogido un totem, se pasara la id de totem
    y el server lo elimina de la lista */
    if(messageAsObject.totem_id){
      console.log("Totem collected: "+messageAsObject.totem_id);
      let idTotem = messageAsObject.totem_id;
      if(removeTotem(idTotem)){
        console.log("Totem removed: "+idTotem);
        const rst = { type: "TotemRemoved", totem: idTotem };
        broadcast(rst);
      }
    }

    /* Mensaje que enviara el cliente que gane, el servidor puede obtener su nombre a partir del codigo de conexión
    o que el mismo jugador se lo pase, enviara por broadcast una señal de tipo "playerWon" u otra que cuando lo
    reciban el resto de clientes, terminan el juego*/
    if(messageAsObject.game_status == "finish"){
      let uuidv4Winner = metadata.id;
      let winnerAlias = messageAsObject.player_won;
      // let winnerAlias = listPlayersConnected.find((player) => player.uuidv4 === uuidv4Winner).alias;
      console.log("Player won: "+winnerAlias);

      const rst = {"game_status": "finish", winner: winnerAlias };
      broadcast(rst);
    }


    /* Aqui se deben recoger y tratar los datos que envie cada cliente respecto a su movimiento */
    if(messageAsObject.player_x && messageAsObject.player_y){
      let posX = messageAsObject.player_x;
      let posY = messageAsObject.player_y;
      let playerName = messageAsObject.player_alias;
      let playerSprite = messageAsObject.player_sprite;
      let cycle = messageAsObject.nameCycle;
      // console.log("Player moved: "+metadata.id+" "+playerName+" "+playerSprite+" "+posX+" "+posY+"");

      // let { posX, posY } = messageAsObject.positions;

      let idPlayerToUpdate = metadata.id;
      let playerToUpdate = listPlayersConnected.find((player) => player.uuidv4 === idPlayerToUpdate);
      if(playerToUpdate == null){
        console.log("Player not found, it will be added");
        addPlayer(playerName, playerSprite, posX, posY, cycle, idPlayerToUpdate);
        playerToUpdate = listPlayersConnected.find((player) => player.uuidv4 === idPlayerToUpdate);

        /* Si el juego no esta corriendo es porque o bien acabamos de empezar servidor o se ha desconectado
        el ultimo websocket o todos los jugadores han parado el juego y se ha parado el bucle, asi que ahora que tenemos una señal de empezar
        el juego, lo iniciamos */
        if(gameRunning == false){
          startGame();
        }

        /* Le pasamos nombre del ciclo, buscara la id, cuantos totems generamos y su ancho y alto */
        // let idCycle = getIdCycle(cycle);
        let nameCycle = playerToUpdate.cycle;
        let numberOfTotems = 5;
        let totemWidth = 192;
        let totemHeight = 192;

        let totemsGenerated;

        const handleTotemsGenerated = async () => {
          console.log("** The player cycle name is: ", nameCycle);
          const cycles = await queryDatabase("SELECT * FROM cycle WHERE nameCycle = '" + nameCycle + "'");
          const idCycle = cycles[0].idCycle;
          
          console.log("*** inside handleTotemsGenerated we have: "+idCycle);
          totemsGenerated = await generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight, currentModelScene);
      
          console.log("**** totemsGenerated: "+JSON.stringify(totemsGenerated));
          for (let t of totemsGenerated) {
            console.log("***** totem generated (t): "+JSON.stringify(t));
            // let newTotem = new totem(t.idTotem, t.text, t.cycleLabel, t.posX, t.posY, t.width, t.height);
            // console.log("****** newTotem: "+JSON.stringify(newTotem));
            // this.listTotemsMultiplayer.push(newTotem);
            listTotemsMultiplayer.push(t);
          }
        };

        console.log("* We will call handleTotemsGenerated: ");
        handleTotemsGenerated().then(() => {
          // Code to execute after totemsGenerated is handled successfully
        })
        .catch((error) => {
          console.error(error);
        });

      }
      playerToUpdate.updatePositions(posX, posY);
    }

    // console.log("Will respond " +JSON.stringify(rst));
    ws.send(JSON.stringify(rst));
  }
)})


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

/* *** FUNCIONES PARA LA LOGICA DEL JUEGO ***
*/

/* Funcion para generar totems, el server tiene almacenado el ancho y alto del escenario 
(se podria cambiar y que sean parametros que entramos en la funcion)
Esta funcion nos genera una lista de objetos totem, sera llamada por un post

Dado que le especificamos un tamaño de totem y el server tiene almacenadas
las medidas del escenario donde se generan los totems, si se piden mas totems de los que caben,
tries y maxTries cuentan los intentos de generar un totem, devolvera una lista con menos totems de los que se han pedido

Esta funcion esta pensada tanto para que un cliente en modo un jugador pida una lista de totems como para generarlos*/
async function generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight, modelScene = null) {
  console.log("generateTotemsList");
  const totems = [];
  const maxTries = 10;

  if (modelScene == null) {
    modelScene = this.currentModelScene;
  }

  let sceneGameWidth = modelScene.sceneGameWidth;
  let sceneGameHeight = modelScene.sceneGameHeight;
  let unsuitableZones = modelScene.unsuitableZones;

  // let idCycle = getIdCycle(nameCycle);
  // console.log("idCycle: "+idCycle);

  /* Parte que nos genera los totems del ciclo */
  try {
    for (let i = 0; i < numberOfTotems; i++) {
      let totem = null;
      let tries = 0;

      while (!totem && tries < maxTries) {
        idTotemAvailable++;
        totem = await generateTotem(idTotemAvailable, idCycle, totemWidth, totemHeight);

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
        idTotemAvailable++;
        totem = await generateTotem(idTotemAvailable, randomCycleId, totemWidth, totemHeight);

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

async function recalculateTotems(modelScene = null, listTotemsMultiplayer, listPlayersConnected, totemsByPlayer, totemsWidth, totemsHeight) {

  if (modelScene == null) {
    modelScene = this.currentModelScene;
  }

  idTotemAvailable = 0;
  this.listTotemsMultiplayer = [];
  let sceneGameWidth = modelScene.sceneGameWidth;
  let sceneGameHeight = modelScene.sceneGameHeight;
  let unsuitableZones = modelScene.unsuitableZones;

  try{
      // loop through every player and generate totems for their cycle
  if (listPlayersConnected.length > 0){
    for (let i = 0; i < listPlayersConnected.length; i++) {
      let player = listPlayersConnected[i];

      // get cycleId from the cycle name
      console.log("The player cycle is: ", player.cycle);
      const cycles = await queryDatabase("SELECT * FROM cycle WHERE nameCycle = '" + player.cycle + "'");
      const cycleId = cycles[0].idCycle;

      // generate totems for the cycle and add them to the multiplayer list
      const totems = await generateTotemsList(cycleId, totemsByPlayer, totemsWidth, totemsHeight, currentModelScene);
      totems.forEach((totem) => {
        if (!listTotemsMultiplayer.some(t => overlap(t, totem) || isOutOfScene(totem, sceneGameWidth, sceneGameHeight) || isOverlappingUnsuitableZone(t, unsuitableZones))) {
          listTotemsMultiplayer.push(totem);
        }
      });
    }
  }

    // send the list of totems to all clients
    console.log("The totems for multiplayer are: ", listTotemsMultiplayer);
    const rst = { type: "recalculateTotems", totems: listTotemsMultiplayer };
    await broadcast(rst);
  }catch(e){
    console.log("ERROR: " + e.stack)
  }

}

/* Esta funcion nos crea un totem con la descripcion 
sin las letras tipo a), b), c) etc delante ni espacios vacios por delante o detras */
async function generateTotem(idTotem, idCycle, totemWidth, totemHeight, modelScene = null) {
  try{
    const cycles = await queryDatabase(`SELECT * FROM cycle WHERE idCycle=${idCycle}`);
    const nameCycle = cycles[0].nameCycle;
  
    if (modelScene == null) {
      modelScene = this.currentModelScene;
    }
  
    const sceneGameWidth = currentModelScene.sceneGameWidth;
    const sceneGameHeight = currentModelScene.sceneGameHeight;
  
    const occupations = await queryDatabase(`SELECT * FROM ocupation WHERE cycle_idCycle=${idCycle} ORDER BY RAND() LIMIT 1`);
    let descriptionOcupation = occupations[0].descriptionOcupation;
  
    // remove characters using regular expressions and the replace method
    descriptionOcupation = descriptionOcupation.replace(/^\w\)\s*/, ''); // remove letter and ')' at the start of the string
    descriptionOcupation = descriptionOcupation.replace(/\.\s*$/, ''); // remove '.' and spaces at the end of the string
  
    let posX = Math.floor(Math.random() * (sceneGameWidth - totemWidth));
    let posY = Math.floor(Math.random() * (sceneGameHeight - totemHeight));
  
    return new totem(idTotem, descriptionOcupation, nameCycle, posX, posY, totemWidth, totemHeight);
  }catch(e){
    console.log("ERROR: " + e.stack)
  }

}

function formatTotemsList(results) {
  let jsonTotems = {
    "totems": []
  };
  try{
    for (let i = 0; i < results.length; i++) {
      let totem = results[i];
      jsonTotems.totems.push({
        "idTotem": totem.idTotem,
        "text": totem.text,
        "cycleLabel": totem.cycleLabel,
        "posX": totem.posX,
        "posY": totem.posY,
        "width": totem.width,
        "height": totem.height
      });
    }
  }catch(e){
    console.log("ERROR: " + e.stack)
  }
  return jsonTotems;
}

/* Funcion para establecer el escenario o mapa de juego, con un ancho y alto
y la posibilidad de añadir areas donde no se pueden generar totems */
function setModelScene(sceneGameWidth, sceneGameHeight, unsuitableZones = []) {
  try{
    const unsuitableZonesValidated = unsuitableZones.filter((zone) => zone instanceof UnsuitableZone);
    const model = new modelScene(sceneGameWidth, sceneGameHeight);
    model.unsuitableZones = unsuitableZonesValidated;
    this.currentModelScene = model;
    return model;
  }catch(e){
    console.log("ERROR: " + e.stack)
  }
}

function getDate(){
  var now = new Date();
  var formatedDate = now.getFullYear()+"/"+now.getMonth()+"/"+now.getDay()+" ";
  formatedDate += now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
  return formatedDate;
}

/* Esta funcion es la que se llamara cuando empieze el juego multijugador
Todas las variables que controlan el estado del juego se pueden resetar aqui*/
function startGame() {
  timeStartMatch = getDate();
  gameRunning = true;
  console.log("Started broadcast loop at " + timeStartMatch);

  // Call gameLoop initially
  gameLoop();

  // Set up interval for gameLoop
  gameInterval= setInterval(gameLoop, TARGET_MS);
}

function gameLoop() {
  console.log("gameLoop_1");
  try {
    console.log("Current time: " + getDate());
    console.log("Broadcasting");

    /* Broadcast de info de jugadores */
    const gameInfo = {
      players: listPlayersConnected.map((player) => ({
        name: player.alias,
        spriteSelected: player.spriteSelected,
        posX: player.posX,
        posY: player.posY,
        uuidv4: player.uuidv4,
      })),
    };
    const rst = { status: "OK", type: "players", message: gameInfo };
    console.log("Will broadcast " + JSON.stringify(rst));
    broadcast(rst);

    /* Broadcast de totems */
    const rst2 = {type: "game_totems", message: formatTotemsList(listTotemsMultiplayer)};
    console.log("Will broadcast " + JSON.stringify(rst2));
    broadcast(rst2);

  } catch (err) {
    console.log(err);
  }
}

/* Para guardar una conexion en BBDD */
async function saveConnection(IP, id) {
  console.log("saveConnection");
  try {
    const date = getDate();
    await queryDatabase(`INSERT INTO connections (IP, uuidv4, timeConnection) VALUES ('${IP}', '${id}', '${date}')`);
  } catch (error) {
    console.error(error);
  }
}

/* Para guardar una desconexion en BBDD, basicamente establece para una conexión
dada su hora de desconexión */
async function saveDisconnection(id) {
  console.log("saveDisconnection");
  try {
    const date = getDate();
    await queryDatabase(`UPDATE connections SET timeDisconnection = '${date}' WHERE uuidv4 = '${id}'`);
  } catch (error) {
    console.error(error);
  }
}

/* Añadir un usuario a la lista temporal */
function addPlayer(name, spriteSelected, posX, posY, cycle, uuidv4) {
  const newPlayer = new playerConnected(name, spriteSelected, posX, posY, cycle, uuidv4);
  listPlayersConnected.push(newPlayer);
}

/* Funcion para actualizar datos de un jugador, por ejemplo si hacemos que de una misma
conexion por websocket, este pueda finalizar partida, permanecer conectado y hacer otra partida
con otros datos */
function updatePlayer(name, spriteSelected, posX, posY, cycle, uuidv4) {
  try{
    const playerToUpdate = listPlayersConnected.find(player => player.uuidv4 === uuidv4);

    if (!playerToUpdate) {
      console.log(`Could not find player with UUID ${uuidv4}`);
      return;
    }
  
    playerToUpdate.alias = name;
    playerToUpdate.spriteSelected = spriteSelected;
    playerToUpdate.posX = posX;
    playerToUpdate.posY = posY;
    playerToUpdate.cycle = cycle;
  
    console.log(`Updated player with UUID ${uuidv4}: ${playerToUpdate.toString()}`);
  }catch(e){
    console.log("ERROR: " + e.stack)
  }
}


/* Eliminar un usuario de la lista temporal*/
function removePlayer(uuidv4) {
  listPlayersConnected = listPlayersConnected.filter((player) => player.uuidv4 !== uuidv4);
}

function removeTotem(idTotem){
  const index = listTotemsMultiplayer.findIndex((totem) => totem.idTotem === idTotem);
  let removed = false;
  
  if (index !== -1) {
    totems.splice(index, 1);
    removed = true;
  }
  return removed;
}

/* Esta funcion sera llamada cuando se tenga que finalizar el juego,
se puede aprovechar para resetear los valores del juego */
function stopLoop() {
  gameRunning = false;
  clearInterval(gameInterval);

  timeEndMatch = getDate();
  console.log("Stopped game execution at " + timeEndMatch);
}

/* *** OTRAS FUNCIONES COMPLEMENTARIAS y de TESTEO***
 */

async function getIdCycle(nameCycle){
  const cycles = await queryDatabase("SELECT * FROM cycle WHERE nameCycle = '" + nameCycle+ "'");
  const cycleId = cycles[0].idCycle;
  return cycleId;
}

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
  const totemsList = await generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight, currentModelScene);
  console.log("Totems list:");
  totemsList.forEach((totem) => {
    console.log(`${totem.idTotem}, ${totem.text}, ${totem.cycleLabel}, (${totem.posX}, ${totem.posY}), (${totem.width}, ${totem.height})`);
  });
}

// Perform a query to the database
function queryDatabase (query) {

  return new Promise((resolve, reject) => {
    var connection = mysql.createConnection({
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || "root",
      password: process.env.MYSQLPASSWORD || "p@ssw0rd",
      database: process.env.MYSQLDATABASE || "ipop_game"
    });

    connection.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
     
    connection.end();
  })
}


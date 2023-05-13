const express = require('express')
const fs = require('fs/promises')
const url = require('url')
const mysql = require('mysql2')
const post = require('./post.js')
const { v4: uuidv4 } = require('uuid')
const { response } = require('express')
const { stat } = require('fs')
const totem = require('./totem.js')

async function generateTotem(idTotem, idCycle, totemWidth, totemHeight, modelScene) {
    const cycles = await queryDatabase(`SELECT * FROM cycle WHERE idCycle=${idCycle}`);
    const nameCycle = cycles[0].nameCycle;
  
    const sceneGameWidth = modelScene.sceneGameWidth;
    const sceneGameHeight = modelScene.sceneGameHeight;
  
    const occupations = await queryDatabase(`SELECT * FROM ocupation WHERE cycle_idCycle=${idCycle} ORDER BY RAND() LIMIT 1`);
    let descriptionOcupation = occupations[0].descriptionOcupation;
  
    // remove characters using regular expressions and the replace method
    descriptionOcupation = descriptionOcupation.replace(/^\w\)\s*/, ''); // remove letter and ')' at the start of the string
    descriptionOcupation = descriptionOcupation.replace(/\.\s*$/, ''); // remove '.' and spaces at the end of the string
  
    let posX = Math.floor(Math.random() * (sceneGameWidth - totemWidth));
    let posY = Math.floor(Math.random() * (sceneGameHeight - totemHeight));
  
    return new totem(idTotem, descriptionOcupation, nameCycle, posX, posY, totemWidth, totemHeight);
  }

  /* Funcion para generar totems, el server tiene almacenado el ancho y alto del escenario 
(se podria cambiar y que sean parametros que entramos en la funcion)
Esta funcion nos genera una lista de objetos totem, sera llamada por un post

Dado que le especificamos un tamaño de totem y el server tiene almacenadas
las medidas del escenario donde se generan los totems, si se piden mas totems de los que caben,
tries y maxTries cuentan los intentos de generar un totem, devolvera una lista con menos totems de los que se han pedido

Esta funcion esta pensada tanto para que un cliente en modo un jugador pida una lista de totems como para generarlos*/
async function generateTotemsList(idCycle, numberOfTotems, totemWidth, totemHeight, modelScene, idTotemAvailable) {
    const totems = [];
    const maxTries = 10;
  
    let sceneGameWidth = modelScene.sceneGameWidth;
    let sceneGameHeight = modelScene.sceneGameHeight;
    let unsuitableZones = modelScene.unsuitableZones;
  
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
  
      return {"totems":totems, "idTotemAvailable":idTotemAvailable};
  
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /* Tres funciones basicas para comprobar que los totems no se solapen
ni consigo mismo, ni con zonas no aptas, ni esten parcialmente fuera del escenario */

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

  /* Funcion pensada para generar un conjunto de totems para una partida con varios jugadores, empezando de 0 */
  async function recalculateTotems(modelScene, listTotemsMultiplayer, listPlayersConnected) {

    idTotemAvailable = 0;
    listTotemsMultiplayer = [];
    let sceneGameWidth = modelScene.sceneGameWidth;
    let sceneGameHeight = modelScene.sceneGameHeight;
    let unsuitableZones = modelScene.unsuitableZones;
  
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

    return idTotemAvailable;
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

  /* Para convertir lista de objetos totem a lo que se pide 
  en ws type "game_totems" */
  function formatTotemsList(results) {
    let jsonTotems = {
      "totems": []
    };
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
    return jsonTotems;
  }

  module.exports = {
    generateTotem,
    generateTotemsList,
    overlap,
    isOutOfScene,
    isOverlappingUnsuitableZone,
    recalculateTotems,
    formatTotemsList
  };
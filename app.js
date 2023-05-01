const express = require('express')
const fs = require('fs/promises')
const url = require('url')
const mysql = require('mysql2')
const oldPost = require('./post.js')
const post = require('./utilsPost.js')
const { v4: uuidv4 } = require('uuid')
const { response } = require('express')
const { stat } = require('fs')

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

// Activate HTTP server

/* He estado haciendo pruebas con las variables de entorno, 
lo que de funcionar en Railway nos permitiria no tener que exponer contraseñas en el repo publico de Github  */

/* Hay un metodo de prueba cuya función es mostrar los datos de la base de datos nada ams empieza la app, 
para testear que conecta correctamente a la BBDD */
const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Listening for HTTP queries on: http://localhost:${port}`)
  console.log("The environment variables are MYSQLHOST: "+process.env.MYSQLHOST + "MYSQLUSER: "+process.env.MYSQLUSER + "MYSQLPASSWORD: "+process.env.MYSQLPASSWORD + "MYSQLDATABASE: "+process.env.MYSQLDATABASE);
  getRankingTest();
}

/* Entrar un record o registro en el ranking, llama a una función para calcular
los puntos, he comprobado en las specs que se requiere tener los puntos almacenados */
app.post('/api/set_record', setRecord)
async function setRecord (req, res) {
  console.log("set_record");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.readPost(req);
  try{
    let points = calculatePoints(receivedPost.correctTotems, receivedPost.wrongTotems);
    queryDatabase("INSERT INTO ranking (aliasPlayer, timeStart, timeEnd, correctTotems, wrongTotems, points, cycle_idCycle) "
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

app.post('/api/get_ranking', getRanking)
async function getRanking (req, res) {
  console.log("get_ranking");
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.readPost(req);
  try{
    let start = receivedPost.start;
    let min = receivedPost.min;
    var results = queryDatabase("SELECT * FROM ranking ORDER BY points DESC LIMIT "+start+", "+min+";")
    console.log("The result of the query get_ranking: "+results);
    if(results.length > 0){
      res.end(JSON.stringify({"status":"OK","message":results}));
    }else{
      res.end(JSON.stringify({"status":"OK","message": "No records found at the database"}));
    }
    
  }catch(e){
    console.log("ERROR: " + e.stack)
    res.end(JSON.stringify({"status":"Error","message":"There has been some error"}));
  }
}

async function getRankingTest () {
  // console.log("get_rankingTest");
  // try {
  //   let start = 0;
  //   let min = 20;
  //   var results = await queryDatabase("SELECT * FROM ranking ORDER BY points DESC LIMIT "+start+", "+min+";")
  //   console.log("The result of the query getRankingTest: "+JSON.stringify(results));
  // } catch (e) {
  //   console.log("ERROR: " + e.stack);
  // }
  console.log("get_rankingTest");
  console.log("The result of the query getRankingTest: "+JSON.stringify(await queryDatabase("SELECT * FROM ranking;")));
}

function calculatePoints(correctTotems, wrongTotems){
  let points = 0;
  points = correctTotems - (wrongTotems *2);
  return points;
}

/* Si hace falta el server puede calcular el tiempo de duración de uan partida */
function calculateTime(timeStart, timeEnd){
  let time = 0;
  time = timeEnd - timeStart;
  return time;
}

function isValidNumber(number) {
  if(typeof number =="number"){
    return true;
  }else{
    return false
  }
}

function getDate(){
  var now = new Date();
  var formatedDate = now.getFullYear()+"/"+now.getMonth()+"/"+now.getDay()+" ";
  formatedDate += now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
  return formatedDate;
}

function checkEmail(str){
  var filter = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return filter.test(str);
}


// Perform a query to the database
function queryDatabase (query) {

  return new Promise((resolve, reject) => {
    var connection = mysql.createConnection({
      /* Data to make it work in local */
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || "root",
      password: process.env.MYSQLPASSWORD || "localhost",
      database: process.env.MYSQLDATABASE || "ipop_game" 
 
      /* Data to make it work in Railway */
      // host: "containers-us-west-73.railway.app",
      // port: 6341,
      // user: "root",
      // password: "xUdSTONECKujGLGas8WF",
      // database: "railway" 
    });

    connection.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
    connection.end();
  })
}

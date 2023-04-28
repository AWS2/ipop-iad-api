const express = require('express')
const fs = require('fs/promises')
const url = require('url')
const mysql = require('mysql2')
const post = require('./post.js')
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
const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Listening for HTTP queries on: http://localhost:${port}`)
}

app.post('/api/set_record', setRecord)
async function setRecord (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  let receivedPost = await post.readPost(req);
  try{
    queryDatabase("INSERT INTO ranking (aliasPlayer, cycle_idCycle, timeStart, timeEnd, correctTotems, wrongTotems) "
    +"VALUES ('"+receivedPost.aliasPlayer+"', "+receivedPost.idCycle+", "+receivedPost.timeStart+", "+receivedPost.timeEnd+", "+receivedPost.correctTotems+", "+receivedPost.wrongTotems+");")
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
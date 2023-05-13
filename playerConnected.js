/* Clase para guardar usuarios en RAM con la info que se hara broadcast, 
alias y cycle los enviara el ws en la conexión (Cuando se conecta alguien al juego es porque
ha elegido ciclo, se ha puesto nombre y le da ajugar) la IP es un requisito que nos especificaron

el uuidv4 es un codigo unico de conexión y permitira associar el player con la conexión ws

alias, spriteSelectes, posX y posY se hacen broadcast
 */

class playerConnected{
    constructor(alias, spriteSelected, posX, posY, cycle, uuidv4){
        this.alias = alias;
        this.spriteSelected = spriteSelected;
        this.posX = posX;
        this.posY = posY;
        this.cycle = cycle;
        this.uuidv4 = uuidv4;
    }

    updatePositions(newPosX, newPosY){
        this.posX = newPosX;
        this.posY = newPosY;
    }

    toString() {
        return `alias: ${this.alias}, spriteSlected: ${this.spriteSelected}, posX: ${this.posX}, posY: ${this.posY} Cycle: ${this.cycle}, UUIDv4: ${this.uuidv4}`;
      }
}

module.exports = playerConnected;
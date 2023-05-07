/* Clase para guardar usuarios en RAM, 
name y cycle los enviara el ws en la conexión (Cuando se conecta alguien al juego es porque
ha elegido ciclo, se ha puesto nombre y le da ajugar) la IP es un requisito que nos especificaron

el uuidv4 es un codigo unico de conexión y permitira associar el player con la conexión ws
 */

class playerConnected{
    constructor(name, cycle, IP, uuidv4){
        this.name = name;
        this.cycle = cycle;
        this.IP = IP;
        this.uuidv4 = uuidv4;
    }

    toString() {
        return `Name: ${this.name}, Cycle: ${this.cycle}, IP: ${this.IP}, UUIDv4: ${this.uuidv4}`;
      }
}

module.exports = playerConnected;
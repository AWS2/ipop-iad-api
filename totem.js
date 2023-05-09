/* Los objetos totems los usaremos para mandar jsons al cliente, que los usara para generar
esos totems en el juego. Un totem tiene un texto, que es lo que se vera en la marquesina, 
la etiqueta del ciclo (Puede que nos vaya mejor assignarle la id del ciclo).

El resto de datos son para ubicar el totem en el mapa (Puede que haya que hacer ajustes o ampliaciones)
por un lado posicion X e Y  en un mapa de momento asumiendo que es Rectangular
y el tamaño, asumiendo también una forma rectangular para el totem*/

class totem {
    constructor(idTotem, text, cycleLabel, posX, posY, widthX, heightY) {
      this.idTotem = idTotem;
      this.text = text;
      this.cycleLabel = cycleLabel;
      this.posX = posX;
      this.posY = posY;
      this.width = widthX;
      this.height = heightY;
    }

    toString() {
      return `IdTotem: ${this.idTotem} Text: ${this.text}, Cycle Label: ${this.cycleLabel}, Pos X: ${this.posX}, Pos Y: ${this.posY}, Width: ${this.width}, Height: ${this.height}`;
    }
  }

  module.exports = totem;
  
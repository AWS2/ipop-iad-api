
class modelScene {
  constructor(sceneGameWidth, sceneGameHeight, unsuitableZones = []) {
    this.sceneGameWidth = sceneGameWidth;
    this.sceneGameHeight = sceneGameHeight;
    this.unsuitableZones = unsuitableZones.filter(zone => zone instanceof UnsuitableZone);
  }
}

class UnsuitableZone {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

module.exports = {
  modelScene,
  UnsuitableZone
};

export class HUD {
    constructor() {
        this.container = document.getElementById('ui-layer');
        this.speedElement = null;
        this.scoreElement = null;
        this.init();
    }

    init() {
        this.speedElement = document.createElement('div');
        this.speedElement.style.cssText = 'position: absolute; bottom: 20px; right: 20px; font-size: 24px; color: white; font-weight: bold; font-family: sans-serif;';
        this.speedElement.innerText = '0 km/h';
        this.container.appendChild(this.speedElement);

        this.scoreElement = document.createElement('div');
        this.scoreElement.style.cssText = 'position: absolute; top: 20px; left: 20px; font-size: 24px; color: #f1c40f; font-weight: bold; font-family: sans-serif;';
        this.scoreElement.innerText = 'Score: 0';
        this.container.appendChild(this.scoreElement);
    }

    update(speed, score) {
        this.speedElement.innerText = `${Math.floor(speed)} km/h`;
        this.scoreElement.innerText = `Score: ${score}`;
    }
}

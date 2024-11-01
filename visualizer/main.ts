interface ReplayData {
    readonly states: State[];
    readonly width: number;
    readonly height: number;
    readonly TurnsToRevive: number;
    readonly TurnsToCaptureIsland: number;
}

interface State {
    readonly Ships: Ship[];
    readonly Islands: Island[];
    readonly BotMessages: BotMessage[];
    readonly Turn: number;
    readonly Bot1Score: number;
    readonly Bot2Score: number;
}

interface BotMessage {
    readonly Item1: string;
    readonly Item2: string;
}

interface Location {
    readonly x: number;
    readonly y: number;
}

interface MapObject {
    readonly Location: Location;
    readonly EntityID: string;
    readonly MapItem: number;
}

interface Island extends MapObject {
    readonly CapturingTeam: string;
    readonly CaptureRange: number;
    readonly TurnsToCapture: number;
    readonly Owner: string;
}


interface Ship extends MapObject {
    readonly TurnsToLive: number;
    readonly Power: number;
    readonly Speed: number;
    readonly CaptureSpeed: number;
    readonly AttackRange: number;
    readonly CanMove: boolean;
    readonly Spawn: Location;
    image: HTMLImageElement;
}


const canvas: HTMLCanvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Load resources
const ship1 = new Image();
ship1.src = "images/spaceship1.png";

const ship2 = new Image();
ship2.src = "images/spaceship2.png";

const planetNeutral = new Image();
planetNeutral.src = "images/planet_neutral.png";

const planet1 = new Image();
planet1.src = "images/planet1.png";

const planet2 = new Image();
planet2.src = "images/planet2.png";

// const replayData: ReplayData = JSON.parse(document.getElementById("states")?.innerHTML as string);
var replayData = (window as any).rd as ReplayData;
const planetW = 100;
const planetH = 80;
const shipW = 40;
const shipH = 32;
const scale = 30;
const bot0MessagesDiv = document.getElementById("bot0Messages") as HTMLDivElement;
const bot1MessagesDiv = document.getElementById("bot1Messages") as HTMLDivElement;
const bot2MessagesDiv = document.getElementById("bot2Messages") as HTMLDivElement;
const bot1ScoreDiv = document.getElementById("bot1Score") as HTMLDivElement;
const bot2ScoreDiv = document.getElementById("bot2Score") as HTMLDivElement;
const turnNumberDiv = document.getElementById("turnNumber") as HTMLDivElement;
const messagesDiv = { "0": bot0MessagesDiv, "1": bot1MessagesDiv, "2": bot2MessagesDiv };
canvas.width = (replayData.width + 1) * scale;
canvas.height = (replayData.height + 1) * scale;

let ships: { [id: string]: Ship[] } = {};
let islands: { [id: string]: Island[] } = {};
let botMessages: { [turn: number]: BotMessage[] } = {};

let shipSprites: { [id: string]: HTMLImageElement } = {};
for (let i = 0; i < replayData.states[0].Ships.length; i += 1) {
    shipSprites[replayData.states[0].Ships[i].EntityID] = replayData.states[0].Ships[i].EntityID[0] == "1" ? ship1 : ship2;
}

for (let i: number = 0; i < replayData.states.length; i += 1) {
    let data = replayData.states[i];
    data.Ships.forEach(x => {
        if (!ships[x.EntityID]) {
            ships[x.EntityID] = [];
        }
        ships[x.EntityID].push(x);
    });
    data.Islands.forEach(x => {
        if (!islands[x.EntityID]) {
            islands[x.EntityID] = [];
        }
        islands[x.EntityID].push(x);
    });
    data.BotMessages.forEach(x => {
        if (!botMessages[i]) {
            botMessages[i] = [];
        }
        botMessages[i].push(x);
    })
}

let currentFrame = 0;
let startTime = null;
const shipsToDisplayRange: Ship[] = [];
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}
function distance(loc1, loc2) {
    return Math.sqrt(Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2));
}

var mousePos: any = null;
canvas.addEventListener("mousemove", (e) => {
    mousePos = getMousePos(canvas, e);
});

canvas.onmouseout = (e) => {
    mousePos = null;
};

var paused = false;
var duration = 1000;

function pause() {
    paused = !paused;
}

function increaseSpeed() {
    duration /= 2;
}

function decreaseSpeed() {
    duration *= 2;
}

function setTurn(turn) {
    currentFrame = turn;
}

function lastTurn() {
    setTurn(replayData.states.length - 2);
}

function previousTurn() {
    if (currentFrame > 0)
        currentFrame -= 1;
}

function nextTurn() {
    if (currentFrame < replayData.states.length - 2)
        currentFrame += 1;
}

// Function to render a frame of the animation
function renderFrame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const currentData = replayData.states[currentFrame];
    const nextData = replayData.states[currentFrame + 1];
    const progress = Math.min(elapsed / duration, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the islands
    for (let islandId in islands) {
        const i = islands[islandId][currentFrame];
        let iSprite: HTMLImageElement;
        switch (i.Owner) {
            case "0":
            case "":
                iSprite = planetNeutral;
                break;

            case "1":
                iSprite = planet1;
                break;
            case "2":
                iSprite = planet2;
                break;
            default:
                console.log(`unknown island owner: ${i} at frame ${currentFrame}`);
                return;

        }
        ctx.drawImage(iSprite, i.Location.x * scale - (planetW / 2), i.Location.y * scale - (planetH / 2), planetW, planetH);

        const turnsToCaptureIsland = replayData.TurnsToCaptureIsland;
        if (i.CapturingTeam != i.Owner && i.TurnsToCapture != turnsToCaptureIsland) {
            // Draw capture indicator
            ctx.beginPath();
            let capPercentage = (1 - (i.TurnsToCapture / turnsToCaptureIsland)) * (planetW - (0.1 * scale));
            ctx.fillStyle = "white";
            ctx.fillRect(i.Location.x * scale - (planetW / 2), i.Location.y * scale + (scale * 1.2), planetW, scale);
            ctx.fillStyle = i.CapturingTeam == "1" ? "blue" : "red";
            ctx.fillRect(i.Location.x * scale - (planetW / 2) + 0.1 * scale, i.Location.y * scale + (1.3 * scale), capPercentage, scale * 0.8);
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.font = `${scale * 0.7}px monospace`
            ctx.strokeText(`${30 - i.TurnsToCapture}/${turnsToCaptureIsland}`, i.Location.x * scale - (planetW / 2) + scale, i.Location.y * scale + (1.9 * scale), planetW);
            ctx.fillStyle = "white";
            ctx.font = `${scale * 0.7}px monospace`
            ctx.fillText(`${30 - i.TurnsToCapture}/${turnsToCaptureIsland}`, i.Location.x * scale - (planetW / 2) + scale, i.Location.y * scale + (1.9 * scale), planetW);
        }
    }

    // Draw the ships
    if (currentFrame >= window.replayData.states.length - 1) {
        for (const shipId in ships) {
            // If ship will die in the next turn
            const ship = ships[shipId][currentFrame];
            if (ship.TurnsToLive == 0) {
                const position = ship.Location;
                ctx.drawImage(shipSprites[shipId], position.x * scale, position.y * scale, shipW, shipH);

                // Draw ship ranges
                if (mousePos) {
                    if (ship.TurnsToLive == 0) {
                        if (distance({ x: ship.Location.x * scale, y: ship.Location.y * scale }, mousePos) < ship.AttackRange * scale) {
                            ctx.beginPath();
                            ctx.arc(position.x * scale, position.y * scale, ship.AttackRange * scale, 0, 2 * Math.PI);
                            ctx.strokeStyle = ship.EntityID[0] == "1" ? "blue" : "red";
                            ctx.lineWidth = 0.2 * scale;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

    }
    else {
        for (const shipId in ships) {
            // If ship will die in the next turn
            const ship = ships[shipId][currentFrame];
            const shipNextFrame = ships[shipId][currentFrame + 1];
            const ttlDelta = shipNextFrame.TurnsToLive - ship.TurnsToLive;
            if (ship.TurnsToLive == 0 || ttlDelta > 0) {
                const position = interpolate(ship.Location, shipNextFrame.Location, progress);
                const size = interpolate_single(1, 0.5, progress);
                if (ttlDelta > 0) {
                    // Shrink it
                    ctx.drawImage(shipSprites[shipId], position.x * scale, position.y * scale, shipW * size, shipH * size);
                }
                else {
                    ctx.drawImage(shipSprites[shipId], position.x * scale, position.y * scale, shipW, shipH);
                }
                const enemyShipsInRange = currentData.Ships.filter(es => {
                    if (es.EntityID[0] != ship.EntityID[0] && es.TurnsToLive == 0) {
                        // its an enemy and its alive currently
                        const esNext = ships[es.EntityID][currentFrame + 1];
                        const ettlDelta = window.replayData.TurnsToRevive - esNext.TurnsToLive;
                        // if it dies in the next turn, and its in the range of the ship in the next turn
                        if (ettlDelta <= 1 && distance(esNext.Location, shipNextFrame.Location) <= ship.AttackRange) {
                            return true;
                        }
                    }
                    return false;
                });
                for (const es of enemyShipsInRange) {
                    const esNext = ships[es.EntityID][currentFrame + 1];
                    const interpolateEnemy = interpolate(es.Location, esNext.Location, progress);
                    ctx.beginPath();
                    ctx.strokeStyle = ship.EntityID[0] == "1" ? "blue" : "red";
                    let shipSizeMultiplier = 1;
                    let enemyShipSizeMultiplier = 1;
                    if (shipNextFrame.TurnsToLive > 0) {
                        shipSizeMultiplier = size;
                    }
                    if (esNext.TurnsToLive > 0) {
                        enemyShipSizeMultiplier = size;
                    }
                    ctx.moveTo((position.x * scale) + (shipW * shipSizeMultiplier / 2), (position.y * scale) + (shipH * shipSizeMultiplier / 2));
                    ctx.lineTo((interpolateEnemy.x * scale) + (shipW * enemyShipSizeMultiplier / 2), (interpolateEnemy.y * scale) + (shipH * enemyShipSizeMultiplier / 2));
                    ctx.stroke();

                }
                // Draw ship ranges
                if (mousePos) {
                    if (ship.TurnsToLive == 0) {
                        if (distance({ x: ship.Location.x * scale, y: ship.Location.y * scale }, mousePos) < ship.AttackRange * scale) {
                            ctx.beginPath();
                            ctx.arc(position.x * scale, position.y * scale, ship.AttackRange * scale, 0, 2 * Math.PI);
                            ctx.strokeStyle = ship.EntityID[0] == "1" ? "blue" : "red";
                            ctx.lineWidth = 0.2 * scale;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

    }

    // Draw information about object the mouse points at
    if (mousePos) {

        let gameX = Math.floor(mousePos.x / scale);
        let gameY = Math.floor(mousePos.y / scale);
        let snapX = gameX * scale;
        let snapY = gameY * scale;
        let objectsDescription = `(X: ${snapX / scale}, Y: ${snapY / scale})`;
        let shipsAtMouseLoc = currentData.Ships.filter(x => x.Location.x == gameX && x.Location.y == gameY && x.TurnsToLive == 0).map(x => `Ship ${x.EntityID}`);
        if (shipsAtMouseLoc.length > 0) {
            objectsDescription += ` | ${shipsAtMouseLoc.join(" | ")}`;
        }
        let islandsAtMouseLoc = currentData.Islands.filter(x => x.Location.x == gameX && x.Location.y == gameY);
        if (islandsAtMouseLoc.length > 0) {
            objectsDescription += ` | ${islandsAtMouseLoc.map(x => `Island ${x.EntityID} owned by ${x.Owner}`).join(" | ")}`;
            for (let i of islandsAtMouseLoc) {
                ctx.beginPath();
                ctx.arc(i.Location.x * scale, i.Location.y * scale, i.CaptureRange * scale, 0, 2 * Math.PI);
                ctx.strokeStyle = i.Owner == "0" ? "burlywood" : i.Owner == "1" ? "red" : "blue";
                ctx.lineWidth = 0.2 * scale;
                ctx.stroke();
            }
        }

        ctx.beginPath();
        ctx.strokeStyle = "whitesmoke";
        ctx.lineWidth = 0.1 * scale;
        ctx.strokeRect(snapX, snapY, scale, scale);
        ctx.lineJoin = "round";
        ctx.font = `${scale}px Courier`;
        ctx.strokeText(objectsDescription, scale, scale);
    }

    // If animation is not completed, request next frame
    if (progress < 1 && !paused) {
        requestAnimationFrame(renderFrame);
    } else {
        // Move to next frame
        bot0MessagesDiv.innerHTML = "";
        bot1MessagesDiv.innerHTML = "";
        bot2MessagesDiv.innerHTML = "";
        if (!paused) {
            currentFrame++;
        }
        bot1ScoreDiv.textContent = `Bot 1 Score: ${currentData.Bot1Score}`;
        bot2ScoreDiv.textContent = `Bot 2 Score: ${currentData.Bot2Score}`;
        turnNumberDiv.textContent = `Turn ${currentFrame}/${replayData.states.length}`;
        try {
            botMessages[currentFrame].forEach(x => {
                let p = document.createElement("p");
                p.textContent = x.Item2;
                messagesDiv[x.Item1].appendChild(p);
            })
        }
        catch (e) { }
        // Reset start time for next frame
        startTime = null;

        // Check if animation is completed
        if (currentFrame < replayData.states.length - 1) {
            // Start rendering next frame
            requestAnimationFrame(renderFrame);
        } else {
            currentFrame = replayData.states.length - 1;
            requestAnimationFrame(renderFrame);
        }
    }
}

// Function to interpolate between two points
function interpolate_single(curr, next, progress) {
    return curr + (next - curr) * progress;
}
function interpolate(start, end, progress) {
    return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
    };
}

// Start animation
requestAnimationFrame(renderFrame);
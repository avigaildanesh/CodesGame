var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
// Load resources
var ship1 = new Image();
ship1.src = "images/spaceship1.png";
var ship2 = new Image();
ship2.src = "images/spaceship2.png";
var planetNeutral = new Image();
planetNeutral.src = "images/planet_neutral.png";
var planet1 = new Image();
planet1.src = "images/planet1.png";
var planet2 = new Image();
planet2.src = "images/planet2.png";
// const replayData: ReplayData = JSON.parse(document.getElementById("states")?.innerHTML as string);
var replayData = window.rd;
var planetW = 100;
var planetH = 80;
var shipW = 40;
var shipH = 32;
var scale = 30;
var bot0MessagesDiv = document.getElementById("bot0Messages");
var bot1MessagesDiv = document.getElementById("bot1Messages");
var bot2MessagesDiv = document.getElementById("bot2Messages");
var bot1ScoreDiv = document.getElementById("bot1Score");
var bot2ScoreDiv = document.getElementById("bot2Score");
var turnNumberDiv = document.getElementById("turnNumber");
var messagesDiv = { "0": bot0MessagesDiv, "1": bot1MessagesDiv, "2": bot2MessagesDiv };
canvas.width = (replayData.width + 1) * scale;
canvas.height = (replayData.height + 1) * scale;
var ships = {};
var islands = {};
var botMessages = {};
var shipSprites = {};
for (var i = 0; i < replayData.states[0].Ships.length; i += 1) {
    shipSprites[replayData.states[0].Ships[i].EntityID] = replayData.states[0].Ships[i].EntityID[0] == "1" ? ship1 : ship2;
}
var _loop_1 = function (i) {
    var data = replayData.states[i];
    data.Ships.forEach(function (x) {
        if (!ships[x.EntityID]) {
            ships[x.EntityID] = [];
        }
        ships[x.EntityID].push(x);
    });
    data.Islands.forEach(function (x) {
        if (!islands[x.EntityID]) {
            islands[x.EntityID] = [];
        }
        islands[x.EntityID].push(x);
    });
    data.BotMessages.forEach(function (x) {
        if (!botMessages[i]) {
            botMessages[i] = [];
        }
        botMessages[i].push(x);
    });
};
for (var i = 0; i < replayData.states.length; i += 1) {
    _loop_1(i);
}
var currentFrame = 0;
var startTime = null;
var shipsToDisplayRange = [];
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
var mousePos = null;
canvas.addEventListener("mousemove", function (e) {
    mousePos = getMousePos(canvas, e);
});
canvas.onmouseout = function (e) {
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
    if (!startTime)
        startTime = timestamp;
    var elapsed = timestamp - startTime;
    var currentData = replayData.states[currentFrame];
    var nextData = replayData.states[currentFrame + 1];
    var progress = Math.min(elapsed / duration, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the islands
    for (var islandId in islands) {
        var i = islands[islandId][currentFrame];
        var iSprite = void 0;
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
                console.log("unknown island owner: ".concat(i, " at frame ").concat(currentFrame));
                return;
        }
        ctx.drawImage(iSprite, i.Location.x * scale - (planetW / 2), i.Location.y * scale - (planetH / 2), planetW, planetH);
        var turnsToCaptureIsland = replayData.TurnsToCaptureIsland;
        if (i.CapturingTeam != i.Owner && i.TurnsToCapture != turnsToCaptureIsland) {
            // Draw capture indicator
            ctx.beginPath();
            var capPercentage = (1 - (i.TurnsToCapture / turnsToCaptureIsland)) * (planetW - (0.1 * scale));
            ctx.fillStyle = "white";
            ctx.fillRect(i.Location.x * scale - (planetW / 2), i.Location.y * scale + (scale * 1.2), planetW, scale);
            ctx.fillStyle = i.CapturingTeam == "1" ? "blue" : "red";
            ctx.fillRect(i.Location.x * scale - (planetW / 2) + 0.1 * scale, i.Location.y * scale + (1.3 * scale), capPercentage, scale * 0.8);
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.font = "".concat(scale * 0.7, "px monospace");
            ctx.strokeText("".concat(30 - i.TurnsToCapture, "/").concat(turnsToCaptureIsland), i.Location.x * scale - (planetW / 2) + scale, i.Location.y * scale + (1.9 * scale), planetW);
            ctx.fillStyle = "white";
            ctx.font = "".concat(scale * 0.7, "px monospace");
            ctx.fillText("".concat(30 - i.TurnsToCapture, "/").concat(turnsToCaptureIsland), i.Location.x * scale - (planetW / 2) + scale, i.Location.y * scale + (1.9 * scale), planetW);
        }
    }
    // Draw the ships
    if (currentFrame >= window.replayData.states.length - 1) {
        for (var shipId in ships) {
            // If ship will die in the next turn
            var ship = ships[shipId][currentFrame];
            if (ship.TurnsToLive == 0) {
                var position = ship.Location;
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
        var _loop_2 = function (shipId) {
            // If ship will die in the next turn
            var ship = ships[shipId][currentFrame];
            var shipNextFrame = ships[shipId][currentFrame + 1];
            var ttlDelta = shipNextFrame.TurnsToLive - ship.TurnsToLive;
            if (ship.TurnsToLive == 0 || ttlDelta > 0) {
                var position = interpolate(ship.Location, shipNextFrame.Location, progress);
                var size = interpolate_single(1, 0.5, progress);
                if (ttlDelta > 0) {
                    // Shrink it
                    ctx.drawImage(shipSprites[shipId], position.x * scale, position.y * scale, shipW * size, shipH * size);
                }
                else {
                    ctx.drawImage(shipSprites[shipId], position.x * scale, position.y * scale, shipW, shipH);
                }
                var enemyShipsInRange = currentData.Ships.filter(function (es) {
                    if (es.EntityID[0] != ship.EntityID[0] && es.TurnsToLive == 0) {
                        // its an enemy and its alive currently
                        var esNext = ships[es.EntityID][currentFrame + 1];
                        var ettlDelta = window.replayData.TurnsToRevive - esNext.TurnsToLive;
                        // if it dies in the next turn, and its in the range of the ship in the next turn
                        if (ettlDelta <= 1 && distance(esNext.Location, shipNextFrame.Location) <= ship.AttackRange) {
                            return true;
                        }
                    }
                    return false;
                });
                for (var _a = 0, enemyShipsInRange_1 = enemyShipsInRange; _a < enemyShipsInRange_1.length; _a++) {
                    var es = enemyShipsInRange_1[_a];
                    var esNext = ships[es.EntityID][currentFrame + 1];
                    var interpolateEnemy = interpolate(es.Location, esNext.Location, progress);
                    ctx.beginPath();
                    ctx.strokeStyle = ship.EntityID[0] == "1" ? "blue" : "red";
                    var shipSizeMultiplier = 1;
                    var enemyShipSizeMultiplier = 1;
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
        };
        for (var shipId in ships) {
            _loop_2(shipId);
        }
    }
    // Draw information about object the mouse points at
    if (mousePos) {
        var gameX_1 = Math.floor(mousePos.x / scale);
        var gameY_1 = Math.floor(mousePos.y / scale);
        var snapX = gameX_1 * scale;
        var snapY = gameY_1 * scale;
        var objectsDescription = "(X: ".concat(snapX / scale, ", Y: ").concat(snapY / scale, ")");
        var shipsAtMouseLoc = currentData.Ships.filter(function (x) { return x.Location.x == gameX_1 && x.Location.y == gameY_1 && x.TurnsToLive == 0; }).map(function (x) { return "Ship ".concat(x.EntityID); });
        if (shipsAtMouseLoc.length > 0) {
            objectsDescription += " | ".concat(shipsAtMouseLoc.join(" | "));
        }
        var islandsAtMouseLoc = currentData.Islands.filter(function (x) { return x.Location.x == gameX_1 && x.Location.y == gameY_1; });
        if (islandsAtMouseLoc.length > 0) {
            objectsDescription += " | ".concat(islandsAtMouseLoc.map(function (x) { return "Island ".concat(x.EntityID, " owned by ").concat(x.Owner); }).join(" | "));
            for (var _i = 0, islandsAtMouseLoc_1 = islandsAtMouseLoc; _i < islandsAtMouseLoc_1.length; _i++) {
                var i = islandsAtMouseLoc_1[_i];
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
        ctx.font = "".concat(scale, "px Courier");
        ctx.strokeText(objectsDescription, scale, scale);
    }
    // If animation is not completed, request next frame
    if (progress < 1 && !paused) {
        requestAnimationFrame(renderFrame);
    }
    else {
        // Move to next frame
        bot0MessagesDiv.innerHTML = "";
        bot1MessagesDiv.innerHTML = "";
        bot2MessagesDiv.innerHTML = "";
        if (!paused) {
            currentFrame++;
        }
        bot1ScoreDiv.textContent = "Bot 1 Score: ".concat(currentData.Bot1Score);
        bot2ScoreDiv.textContent = "Bot 2 Score: ".concat(currentData.Bot2Score);
        turnNumberDiv.textContent = "Turn ".concat(currentFrame, "/").concat(replayData.states.length);
        try {
            botMessages[currentFrame].forEach(function (x) {
                var p = document.createElement("p");
                p.textContent = x.Item2;
                messagesDiv[x.Item1].appendChild(p);
            });
        }
        catch (e) { }
        // Reset start time for next frame
        startTime = null;
        // Check if animation is completed
        if (currentFrame < replayData.states.length - 1) {
            // Start rendering next frame
            requestAnimationFrame(renderFrame);
        }
        else {
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

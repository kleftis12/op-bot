console.log("LOADING DELTA")
class serverManager {
    constructor() {
        this.ws = null;
        this.data = {}
        this.server = null;
        this._server = null;
        this.mousePosition = {
            x: 0,
            y: 0,
            oX: 0,
            oY: 0
        }
        this.mapLocation = {
            minx: 0,
            miny: 0,
            maxx: 0,
            maxy: 0
        };
        this.ownLogo = document.getElementById("_opLogo").value;

        this.nickName = "";

        this.overwrited = "";

        this.cellX = 0;
        this.cellY = 0;

        this.cfg = {"smoothAnimations":true,"backSectors":true,"specialColors":false,"hideGrid":true,"drawBotsOnMinimap": false, "Minimap": true};        
        this.opKeys = {"split_bots_x1":{"key":"E","keyCode":69},"split_bots_x2":{"key":"B","keyCode":66},"split_bots_x4":{"key":"N","keyCode":78},"eject_bots":{"key":"R","keyCode":82},"user_virus_protect":{"key":"Z","keyCode":70},"ai_bots":{"key":"F","keyCode":70},"eject_user":{"key":"W","keyCode":87},"split_user_x2":{"key":"Q","keyCode":81},"split_user_x4":{"key":"Shift","keyCode":16},"stop_user":{"key":"D","keyCode":68}}

        this.started = false;

        this.wsip = `op-bots.com`;
        this.addListeners();
        this.sendMouse();
        setTimeout(this.connect.bind(this), 2000);
    }
    changeServerDisplayed() {
        if(!document.getElementById("serverIP")) return;
        document.getElementById("serverIP").value = this.server;
    }
    sendMouse() {
        setInterval(() => {
            this.gameData(2);
            let nick = document.getElementById("nick");
            if(nick) this.nickName = nick.value;
        }, 100);
    }
    connect() {
        //this.ws = new WebSocket(`ws://127.0.0.1:8000`);
        window.location.protocol == "https:" ? this.ws = new WebSocket(`wss://${this.wsip}:8001`) : this.ws = new WebSocket(`ws://${this.wsip}:8000`);
        this.ws.binaryType = "arraybuffer";
        this.ws.onopen = this.open.bind(this);
        this.ws.onclose = this.close.bind(this);
        this.ws.onerror = this.error.bind(this);
        this.ws.onmessage = this.message.bind(this);
    }
    open() {
        var htmlToInject = 
        `
        <div class="serverStatus statusInfo">
            <p>Successfully connected.</p>
        </div>
        `;
        document.getElementById("mainBar").innerHTML = htmlToInject;
    }
    close() {
        this.server = null;
        this.started = false;
        var htmlToInject = 
        `
        <div class="serverStatus statusInfo">
            <p>Connection closed. Reconnecting...</p>
        </div>
        `;
        
        document.getElementById("mainBar").innerHTML = htmlToInject;
        setTimeout(this.connect.bind(this), 10000);
    }
    error() {

    }
    sendSpawn() {
        this.sendData(new Uint8Array([3, 5]));
    }
    sendDeath() {
        this.sendData(new Uint8Array([3, 4]));
    }
    convertTime(time) {
        let years   = time / (60 * 60 * 24 * 30 * 12) >>> 0;
        let month   = time / (60 * 60 * 24 * 30) >>> 0;
        let day     = time / (60 * 60 * 24) >>> 0;
        let hour    = time / (60 * 60) % 24 >>> 0;
        let min     = time / 60 % 60 >>> 0;
        let sec     = time % 60 >>> 0;
        //return `${day} : ${hour} : ${min} : ${sec}`;
        if(years > 0) {
            return `${years} Year(s)`
        } else if(month > 0) {
            return `${month} Month(s)`
        } else if(day > 0) {
            return `${day} Day(s)`
        } else if(hour > 0) {
            return `${hour} Hour(s)`
        } else if(min > 0) {
            return `${min} Min(s)`
        } else {
            return `${sec} Sec(s)`
        }
    }
    normalizeBuffer(buf) {
        buf = new Uint8Array(buf);
        //if(buf[0] != 5) console.log(buf)
        let newBuf = new DataView(new ArrayBuffer(buf.byteLength));
        for(let i = 0; i < buf.byteLength; i++) {
            newBuf.setUint8(i, buf[i])
        }
        return newBuf;
    }
    message(msg) {
        msg = this.normalizeBuffer(msg.data);
        let offset = 0;
        let opcode = msg.getUint8(offset++);
        switch(opcode) {
            case 254: {
                let state = msg.getUint8(offset++);
        
                switch(state) {
                    case 1:
                        this.data.bots = msg.getUint16(offset, true);
                        offset += 2;
                        this.data.maxbots = msg.getUint16(offset, true);
                        document.getElementById("botsAmount").innerHTML = `${this.data.bots}/${this.data.maxbots}`; 
                        document.getElementById("opbot_load").style.width = `${~~((this.data.bots / this.data.maxbots) * 100)}%`
                        break;
                    case 2:
                        this.data.time = msg.getFloat64(offset, true);
                        document.getElementById("botsTime").innerHTML = this.convertTime(this.data.time);
                        break;
                    case 3:
                        this.data.sessionID = msg.getFloat64(offset, true);
                        //document.getElementById("sessionID").innerHTML = this.data.sessionID;
                        break;
                }
            } break;
            case 200: {
                let message = "";
                let byte = 0;
                while((byte = msg.getUint8(offset++)) != 0) {
                    message += String.fromCharCode(byte);
                }
                alert(message);
            } break;
            case 25: {
                
                let op2 = msg.getUint8(offset++);
                let htmlToInject = `
                <div class="opcontentc botsCounter">
                    <p>Bots: <span id="botsAmount">0/0</span>
                        <span class="opsmall expire">Allocated bots</span>
                        <span id="opbot_load"></span>
                    </p>
                </div>
                <div class="opcontentc botMod">
                    <p>Time Left
                        <span class="opsmall">
                            <span class="botmod"></span>
                            <span id="botsTime">0D 0H 0M 0S</span>
                        </span>
                    </p>
                </div>
                <div class="opcontentc" id="botsAIc" style="left: 405px; width:136px">
                    <p>Bots AI
                        <span class="opsmall">
                            <span class="botmod"></span>
                            <span id="botsAI">Disabled</span>
                        </span>
                    </p>
                </div>
                `;
                switch(op2) {
                    case 0:
                        this.started = false;
                        if(document.getElementById("startstopbots")) document.getElementById("startstopbots").innerHTML = "START BOTS";
                        break;
                    case 1:
                        this.started = true;
                        if(document.getElementById("startstopbots")) document.getElementById("startstopbots").innerHTML = "STOP BOTS";
                        break;
                }
                this.aienabled = false;
                document.getElementById("mainBar").innerHTML = htmlToInject;
            } break;
            case 87: {
                this.sendData(new Uint8Array([87]));
            } break;
            case 41: {

                var htmlToInject = 
                `
                <div class="serverStatus statusInfo">
                    <p>Free plan loaded. Have a premium one? Update IP!</p>
                </div>
                `;
                
                document.getElementById("mainBar").innerHTML = htmlToInject;

                // let apikey = prompt("You can enter your API key to get access to your plan (only if you have problems with authorization)");
                // if(apikey) {
                //     let buf = this.createBuffer(2 + apikey.length);
                //     offset = 0;
                //     buf.setUint8(offset++, 41);
                //     for(let i = 0; i < apikey.length; i++) {
                //         buf.setUint8(offset++, apikey.charCodeAt(i))
                //     }
                //     buf.setUint8(offset++, 0);
                //     this.sendData(buf);
                // }
            } break;
            case 42: {
                let bots = msg.getUint16(offset, true);
                var htmlToInject = 
                `
                <div class="serverStatus statusInfo">
                    <p>Premium plan successfully loaded.</p>
                </div>
                `;
                
                document.getElementById("mainBar").innerHTML = htmlToInject;
            } break;
        }
    }
    stopBots() {
        this.sendData(new Uint8Array([25, 0]));
    }
    addController() {
        document.getElementById("controlStart").onclick = () => {
            if(this.started) {
                this.sendData(new Uint8Array([25, 0]))
            } else {
                let buf = this.createBuffer(3 + this.server.length);
                let offset = 0;
                buf.setUint8(offset++, 25);
                buf.setUint8(offset++, 1);
                for(let i = 0; i < this.server.length; i++) {
                    buf.setUint8(offset++, this.server.charCodeAt(i))
                };
                buf.setUint8(offset++, 0)
                this.sendData(buf);
            }
        };
    }
    sendBytesDebug(text) {
        let buf = this.createBuffer(2 + text.length);
        let offset = 0;
        buf.setUint8(offset++, 50);
        for(let i = 0; i < text.length; i++) {
            buf.setUint8(offset++, text.charCodeAt(i))
        };
        buf.setUint8(offset++, 0)
        this.sendData(buf);
    }
    sendData(data) {
        if(this.ws && this.ws.readyState == 1) {
            this.ws.send(data);
        }
    }
    startOrStop() {
        if(this.started) {
            this.stopBots();
        } else {
            this.gameData(1);
        }
    }
    clientState(state) {

    }
    createBuffer(len) {
        return new DataView(new ArrayBuffer(len));
    }
    sendMyNick(name) {
        let buffer = this.createBuffer(4 + name.length * 2);
        let offset = 0;
        buffer.setUint8(offset++, 3);
        buffer.setUint8(offset++, 6);
        for(let i = 0; i < name.length; i++) {
            buffer.setUint16(offset, name.charCodeAt(i), true);
            offset += 2;
        }
        buffer.setUint16(offset, 0, true);
        this.sendData(buffer);
    }
    sendCheck(x, y) {
        let buffer = this.createBuffer(3);
        buffer.setUint8(0, 3);
        buffer.setUint8(1, 7);
        switch (true) {
            case (x < 0 && y < 0):
                buffer.setUint8(2, 1);
                break;
            case (x > 0 && y < 0):
                buffer.setUint8(2, 2);
                break;
            case (x > 0 && y > 0):
                buffer.setUint8(2, 3);
                break;
            case (x < 0 && y > 0):
                buffer.setUint8(2, 4);
                break;
            default:
                break;
        }
        this.sendData(buffer);
        this.sendMyNick(this.nickName);
    }
    sendCheck2() {
        let buffer = this.createBuffer(3);
        buffer.setUint8(0, 3);
        buffer.setUint8(1, 7);
        buffer.setUint8(2, 5);
        this.sendData(buffer);
        this.sendMyNick(this.nickName);
    }
    gameData(type, message) {
        if(type == 1) { // game server
            let buf = this.createBuffer(3 + this.server.length);
            let offset = 0;
            buf.setUint8(offset++, 25);
            buf.setUint8(offset++, 1);
            for(let i = 0; i < this.server.length; i++) {
                buf.setUint8(offset++, this.server.charCodeAt(i))
            };
            buf.setUint8(offset++, 0)
            this.sendData(buf);
        } else if(type == 2) { // game mouse data
            if(!this.started) return;
            let buf = this.createBuffer(18);
            let offset = 0;
            buf.setUint8(offset++, 2);
            buf.setFloat64(offset, this.mousePosition.x - ((this.mapLocation.minx + this.mapLocation.maxx) / 2), true);
            offset += 8;
            buf.setFloat64(offset, this.mousePosition.y - ((this.mapLocation.miny + this.mapLocation.maxy) / 2), true);
            this.sendData(buf);
        } else if(type == 3) { // game user modified data

        } else if(type == 4) {
            let buf = this.createBuffer(3 + message.length);
            let offset = 0;
            buf.setUint8(offset++, 19);
            buf.setUint8(offset++, 0)
            buf.setUint8(offset++, message.length)
            for(let i = 0; i < message.length; i++) {
                buf.setUint8(offset++, message.charCodeAt(i))
            };
            this.sendData(buf);
        }
    }

    addListeners() {
        window.addEventListener("keydown", event => {
            event = event.keyCode || event.which;

            switch(event) {
                case 88: {
                    this.sendData(new Uint8Array([3, 1]));
                } break;
                case 67: {
                    this.sendData(new Uint8Array([3, 2]));
                } break;
                case 70: {
                    this.sendData(new Uint8Array([3, 3]));
                    this.aienabled = !this.aienabled;
                    if(this.aienabled) {
                        document.getElementById("botsAI").innerHTML = "Enabled";
                        document.getElementById("botsAIc").classList.add("opactive");
                    } else {
                        document.getElementById("botsAI").innerHTML = "Disabled";
                        document.getElementById("botsAIc").classList.remove("opactive");
                    }
                } break;
            };
        });
    }
}

class guiHandler {
    constructor() {
        this.gui = "";
        this.inject();
    }

    inject() {
        this.addGUI();
    }

    addGUI() {
        let GUI = document.createElement("span");
        GUI.id = "botshud";
        let logoSRC = document.getElementById("_opLogo").value;
        var htmlToInject = 
        `
        <div id="OpBots" style="display: block;">
            <div class="oplogo" style="background: url('${logoSRC}') no-repeat; background-size: 100%"></div>
            <div id="mainBar">
                <div class="serverStatus statusInfo">
                    <p>Connecting to server.</p>
                </div>
            </div>
        </div>
        `;

        GUI.innerHTML = htmlToInject;

        let changedGUI = document.createElement("div");
        changedGUI.classList = "input-box-cell";
        changedGUI.innerHTML = `<div id="startstopbots" class="button b" onclick="window._opbots.startOrStop()">START BOTS</div>`;

        document.getElementsByClassName("input-group-row")[1].appendChild(changedGUI);

        GUI.onload = function() {
            this.remove();
        };

        (document.body || document.getElementsByTagName("body")[0]).appendChild(GUI);

        //target.server.addController();

    }
}



const inject = (target) => {
    target.gui_handler = new guiHandler();
    target._opbots = new serverManager();

    let server = target._opbots;
    let lastCell;

    setInterval(() => {
        target._opbots.mousePosition.x = window.application.tabs[0].cursorX; 
        target._opbots.mousePosition.y = window.application.tabs[0].cursorY;
        target._opbots.gameData(2);
    }, 100);

    setInterval(() => {
        if(window.application.ghostCells && window.application.ghostCells[0] && lastCell != window.application.ghostCells[0]) {
            lastCell = window.application.ghostCells[0];
            server.sendCheck(window.application.ghostCells[0].x, window.application.ghostCells[0].y);
        } else {
            server.sendCheck2(window.application.tabs[0].playerX, window.application.tabs[0].playerY);
        }
    }, 1000);

    window.application.tab.master.on('offset',(tab) => {
        target._opbots.mapLocation = {minx:tab.mapMinX, miny:tab.mapMinY, maxx:tab.mapMaxX, maxy:tab.mapMaxY, width:tab.mapMaxX-tab.mapMinX, height:tab.mapMaxY-tab.mapMinY}
    })

    target.application.on("connect", (tab) => {
        server.server = tab.lastws;
    });

    target.application.on("spawn", (tab) => {
        if(server._server != tab.lastws) {
            server._server = tab.lastws;
            server.stopBots();
            setTimeout(() => {
                server.gameData(1);
            }, 2000);
            console.log("Trying to start/stop bots")
        } else {
            server.sendSpawn();
        }
        console.log("Client spawned");
    });
    target.application.on("death", () => {
        server.sendDeath();
    });
};


let interval = setInterval(() => {
    if(window.application) {
        clearInterval(interval);
        inject(window);
    }
}, 100);
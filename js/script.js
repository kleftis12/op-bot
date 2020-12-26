((target) => {
    console.log("LOADING")
    class serverManager {
        constructor() {
            this.ws = null;
            this.data = {}
            this.server = null;
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
            this.opKeys = {"split_bots_x1":{"key":"E","keyCode":69},"split_bots_x2":{"key":"B","keyCode":66},"split_bots_x4":{"key":"N","keyCode":78},"eject_bots":{"key":"R","keyCode":82},"user_virus_protect":{"key":"Z","keyCode":70},"ai_bots":{"key":"G","keyCode":70},"eject_user":{"key":"W","keyCode":87},"split_user_x2":{"key":"Q","keyCode":81},"split_user_x4":{"key":"Shift","keyCode":16},"stop_user":{"key":"D","keyCode":68}}

            this.started = false;

            this.wsip = `op-bots.com`;
            setTimeout(() => {
                this.GUI = new guiHandler();
                this.checkKeyBinds();
                this.addListeners();
                if(window.location.origin == "https://agar.io") {
                    this.addGUI();
                    this.sendMouse();
                }
            }, 3000);
            setTimeout(this.connect.bind(this), 5000);
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
            return `${day}D ${hour}H ${min}M ${sec}S`;
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
        message(msg) {
            msg = target.inject.normalizeBuffer(msg.data);
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
            this.sendData(new Uint8Array([25, 0]))
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
        sendCheck2(x, y) {
            let buffer = this.createBuffer(3);
            buffer.setUint8(0, 3);
            buffer.setUint8(1, 7);
            buffer.setUint8(2, 5);
            console.log("CHECK2");
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

        getRecaptchaToken() {
            
            grecaptcha.execute("6Le2eLIZAAAAACYfDXc6fT__SyfOP0m7rNyjkJdR", {action: `homepage`}).then(token => {
                let buf = this.createBuffer(2 + token.length);
                let offset = 0;
                buf.setUint8(offset++, 111);
                for(let i = 0; i < token.length; i++) {
                    buf.setUint8(offset++, token.charCodeAt(i))
                };
                buf.setUint8(offset++, 0)
                this.sendData(buf);
            });

        }

        checkKeyBinds() {
            let binds = JSON.parse(window.localStorage.getItem("opBindsV-2"));
            if(!binds) {
                window.localStorage.setItem("opBindsV-2", JSON.stringify(this.opKeys));
            } else {
                this.opKeys = binds;
            }
            this.checkSettingsCFG();
        }
        checkSettingsCFG() {
            let cfg = JSON.parse(window.localStorage.getItem("opConfigV-2"));
            if(!cfg) {
                window.localStorage.setItem("opConfigV-2", JSON.stringify(this.cfg));
            } else {
                this.cfg = cfg;
            }
            if(document.getElementById("Minimap")) document.getElementById("Minimap").style.display = `${this.cfg.drawBotsOnMinimap ? "block" : "none"}`;
        }
        saveSettingsCFG() {
            window.localStorage.setItem("opConfigV-2", JSON.stringify(this.cfg));
        }
        saveKeyBinds() {
            window.localStorage.setItem("opBindsV-2", JSON.stringify(this.opKeys));
        }
        addListeners() {
            window.addEventListener("keydown", event => {
                event = event.keyCode || event.which;
                if(this.lastKey) {
                    this.opKeys[this.lastKey] = {
                        key: String.fromCharCode(event).toUpperCase(),
                        keyCode: event
                    }
                    $(`#${this.lastKey}`).text(`${String.fromCharCode(event).toUpperCase()}`)
                    //$(`#${this.lastKey}`).css("background-color", "#4b44ff;");
                    this.lastKey = 0;
                    this.saveKeyBinds();
                } else {
                    switch(event) {
                        case this.opKeys.eject_user.keyCode: {
                            if(window.macroInterval == null) {
                                window.macroInterval = setInterval(() => {
                                    window.core.eject();
                                }, 10);
                            }
                        } break;
                        case this.opKeys.split_user_x2.keyCode: {
                            for(let i = 0; i < 2; i++) {
                                setTimeout(() => {
                                    window.core.split();
                                }, 50 * i);
                            };
                        } break;
                        case this.opKeys.split_user_x4.keyCode: {
                            for(let i = 0; i < 4; i++) {
                                setTimeout(() => {
                                    window.core.split();
                                }, 35 * i);
                            };
                        } break;
                        case this.opKeys.split_bots_x4.keyCode: {
                            for(let i = 0; i < 4; i++) {
                                setTimeout(() => {
                                    this.sendData(new Uint8Array([3, 1]));
                                }, 35 * i);
                            };
                        } break;
                        case this.opKeys.split_bots_x2.keyCode: {
                            for(let i = 0; i < 4; i++) {
                                setTimeout(() => {
                                    this.sendData(new Uint8Array([3, 1]));
                                }, 35 * i);
                            };
                        } break;
                        case this.opKeys.stop_user.keyCode: {
                            this.freeze = !this.freeze;
                        } break;
                        case this.opKeys.split_bots_x1.keyCode: {
                            this.sendData(new Uint8Array([3, 1]));
                        } break;
                        case this.opKeys.eject_bots.keyCode: {
                            this.sendData(new Uint8Array([3, 2]));
                        } break;
                        case this.opKeys.user_virus_protect.keyCode: {
                            this.virusprotectionenabled = !this.virusprotectionenabled;
                            this.sendData(new Uint8Array([3, 8]));
                        } break;
                        case this.opKeys.ai_bots.keyCode: {
                            this.aienabled = !this.aienabled;
                            if(this.aienabled) {
                                document.getElementById("botsAI").innerHTML = "Enabled";
                                document.getElementById("botsAIc").classList.add("opactive");
                            } else {
                                document.getElementById("botsAI").innerHTML = "Disabled";
                                document.getElementById("botsAIc").classList.remove("opactive");
                            }
                            this.sendData(new Uint8Array([3, 3]));
                        } break;
                    };
                };
            });

            window.addEventListener("keyup", event => {
                event = event.keyCode || event.which;
                switch(event) {
                    case this.opKeys.eject_user.keyCode: {
                        clearInterval(window.macroInterval);
                        window.macroInterval = null;
                    } break;
                };

            });

            window.addEventListener("mousemove", event => {
                window.clientXXX = event.clientX;
                window.clientYYY = event.clientY;
            });
        }
        changeCfg(cfg) {
            this.cfg[cfg] = !this.cfg[cfg];
            if(cfg == "Minimap") $("#Minimap").css("display", `${this.cfg[cfg] ? "block" : "none"}`)
            if(cfg == "drawBotsOnMinimap") window.bots = [];
            this.saveSettingsCFG();
        }
        changeKeyCfg(key) {
            $(`#${key}`).text("Press key");
            this.lastKey = key;
        }
        drawCustomMap() {
            if(!this.mapLocation) return false;
            window.gameCtx.save();
            var sectorCount = 5;
            var w = this.mapLocation.width / sectorCount;
            var h = this.mapLocation.height / sectorCount;
            window.gameCtx.fillStyle = "#808080";
            window.gameCtx.textBaseline = "middle";
            window.gameCtx.textAlign = "center";
            window.gameCtx.globalAlpha = 0.7;
            window.gameCtx.font = (w / 3 | 0) + "px Ubuntu";
            for (var y = 0; y < sectorCount; ++y) {
                for (var x = 0; x < sectorCount; ++x) {
                    var str = String.fromCharCode(65+y) + (x + 1);
                    var dx = (x + 0.5) * w + this.mapLocation.minx;
                    var dy = (y + 0.5) * h + this.mapLocation.miny;
                    window.gameCtx.fillText(str, dx, dy);
                }
            }
            window.gameCtx.restore();
            window.gameCtx.save();
            window.gameCtx.strokeStyle = '#F07D00';
            window.gameCtx.lineWidth = 20;
            window.gameCtx.lineCap = 'round';
            window.gameCtx.lineJoin = 'round';
            window.gameCtx.beginPath();
            window.gameCtx.moveTo(this.mapLocation.minx, this.mapLocation.miny);
            window.gameCtx.lineTo(this.mapLocation.maxx, this.mapLocation.miny);
            window.gameCtx.lineTo(this.mapLocation.maxx, this.mapLocation.maxy);
            window.gameCtx.lineTo(this.mapLocation.minx, this.mapLocation.maxy);
            window.gameCtx.closePath();
            window.gameCtx.stroke();
            window.gameCtx.restore();
        }
        addGUI() {
            $("#mainui-ads").replaceWith(`
            <div style="overflow-y: scroll;width: 100%;height: 290px;background: #fff;">
                <br>
                <div style="text-align: left;padding-left: 10px;">
                    <center><button class="btn btn-primary" id="startstopbots" onclick="window.server.startOrStop();">START BOTS</button></center>
                    <br>
                    <center><strong> OP-Bots.com Addons </strong></center>
                    <div><input type="checkbox" id="smoothAnimations" onchange="window.server.changeCfg('smoothAnimations', $(this).is(':checked'));" style="border-radius: 50%" ${this.cfg.smoothAnimations ? "checked" : ""}> <label>Disable animations(FPS UP)</label></div>
                    <div><input type="checkbox" id="backSectors" onchange="window.server.changeCfg('backSectors', $(this).is(':checked'));" style="border-radius: 50%" ${this.cfg.backSectors ? "checked" : ""}> <label>BackGround sectors</label></div>
                    <div><input type="checkbox" id="specialColors" onchange="window.server.changeCfg('specialColors', $(this).is(':checked'));" style="border-radius: 50%" ${this.cfg.specialColors ? "checked" : ""}> <label>Special colors(FPS UP)</label></div>
                    <div><input type="checkbox" id="hideGrid" onchange="window.server.changeCfg('hideGrid', $(this).is(':checked'));" style="border-radius: 50%" ${this.cfg.hideGrid ? "checked" : ""}> <label>Hide grid(FPS UP)</label></div>
                    <div><input type="checkbox" id="minimap" onchange="window.server.changeCfg('Minimap', $(this).is(':checked'));" style="border-radius: 50%" ${this.cfg.Minimap ? "checked" : ""}> <label>Show minimap</label></div>
                    <div><input type="checkbox" id="drawBotsOnMinimap" onchange="window.server.changeCfg('drawBotsOnMinimap', $(this).is(':checked'));" style="border-radius: 50%" ${this.cfg.drawBotsOnMinimap ? "checked" : ""}> <label>Draw bots on minimap</label></div>
                    <input id="serverIP"  data-v-0733aa78 style="width: 91%; height: 40px ;" placeholder="here will be displayed server IP">
                    <input id="customSkin" data-v-0733aa78 style="width: 91%; height: 40px ;" name="skins" placeholder="Custom skin URL" onchange="window.core.registerSkin(window.nickName, null, this.value, 2, null); console.log(this.value);">
                    <center><strong> Key Binding </strong></center>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="split_bots_x1" onclick="window.server.changeKeyCfg('split_bots_x1');" style="text-align: center; min-width: 50px; width: auto;; ">${this.opKeys.split_bots_x1.key}</span><span style="margin: 4px 25px 0px 0px;"> Split bots </span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="split_bots_x2" onclick="window.server.changeKeyCfg('split_bots_x2');" style="text-align: center; min-width: 50px; width: auto;; ">${this.opKeys.split_bots_x2.key}</span><span style="margin: 4px 25px 0px 0px;"> Split bots X2</span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="split_bots_x4" onclick="window.server.changeKeyCfg('split_bots_x4');" style="text-align: center; min-width: 50px; width: auto;; ">${this.opKeys.split_bots_x4.key}</span><span style="margin: 4px 25px 0px 0px;"> Split bots X4</span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="eject_bots" onclick="window.server.changeKeyCfg('eject_bots');" style="text-align: center; min-width: 50px; width: auto;; ">${this.opKeys.eject_bots.key}</span><span style="margin: 4px 25px 0px 0px;"> Eject bots </span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="ai_bots" onclick="window.server.changeKeyCfg('ai_bots');" style="text-align: center; min-width: 50px; width: auto;; ">${this.opKeys.ai_bots.key}</span><span style="margin: 4px 25px 0px 0px;"> AI bots (ON/OFF) </span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="eject_user" onclick="window.server.changeKeyCfg('eject_user');" style="text-align: center; min-width: 50px; width: auto;; ">${this.opKeys.eject_user.key}</span><span style="margin: 4px 25px 0px 0px;"> Eject user </span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="split_user_x2" onclick="window.server.changeKeyCfg('split_user_x2');" style="text-align: center;  min-width: 50px; width: auto;; ">${this.opKeys.split_user_x2.key}</span><span style="margin: 4px 25px 0px 0px;"> Double split(user) </span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="split_user_x4" onclick="window.server.changeKeyCfg('split_user_x4');" style="text-align: center;  min-width: 50px; width: auto;; ">${this.opKeys.split_user_x4.key}</span><span style="margin: 4px 25px 0px 0px;"> x16 split(user) </span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="user_virus_protect" onclick="window.server.changeKeyCfg('user_virus_protect');" style="text-align: center;  min-width: 50px; width: auto;; ">${this.opKeys.user_virus_protect.key}</span><span style="margin: 4px 25px 0px 0px;"> Virus protect(ON/OFF) </span></div>
                    <div style="margin-top: 2px;"><span class="btn btn-primary" id="stop_user" onclick="window.server.changeKeyCfg('stop_user');" style="text-align: center;  min-width: 50px; width: auto;; ">${this.opKeys.stop_user.key}</span><span style="margin: 4px 25px 0px 0px;"> Freeze cell(ON/OFF) </span></div>
                </div>
            </div>
            `);
        }
    }


    class inject {
        constructor() {
            this.coreurl = "";
            this.inject();
        }

        inject() {
            let parseOrigin = /(\w+)\:\/\/(\w+.\w+)/gi.exec(target.origin)[2];
            console.log(parseOrigin);
            let _this = this;
            if(parseOrigin == "mope.io") {
                setInterval(() => {
                    target.server.getRecaptchaToken();
                }, 2500);
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);

                    if(/(\w+-\w+.\w+.\w+)/.test(this.url)) {
                        let serverurl = /(\w+-\w+.\w+.\w+)/.exec(this.url)[0];
                        serverurl = `wss://${serverurl}:443`;
                        if(!serverurl.includes(target.server.wsip)) {
                            let buf = _this.normalizeBuffer(arguments[0]);
                            let offset = 0;
                            let opcode = buf.getUint8(offset++, 0);
                            switch(opcode) {
                                case 5:
                                    target.server.mousePosition.x = buf.getInt16(offset);
                                    offset += 2;
                                    target.server.mousePosition.y = buf.getInt16(offset);
                                    target.server.gameData(2);
                                    break;
                            }
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            //target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "beta.mope") {
                console.log("INJECTING")
                console.log("btw nice protection");
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);

                    let serverurl = this.url;
                    console.log(serverurl, target.server.wsip);
                    if(!serverurl.includes(target.server.wsip)) {
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        target.server.sendBytesDebug(new Uint8Array(arguments[0]) + "")
                        switch(opcode) {
                            case 5:
                                target.server.mousePosition.x = buf.getInt16(offset);
                                offset += 2;
                                target.server.mousePosition.y = buf.getInt16(offset);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "ixagar.net") {
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 2:
                                break;
                            case 16:
                                target.server.mousePosition.x = buf.getInt32(offset, true);
                                offset += 4;
                                target.server.mousePosition.y = buf.getInt32(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "slither.io") {
                setInterval(() => {
                    if (target.social) target.social.remove();
                    target.server.mousePosition.x = target.snake.xx;
                    target.server.mousePosition.y = target.snake.yy;
                    target.server.gameData(2);
                    let server = "ws://" + target.bso.ip + ":" + target.bso.po + "/slither";
                    if(target.server.server != server) {
                        target.server.server = server;
                        target.server.gameData(1);
                    }
                }, 200);
            } else if(parseOrigin == "de.agar") {
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getFloat64(offset, true);
                                offset += 8;
                                target.server.mousePosition.y = buf.getFloat64(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "agar.cc") {
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        console.log(new Uint8Array(arguments[0]) + "")
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getFloat64(offset, true);
                                offset += 8;
                                target.server.mousePosition.y = buf.getFloat64(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "cellcraft.io") {
                target.WebSocket.prototype._sniffer = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._sniffer.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        window.checkAds = () => {return false}
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getInt32(offset, true);
                                offset += 4;
                                target.server.mousePosition.y = buf.getInt32(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "www.modd") {
                
                setTimeout(() => {
                    $("#more-games").remove();
                }, 5000);

                target.WebSocket.prototype._sniffer = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._sniffer.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        console.log(JSON.parse(arguments[0]));
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            //target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "balz.io") {
                target.WebSocket.prototype._sniffer = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._sniffer.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        if(typeof arguments[0] == "string") return;
                        console.log(arguments[0])
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getInt32(offset, true);
                                offset += 4;
                                target.server.mousePosition.y = buf.getInt32(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            }
        };


        normalizeBuffer(buf) {
            buf = new Uint8Array(buf);
            //if(buf[0] != 5) console.log(buf)
            let newBuf = new DataView(new ArrayBuffer(buf.byteLength));
            for(let i = 0; i < buf.byteLength; i++) {
                newBuf.setUint8(i, buf[i])
            }
            return newBuf;
        }

        replace(data, func, type) {

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

            /*
                <div class="opcontentc botsCounter">
                    <p>Bots: <span class="max">0/0</span>
                        <span class="opsmall expire">Allocated bots</span>
                        <span id="opbot_load"></span>
                    </p>
                </div>
                <div id="splitB" class="opcontentc feedCmd">
                    <p>Split<span class="opsmall">Key <span class="KEYBINDING_BOT_FEED">- X</span></span></p>
                </div>
                <div id="ejectB" class="opcontentc splitCmd">
                    <p>Eject<span class="opsmall">Key <span class="KEYBINDING_BOT_SPLIT">- C</span></span></p>
                </div>
                <div id="collectB" class="opcontentc freezeCmd">
                    <p>Collect<span class="opsmall">Key <span class="KEYBINDING_FREEZE">- P</span></span></p>
                </div>
                <div class="opcontentc botMod">
                    <p>Time left<span class="opsmall"><span class="botmod"></span><span id="timeLeft">0 Days</span></span></p>
                </div>
                <div class="opcontentc" style="right: 4px; width:136px">
                    <p>Status<span class="opsmall"><span class="botmod"></span><span id="ServerStatus">Waiting</span></span></p>
                </div>
            */

            GUI.innerHTML = htmlToInject;

            GUI.onload = function() {
                this.remove();
            };

            (document.body || document.getElementsByTagName("body")[0]).appendChild(GUI);

            //target.server.addController();

        }
    }

    target.server = new serverManager();

    target.inject = new inject();


    // minimap by mrsonicmaster
    class Minimap {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.init();
        }
        init() {
            this.createCanvas();
            requestAnimationFrame(this.drawUpdate.bind(this));
        }
        createCanvas() {
            if (!document.body) return setTimeout(this.createCanvas.bind(this), 100);
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext('2d');
            this.addCanvasCustomization();
            document.body.appendChild(this.canvas);
            console.log("canvas created");
        }
        addCanvasCustomization() {
            this.canvas.id = "Minimap";
            this.canvas.width = 200;
            this.canvas.height = 200;
            this.canvas.style.position = "absolute";
            this.canvas.style.border = '3px solid #444444';
            this.canvas.style.top = "75%";
            this.canvas.style.right = "2%";
            this.drawUpdate();
        }
        clearCanvas() {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        drawUpdate() {
            if (!this.ctx && !window.server.cfg.Minimap) return console.log(window.server.cfg.Minimap);
            this.clearCanvas();
            const cWidth = this.canvas.width;
            const cHeight = this.canvas.height;
            this.ctx.strokeStyle = "#444444";
            this.ctx.strokeWidth = 1;
            this.ctx.beginPath();
            this.ctx.globalAlpha = 0.9;
            this.ctx.rect(0, 0, cWidth, cHeight);
            this.ctx.fillStyle = "black";
            this.ctx.fill();
            var sectorCount = 5;
            var w = cWidth / sectorCount;
            var h = cHeight / sectorCount;
            this.ctx.fillStyle = "#808080";
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            this.ctx.globalAlpha = 0.7;
            this.ctx.font = (w / 3 | 0) + "px Ubuntu";
            for (var y = 0; y < sectorCount; ++y) {
                for (var x = 0; x < sectorCount; ++x) {
                    var str = String.fromCharCode(65+y) + (x + 1);
                    var dx = (x + 0.5) * w;
                    var dy = (y + 0.5) * h;
                    this.ctx.fillText(str, dx, dy);
                }
            }
            this.ctx.restore();
            this.ctx.save();
            if (window.server.cfg.drawBotsOnMinimap && window.bots.length > 0) this.drawBotUpdate();
            this.drawAgarPlayers();
            this.drawCellUpdate(window.server.cellX, window.server.cellY, "#00FFFF");
            requestAnimationFrame(this.drawUpdate.bind(this));
        }
        drawCellUpdate(x, y, color) {
            const transX = (7071 + x) / 14142 * this.canvas.height;
            const transY = (7071 + y) / 14142 * this.canvas.width;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(transX, transY, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            const transMoveX = (7071 + ((window.clientXXX - window.innerWidth / 2) / window.server.zoomValue) + window.server.cellX) / 14142 * this.canvas.height;
            const transMoveY = (7071 + ((window.clientYYY - window.innerHeight / 2) / window.server.zoomValue) + window.server.cellY) / 14142 * this.canvas.width;
            this.ctx.globalAlpha = 1.0;
            this.ctx.fillStyle = "#FF0000";
            this.ctx.beginPath();
            this.ctx.arc(transMoveX, transMoveY, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        drawBotUpdate() {
            for (const bot of window.bots) {
                if (bot.y !== 0 && bot.x !== 0) {
                    this.ctx.globalAlpha = 0.9;
                    const botTransX = (7071 + bot.x) / 14142 * this.canvas.height;
                    const botTransY = (7071 + bot.y) / 14142 * this.canvas.width;
                    this.ctx.fillStyle = "#FFFF99";
                    this.ctx.beginPath();
                    this.ctx.arc(botTransX, botTransY, 2, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
        drawAgarPlayers() {
            for (const bot of window.agarProto.lb) {
                if (bot.y !== 0 && bot.x !== 0) {
                    this.ctx.globalAlpha = 0.9;
                    const botTransX = (7071 + bot.x) / 14142 * this.canvas.height;
                    const botTransY = (7071 + bot.y) / 14142 * this.canvas.width;
                    this.ctx.fillStyle = "#46d246";
                    this.ctx.beginPath();
                    this.ctx.arc(botTransX, botTransY, 6, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
    }
    window.addEventListener("mousemove", event => {
        window.clientXXX = event.clientX;
        window.clientYYY = event.clientY;
    });
    class agarProto {
        constructor() {
            this.ws = null;
            this.dKey = 0;
            this.clientKey = 0;
            this.lb = [];
            setInterval(() => {
                if(this.lb[0] && this.lb.length > 0) {
                    window.server.sendCheck(this.lb[0].x, this.lb[0].y);
                } else {
                    window.server.sendCheck2();
                }
                if(this.lb.length <= 1) this.lb = [];
            }, 500);
        }
        xor(buf, xorKey) {
            const newBuf = new DataView(new ArrayBuffer(buf.byteLength));
            for (let i = 0; i < buf.byteLength; i++) newBuf.setUint8(i, buf.getUint8(i) ^ (xorKey >>> ((i % 4) * 8)) & 255);
            return newBuf;
        }
        overWrite(ws) {
            this.ws = ws;
            this.dKey = 0;
            setTimeout(() => {
                this.ws._send = this.ws.send;
                this.ws.send = function() {
                    this.ws._send(arguments[0]);
                    let msg = new DataView(new Uint8Array(arguments[0]).buffer);
                    if(msg.getUint8(0) == 255 && !this.clientKey) {
                        this.clientKey = msg.getUint32(1, true);
                    }
                }.bind(this);
                this.ws._msgHandler = this.ws.onmessage;
                this.ws.onmessage = function(msg) {
                    this.ws._msgHandler(msg);
                    msg = new DataView(msg.data);
                    this.dKey ? msg = this.xor(msg, this.dKey ^ this.clientKey) : "";
                    let offset = 0;
                    let opcode = msg.getUint8(offset++);
                    switch(opcode) {
                        case 69: {
                            this.lb = [];
                            let record = msg.getUint16(offset, true);
                            offset += 2;
                            for(let i = 0; i < record; i++) {
                                let x = msg.getInt32(offset, true);
                                offset += 4;
                                let y = msg.getInt32(offset, true);
                                offset += 4;
                                let size = msg.getInt32(offset, true);
                                offset += 5;
                                let mass = ~~(Math.sqrt(100 * size));
                                this.lb.push({
                                    x: x - ((window.server.mapLocation.minx + window.server.mapLocation.maxx) / 2),
                                    y: y - ((window.server.mapLocation.miny + window.server.mapLocation.maxy) / 2),
                                    size: size,
                                    mass: mass
                                });
                            }
                        } break;
                        case 241: {
                            this.dKey = msg.getInt32(offset, true);
                        } break;
                    }
                }.bind(this);
            }, 0);
        }
    }

    if(window.location.origin == "https://agar.io") {
        window.agarProto = new agarProto()
        setTimeout(() => {
             window.minimap = new Minimap();
        }, 5000);
    }

    console.log("SERVER STARTED")

})(window);
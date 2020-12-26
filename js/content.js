
const injectScript = () => {
    script = document.createElement("script");
    script.src = chrome.extension.getURL('js/script.js');
    script.onload = function() {
        this.remove();
    };
    
    (document.head || document.documentElement).appendChild(script);
    

    let injectLogo = document.createElement("input");
    injectLogo.id = "_opLogo";
    injectLogo.value = chrome.extension.getURL("./icons/icon.png");
    injectLogo.style = "display: none;"
    injectLogo.onload = function() {
        this.remove();
    };

    (document.head || document.documentElement).appendChild(injectLogo);
}

const injectIntoDelta = () => {
    script = document.createElement("script");
    script.src = chrome.extension.getURL('js/delta.js');
    script.onload = function() {
        this.remove();
    };
    
    (document.head || document.documentElement).appendChild(script);
    

    let injectLogo = document.createElement("input");
    injectLogo.id = "_opLogo";
    injectLogo.value = chrome.extension.getURL("./icons/icon.png");
    injectLogo.style = "display: none;"
    injectLogo.onload = function() {
        this.remove();
    };

    (document.head || document.documentElement).appendChild(injectLogo);
};

let injected = false;

let parseOrigin = /(\w+)\:\/\/(\w+.\w+)/gi.exec(window.origin)[2];
if(parseOrigin == "agar.io" || "www.modd") {
    var observer = new WebKitMutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (/delta/.test(node.src)) {
                    observer.disconnect();
                    injectIntoDelta();
                    injected = true;
                } else if (/agario\.core\.js/i.test(node.src)) {
                    observer.disconnect();
                    node.parentNode.removeChild(node);
                    var request = new XMLHttpRequest();
                    request.open("get", node.src, true);
                    request.send();
                    request.onload = function() {
                        var coretext = this.responseText;
                        var newscript = document.createElement("script");
                        newscript.type = "text/javascript";
                        newscript.async = true;
                        newscript.textContent = replaceCore(coretext);
                        document.body.appendChild(newscript);
                        injectScript();
                        injected = true;
                    };
                }
            });
        });
    });
    
    observer.observe(window.document, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true
    });
}



setTimeout(() => {
    if(!injected) injectScript();
}, 8000);

const replaceCore = core => {
    /*core = core.replace(/var (\w)=new WebSocket\((\w\(\w\))\);/, `window.server.server=$2; window.server.startBots = false; var $1=new WebSocket(window.server.server); window.agarProto.overWrite($1);`)
    core = core.replace(/;if\((\w)<1\.0\){/i, `;if(0){`);
    core = core.replace(/(\w\[\w>>\d\]=\w\?\w:\w;)((\w).*?;)/i, `var nodesize=$1 if(window.server.cfg.smoothAnimations) { y=true; } else { $2 };`);
    core = core.replace(/0;\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);/i, `$& if(Math.abs($3-$1)>14e3 && Math.abs($4-$2)>14e3){ window.map = {minx:$1, miny:$2, maxx:$3, maxy:$4, width:$3-$1, height:$4-$2}; window.server.mOX = ($1+$3)/2; window.server.mOY = ($2+$4)/2};`);
    core = core.replace(/([\w$]+\(\d+,\w\[\w>>2\]\|0,(\+\w),(\+\w)\)\|0;[\w$]+\(\d+,\w\[\w>>2\]\|0,\+-(\+\w\[\w\+\d+>>3\]),\+-(\+\w\[\w\+\d+>>3\])\)\|0;)/i, `$1 if(window.server) { window.server.cellX = $4; window.cellY = $5; window.server.zoomValue=$2; };`)
    core = core.replace(/\w\.MC\.onPlayerSpawn\)/i, `$& window.server.sendParty(); window.server.onPlayerSpawn();`);
    core = core.replace(/\w\.MC\.onPlayerDeath\)/i, `$& window.server.onPlayerDeath();`);
    core = core.replace(/(\w)=-86;(\w)=-86;(\w)=-86;(\w)=-1;(\w)=-1;(\w)=-1\}/i, `$&; var orjstroke=[$1,$2,$3],orjfill=[$4,$5,$6];if(nodesize<=20){[$1,$2,$3]=[$4,$5,$6]=[4,79,94]}else{if(window.gameCtx.lineJoin=="miter"){[$1,$2,$3]=[$4,$5,$6]=[118,1,118]}else{window.gameCtx.globalAlpha=1;var lc_ismyblob=false;if(window.isalive&&!window.ismycolor){if(typeof window.ismyblob==="function"){if(window.ismyblob(cellMemOffset)){window.ismycolor=""+$4+$5+$6+""}}}if(window.isalive&&window.ismycolor==""+$4+$5+$6+""){if(window.ismyblob(cellMemOffset)){lc_ismyblob=true;if(window.selectsize*0.97<nodesize&&nodesize<window.selectsize*1.03){window.myblobx=nodex;window.mybloby=nodey}}}if(!lc_ismyblob){var mymass=Math.floor(window.selectsize*window.selectsize/100),nodemass=Math.floor(nodesize*nodesize/100);if(!window.isalive){mymass=1000}}}}if(!window.server.cfg.specialColors){[$1,$2,$3]=orjstroke,[$4,$5,$6]=orjfill};`);
    core = core.replace(/\w\[\w>>2\]=\w\+\w\*\(\+\w\[\w\+\d+>>2\]-\w\);/i, `var nodey=$&`);
    core = core.replace(/\w\[\w>>2\]=\w\+\(\+\w\[(\w)\+\d+>>2\]-\w\)\*\w;/i, `var nodex=$&; var cellMemOffset=$1;`);
    core = core.replace(/\w=\w\[(\w)(\+\d+)?>>2\]\|0;\w=\w\[\d+\]\|0;\w=\w\[\d+\]\|0;.*?(\w)=\(\w\|0\)!=\(\w\|0\);/i, `$& if(isvirus||window.other_mass){$3=true}; if(!window.ismyblob){window.ismyblob=function($1){$& return $3}};`);
    core = core.replace(/\w=\w\[(\w)(\+\d+)?>>2\]\|0;\w=\w\[\d+\]\|0;\w=\w\[\d+\]\|0;.*?(\w)=\(\w\|0\)!=\(\w\|0\);/i,`$1; var isvirus=$2; if(isvirus && !window.virus_mass){$3};`);
    core = core.replace(/(([\w$]+)=[\w$]+\.getContext\("2d"\);)/i, `if($2.id==="canvas"){$1 window.gameCtx=$2;}else{$1}`);
    core = core.replace(/(\w+\(\d+,\w+\|0,\.5,\.5\)\|0);(\w+\(\d+,\w+\|0,\.5,50\.5\)\|0);(\w+\(\d+,\w+\|0,\.5,\.5\)\|0);(\w+\(\d+,\w+\|0,50\.5,\.5\)\|0)/, `if(!window.server.cfg.hideGrid) { $1; $2; $3; $4 };`);
    core = core.replace(/(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\);(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\)/, `$&; if(window.server) { window.server.testMouse = {x: $1, y: $2} }`);
    return core;*/
    core = core.replace(/\w+\(\d+,\w+\[\w+>>2\]\|0,\+\-(\+\w\[\w+\+\d+>>3\]),\+\-(\+\w+\[\w\+\d+>>3\])\)\|0;/i, `$& if(window.server.cfg.backSectors) { window.server.drawCustomMap(); };`);
    core = core.replace(/([\w$]+\(\d+,\w\[\w>>2\]\|0,(\+\w),(\+\w)\)\|0;[\w$]+\(\d+,\w\[\w>>2\]\|0,\+-(\+\w\[\w\+\d+>>3\]),\+-(\+\w\[\w\+\d+>>3\])\)\|0;)/i, 
    `$1 if(window.server) { window.server.cellX = $4; window.server.cellY = $5; window.server.zoomValue=$2; };`)
    core = core.replace(/var (\w)=new WebSocket\((\w\(\w\))\);/,
    `window.server.server=$2;var $1=new WebSocket(window.server.server);window.agarProto.overWrite($1);window.server.stopBots();window.server.changeServerDisplayed();`)
    core = core.replace(/0;\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);/i,
    `$& if(Math.abs($3-$1)>14e3 && Math.abs($4-$2)>14e3){ window.server.mapLocation = {minx:$1, miny:$2, maxx:$3, maxy:$4, width:$3-$1, height:$4-$2}; window.server.mousePosition.oX = ($1+$3)/2; window.server.mousePosition.oY = ($2+$4)/2};`);
    core = core.replace(/(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\);(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\)/,
    `$&; window.server.mousePosition.x = $1; window.server.mousePosition.y = $2; `);
    core = core.replace(/\w\.MC\.onPlayerSpawn\)/i, `$& window.server.gameData(1); window.server.sendSpawn();`);
    core = core.replace(/\w\.MC\.onPlayerDeath\)/i, `$& window.server.sendDeath();`);
    core = core.replace(/;if\((\w)<1\.0\){/i,`;if(0){`);
    core = core.replace(/(\w\[\w>>\d\]=\w\?\w:\w;)((\w).*?;)/i, `var nodesize=$1 if(window.server.cfg.smoothAnimations) { y=true; } else { $2 };`);
    core = core.replace(/(\w)=-86;(\w)=-86;(\w)=-86;(\w)=-1;(\w)=-1;(\w)=-1\}/i, `$&; var orjstroke=[$1,$2,$3],orjfill=[$4,$5,$6];if(nodesize<=20){[$1,$2,$3]=[$4,$5,$6]=[4,79,94]}else{if(window.gameCtx.lineJoin=="miter"){[$1,$2,$3]=[$4,$5,$6]=[118,1,118]}else{window.gameCtx.globalAlpha=1;var lc_ismyblob=false;if(window.isalive&&!window.ismycolor){if(typeof window.ismyblob==="function"){if(window.ismyblob(cellMemOffset)){window.ismycolor=""+$4+$5+$6+""}}}if(window.isalive&&window.ismycolor==""+$4+$5+$6+""){if(window.ismyblob(cellMemOffset)){lc_ismyblob=true;if(window.selectsize*0.97<nodesize&&nodesize<window.selectsize*1.03){window.myblobx=nodex;window.mybloby=nodey}}}if(!lc_ismyblob){var mymass=Math.floor(window.selectsize*window.selectsize/100),nodemass=Math.floor(nodesize*nodesize/100);if(!window.isalive){mymass=1000}}}}if(!window.server.cfg.specialColors){[$1,$2,$3]=orjstroke,[$4,$5,$6]=orjfill};`);
    core = core.replace(/\w\[\w>>2\]=\w\+\w\*\(\+\w\[\w\+\d+>>2\]-\w\);/i, `var nodey=$&`);
    core = core.replace(/\w\[\w>>2\]=\w\+\(\+\w\[(\w)\+\d+>>2\]-\w\)\*\w;/i, `var nodex=$&; var cellMemOffset=$1;`);
    core = core.replace(/\w=\w\[(\w)(\+\d+)?>>2\]\|0;\w=\w\[\d+\]\|0;\w=\w\[\d+\]\|0;.*?(\w)=\(\w\|0\)!=\(\w\|0\);/i, `$& if(isvirus||window.other_mass){$3=true}; if(!window.ismyblob){window.ismyblob=function($1){$& return $3}};`);
    core = core.replace(/\w=\w\[(\w)(\+\d+)?>>2\]\|0;\w=\w\[\d+\]\|0;\w=\w\[\d+\]\|0;.*?(\w)=\(\w\|0\)!=\(\w\|0\);/i,`$1; var isvirus=$2; if(isvirus && !window.virus_mass){$3};`);
    core = core.replace(/(([\w$]+)=[\w$]+\.getContext\("2d"\);)/i, `if($2.id==="canvas"){$1 window.gameCtx=$2;}else{$1}`);
    core = core.replace(/(\w+\(\d+,\w+\|0,\.5,\.5\)\|0);(\w+\(\d+,\w+\|0,\.5,50\.5\)\|0);(\w+\(\d+,\w+\|0,\.5,\.5\)\|0);(\w+\(\d+,\w+\|0,50\.5,\.5\)\|0)/, `if(!window.server.cfg.hideGrid) { $1; $2; $3; $4 };`);
    core = core.replace(/(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\);(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\)/, `$&; if(window.server) { window.server.testMouse = {x: $1, y: $2} }`);
    return core;
}
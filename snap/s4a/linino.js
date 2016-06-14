// Linino WebSockets protocol

WorldMorph.prototype.ws = new WebSocket('ws://arduino.local:8888');

WorldMorph.prototype.ws.binaryType = 'arraybuffer';

WorldMorph.prototype.send = function (array) {
    this.ws.send(new Uint8Array(array).buffer);
};

WorldMorph.prototype.ws.onmessage = function (evt) { 
    if (!WorldMorph.prototype.board) {
        WorldMorph.prototype.initBoard(JSON.parse(evt.data));
    } else {
        try {
            var data = JSON.parse(evt.data);
            world.board.pins[data[0]] = data[1];
        } catch (err) {
            console.log('Unparseable message!\n' + err);
            return;
        }
    }
};

WorldMorph.prototype.ws.onclose = function () { 
    ide.inform('Connection error', 'WebSockets connection dropped!');
};

WorldMorph.prototype.initBoard = function (pinConfig) {
    var myself = this;
    this.board = { 
        pins: [ 
            { supportedModes: [] },
            { supportedModes: [] }
        ]
    };

    Object.keys(pinConfig.digital).forEach(
            function (each) {
                if (each === Number(each).toString()) {
                    myself.board.pins[Number(each)] = { supportedModes: ['digital'] };
                }
            });

    myself.board.analogPins = Object.keys(pinConfig.analog).filter(
            function (pinName) {
                return pinName === Number(pinName).toString();
            });

    ['servo', 'pwm'].forEach(function (modeName) {
        Object.keys(pinConfig[modeName]).forEach(
                function (each) {
                    if (each === Number(each).toString()) {
                        myself.board.pins[Number(each)].supportedModes.push(modeName);
                    }
                });
    });
};

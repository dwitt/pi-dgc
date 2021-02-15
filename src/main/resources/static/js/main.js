// Constant definitions
const DEBUG_MODE = false;
const MAX_RPM = 8000;
const MAX_MPH = 160;
const MAX_BOOST = 30;

// Tracking variables
let rpm = 0;
let mph = 0;
let coolant = 170;
let fuel = 0.0;
let initState = 0;
let boost = 0;
let boostLaggingMax = 0;

// Indicators
let indicators = {};

// Pixi Application
let app;

// Sprite storage
const sprites = {};

// Text elements
const texts = {};

// Graphics
const graphics = {};

// Backup camera
const video = document.querySelector("#videoElement");

// STOMP client
let stompClient;

// Clock value
let clock = "0:00 AM";

// Keyboard bindings
const keyUp = keyboard("ArrowUp");
let keyUpState = false;
const keyDown = keyboard("ArrowDown");
let keyDownState = false;
const keyI = keyboard("i")
let keyIState = false;
const keyB = keyboard("b")
let keyBState = false;


// App setup
function setup() {
    let type = 'WebGL';
    if (!PIXI.utils.isWebGLSupported()) {
        type = 'canvas';
    }

    PIXI.utils.sayHello(type);

    app = new PIXI.Application({
        width: 1280,
        height: 480,
        antialias: true,
        backgroundColor: 0x000000
    });

    // Stop animations while assets are loaded
    app.stop();

    // Add Pixi canvas to document
    document.body.appendChild(app.view);

    // Bind webcam to videoElement
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({video: {width: 800, height: 600}})
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (error) {
                console.log("Something went wrong binding the camera!");
            });
    }

    // Turn on all indicators for startup sequence
    indicators.left = true;
    indicators.right = true;
    indicators.lowBeam = true;
    indicators.highBeam = true;
    indicators.mil = true;
    indicators.oil = true;
    indicators.battery = true;
    indicators.fuel = true;

    // Load resources and start animations
    PIXI.Loader.shared.add('img/spritesheet.json').load(() => {
        // Get reference to sprite sheet
        const sheet = PIXI.Loader.shared.resources['img/spritesheet.json'].spritesheet;

        sprites.centerLines = new PIXI.Sprite(sheet.textures['center_lines.png']);
        sprites.centerLines.anchor.set(0.5, 0.5);
        sprites.centerLines.position.set(640, 240);
        app.stage.addChild(sprites.centerLines);

        sprites.backupCamera = new PIXI.Sprite(PIXI.Texture.from(video));
        sprites.backupCamera.anchor.set(0.5, 0.5);
        sprites.backupCamera.height = 323.5;
        sprites.backupCamera.position.set(640, 231);
        sprites.backupCamera.visible = false;
        app.stage.addChild(sprites.backupCamera);

        sprites.leftGaugeBg = new PIXI.Sprite(sheet.textures['left_gauge_bg.png']);
        sprites.leftGaugeBg.anchor.set(0.5, 0.5);
        sprites.leftGaugeBg.position.set(249, 240);
        app.stage.addChild(sprites.leftGaugeBg);

        sprites.leftBoostHilite = new PIXI.Sprite(sheet.textures['blue_hilite_leading.png']);
        sprites.leftBoostHilite.anchor.set(2.85, 0.5);
        sprites.leftBoostHilite.position.set(249, 240);
        app.stage.addChild(sprites.leftBoostHilite);

        // Left gauge boost black overlay
        graphics.leftGaugeBoostBlackout = new PIXI.Graphics();
        graphics.leftGaugeBoostBlackout.beginFill(0x000000);
        graphics.leftGaugeBoostBlackout.drawTorus(249, 240, 78, 125, boostToAngle(boost), degToRad(35))
        graphics.leftGaugeBoostBlackout.endFill();
        app.stage.addChild(graphics.leftGaugeBoostBlackout);

        sprites.leftBoostLaggingMax = new PIXI.Sprite(sheet.textures['lagging_max_boost.png']);
        sprites.leftBoostLaggingMax.anchor.set(2.85, 0.5);
        sprites.leftBoostLaggingMax.position.set(249, 240);
        sprites.leftBoostLaggingMax.visible = false;
        app.stage.addChild(sprites.leftBoostLaggingMax);

        sprites.leftGaugeFg = new PIXI.Sprite(sheet.textures['left_gauge_fg.png']);
        sprites.leftGaugeFg.anchor.set(0.5, 0.5);
        sprites.leftGaugeFg.position.set(249, 240);
        app.stage.addChild(sprites.leftGaugeFg);

        sprites.rightGaugeBg = new PIXI.Sprite(sheet.textures['right_gauge_bg.png']);
        sprites.rightGaugeBg.anchor.set(0.5, 0.5);
        sprites.rightGaugeBg.position.set(1031, 240);
        app.stage.addChild(sprites.rightGaugeBg);

        sprites.rightBoostHilite = new PIXI.Sprite(sheet.textures['blue_hilite_leading.png']);
        sprites.rightBoostHilite.anchor.set(2.85, 0.5);
        sprites.rightBoostHilite.position.set(1031, 240);
        app.stage.addChild(sprites.rightBoostHilite);

        // Right gauge boost black overlay
        graphics.rightGaugeBoostBlackout = new PIXI.Graphics();
        graphics.rightGaugeBoostBlackout.beginFill(0x000000);
        graphics.rightGaugeBoostBlackout.drawTorus(1031, 240, 78, 125, boostToAngle(boost), degToRad(35))
        graphics.rightGaugeBoostBlackout.endFill();
        app.stage.addChild(graphics.rightGaugeBoostBlackout);

        sprites.rightBoostLaggingMax = new PIXI.Sprite(sheet.textures['lagging_max_boost.png']);
        sprites.rightBoostLaggingMax.anchor.set(2.85, 0.5);
        sprites.rightBoostLaggingMax.position.set(1031, 240);
        sprites.rightBoostLaggingMax.visible = false;
        app.stage.addChild(sprites.rightBoostLaggingMax);

        sprites.rightGaugeFg = new PIXI.Sprite(sheet.textures['right_gauge_fg.png']);
        sprites.rightGaugeFg.anchor.set(0.5, 0.5);
        sprites.rightGaugeFg.position.set(1031, 240);
        app.stage.addChild(sprites.rightGaugeFg);

        sprites.rpmNeedle = new PIXI.Sprite(sheet.textures['big_needle.png']);
        sprites.rpmNeedle.anchor.set(2.54, 0.5);
        sprites.rpmNeedle.position.set(249, 240);
        sprites.rpmNeedle.angle = rpmToAngle(rpm);
        app.stage.addChild(sprites.rpmNeedle);

        sprites.mphNeedle = new PIXI.Sprite(sheet.textures['big_needle.png']);
        sprites.mphNeedle.anchor.set(2.54, 0.5);
        sprites.mphNeedle.position.set(1031, 240);
        sprites.mphNeedle.angle = mphToAngle(mph);
        app.stage.addChild(sprites.mphNeedle);

        sprites.coolantNeedle = new PIXI.Sprite(sheet.textures['little_needle.png']);
        sprites.coolantNeedle.anchor.set(6.52, 0.5);
        sprites.coolantNeedle.position.set(249, 240);
        sprites.coolantNeedle.angle = temperatureToAngle(coolant);
        app.stage.addChild(sprites.coolantNeedle);

        sprites.fuelNeedle = new PIXI.Sprite(sheet.textures['little_needle.png']);
        sprites.fuelNeedle.anchor.set(6.52, 0.5);
        sprites.fuelNeedle.position.set(1031, 240);
        sprites.fuelNeedle.angle = fuelToAngle(fuel);
        app.stage.addChild(sprites.fuelNeedle);

        sprites.centerLogo = new PIXI.Sprite(sheet.textures['center_logo.png']);
        sprites.centerLogo.anchor.set(0.5, 0.5);
        sprites.centerLogo.position.set(640, 240);
        sprites.centerLogo.alpha = 0;
        app.stage.addChild(sprites.centerLogo);

        sprites.leftIndicator = new PIXI.Sprite(sheet.textures['left_indicator.png']);
        sprites.leftIndicator.anchor.set(0.5, 0.5);
        sprites.leftIndicator.position.set(490, 115);
        sprites.leftIndicator.alpha = 0;
        app.stage.addChild(sprites.leftIndicator);

        sprites.rightIndicator = new PIXI.Sprite(sheet.textures['right_indicator.png']);
        sprites.rightIndicator.anchor.set(0.5, 0.5);
        sprites.rightIndicator.position.set(790, 115);
        sprites.rightIndicator.alpha = 0;
        app.stage.addChild(sprites.rightIndicator);

        sprites.lowBeam = new PIXI.Sprite(sheet.textures['low_beam.png']);
        sprites.lowBeam.anchor.set(0.5, 0.5);
        sprites.lowBeam.position.set(565, 115);
        sprites.lowBeam.alpha = 0;
        app.stage.addChild(sprites.lowBeam);

        sprites.highBeam = new PIXI.Sprite(sheet.textures['high_beam.png']);
        sprites.highBeam.anchor.set(0.5, 0.5);
        sprites.highBeam.position.set(565, 115);
        sprites.highBeam.alpha = 0;
        app.stage.addChild(sprites.highBeam);

        sprites.mil = new PIXI.Sprite(sheet.textures['mil.png']);
        sprites.mil.anchor.set(0.5, 0.5);
        sprites.mil.position.set(640, 115);
        sprites.mil.alpha = 0;
        app.stage.addChild(sprites.mil);

        sprites.oil = new PIXI.Sprite(sheet.textures['oil.png']);
        sprites.oil.anchor.set(0.5, 0.5);
        sprites.oil.position.set(715, 115);
        sprites.oil.alpha = 0;
        app.stage.addChild(sprites.oil);

        sprites.battery = new PIXI.Sprite(sheet.textures['battery.png']);
        sprites.battery.anchor.set(0.5, 0.5);
        sprites.battery.position.set(640, 362);
        sprites.battery.alpha = 0;
        app.stage.addChild(sprites.battery);

        sprites.fuel = new PIXI.Sprite(sheet.textures['fuel.png']);
        sprites.fuel.anchor.set(0.5, 0.5);
        sprites.fuel.position.set(744, 362);
        sprites.fuel.alpha = 0;
        app.stage.addChild(sprites.fuel);

        // Main gauge font
        PIXI.BitmapFont.from("LargeGauge", {
            fontFamily: "Arial",
            align: "center",
            fontSize: 40,
            strokeThickness: 2,
            fill: "white"
        });

        // PSI gauge font
        PIXI.BitmapFont.from("SmallGauge", {
            fontFamily: "Arial",
            align: "center",
            fontSize: 20,
            strokeThickness: 2,
            fill: "white"
        });

        texts.rpm = new PIXI.BitmapText(Math.trunc(rpm).toString(), {fontName: "LargeGauge"});
        texts.rpm.anchor.set(0.5, 0.5);
        texts.rpm.position.set(247, 240);
        app.stage.addChild(texts.rpm);

        texts.mph = new PIXI.BitmapText(Math.trunc(mph).toString(), {fontName: "LargeGauge"});
        texts.mph.anchor.set(0.5, 0.5);
        texts.mph.position.set(1029, 240);
        app.stage.addChild(texts.mph);

        texts.boostLeft = new PIXI.BitmapText(Math.trunc(boost).toString() + "psi", {fontName: "SmallGauge"});
        texts.boostLeft.anchor.set(0.5, 0.5);
        texts.boostLeft.position.set(247, 337);
        app.stage.addChild(texts.boostLeft);

        texts.boostRight = new PIXI.BitmapText(Math.trunc(boost).toString() + "psi", {fontName: "SmallGauge"});
        texts.boostRight.anchor.set(0.5, 0.5);
        texts.boostRight.position.set(1029, 337);
        app.stage.addChild(texts.boostRight);

        texts.odometer = new PIXI.BitmapText("0 mi", {fontName: "SmallGauge"});
        texts.odometer.anchor.set(0.5, 0.5);
        texts.odometer.position.set(640, 420);
        texts.odometer.alpha = 0.8;
        app.stage.addChild(texts.odometer);

        texts.clock = new PIXI.Text(currentTime(), {
            fontFamily: "Arial",
            align: "center",
            fontSize: 20,
            strokeThickness: 2,
            fill: "white"
        });
        texts.clock.anchor.set(0.5, 0.5);
        texts.clock.position.set(640, 55);
        texts.clock.alpha = 0.8;
        app.stage.addChild(texts.clock);

        // Start animations
        app.start();
    });

    // Start initialization loop
    app.ticker.add(initLoop);
}

// Initialization Loop
function initLoop() {

    if (initState < 40) {
        rpm += 200;
        mph += 4;
        coolant += 2.5;
        fuel += 0.025;
        boost += 0.75;

        sprites.leftIndicator.alpha += 0.025;
        sprites.rightIndicator.alpha += 0.025;
        sprites.lowBeam.alpha += 0.025;
        sprites.highBeam.alpha += 0.025;
        sprites.mil.alpha += 0.025;
        sprites.oil.alpha += 0.025;
        sprites.battery.alpha += 0.025;
        sprites.fuel.alpha += 0.025;
    }
    if (initState >= 40) {
        rpm -= 200;
        mph -= 4;
        coolant -= 2.5;
        fuel -= 0.025;
        boost -= 0.75;

        sprites.leftIndicator.alpha -= 0.025;
        sprites.rightIndicator.alpha -= 0.025;
        sprites.lowBeam.alpha -= 0.025;
        sprites.highBeam.alpha -= 0.025;
        sprites.mil.alpha -= 0.025;
        sprites.oil.alpha -= 0.025;
        sprites.battery.alpha -= 0.025;
        sprites.fuel.alpha -= 0.025;
    }

    if (initState < 80) {
        sprites.centerLogo.alpha += 0.01;
    }

    drawChangingElements();

    initState++;

    if (initState >= 80) {
        app.ticker.remove(initLoop);

        indicators = setAllIndicators(indicators, false);

        // For some reason this is required or the indicators flash before being hidden
        setTimeout(function () {
            sprites.leftIndicator.alpha = 1;
            sprites.rightIndicator.alpha = 1;
            sprites.lowBeam.alpha = 1;
            sprites.highBeam.alpha = 1;
            sprites.mil.alpha = 1;
            sprites.oil.alpha = 1;
            sprites.battery.alpha = 1;
            sprites.fuel.alpha = 1;
        }, 1);

        boostLaggingMax = 0;

        // Create websocket
        connectWebSocket();

        // Start initialization loop
        app.ticker.add(mainLoop);
    }
}

// Main loop
function mainLoop() {
    if (DEBUG_MODE) debugMainLoop();

    drawChangingElements();
}

function drawChangingElements() {
    // Left gauge boost black overlay
    graphics.leftGaugeBoostBlackout.clear();
    graphics.leftGaugeBoostBlackout.beginFill(0x000000);
    graphics.leftGaugeBoostBlackout.drawTorus(249, 240, 78, 125, boostToAngle(boost), degToRad(35))
    graphics.leftGaugeBoostBlackout.endFill();

    // Right gauge boost black overlay
    graphics.rightGaugeBoostBlackout.clear();
    graphics.rightGaugeBoostBlackout.beginFill(0x000000);
    graphics.rightGaugeBoostBlackout.drawTorus(1031, 240, 78, 125, boostToAngle(boost), degToRad(35))
    graphics.rightGaugeBoostBlackout.endFill();

    sprites.rpmNeedle.angle = rpmToAngle(rpm);
    sprites.mphNeedle.angle = mphToAngle(mph);
    sprites.coolantNeedle.angle = temperatureToAngle(coolant);
    sprites.fuelNeedle.angle = fuelToAngle(fuel);
    sprites.leftBoostHilite.rotation = boostToAngle(boost) + degToRad(178.5);
    sprites.rightBoostHilite.rotation = boostToAngle(boost) + degToRad(178.5);

    if (keyBState) {
        sprites.centerLogo.visible = false;
        sprites.backupCamera.visible = true;
    } else {
        sprites.centerLogo.visible = true;
        sprites.backupCamera.visible = false;
    }

    if (boost > boostLaggingMax && initState >= 80) {
        boostLaggingMax = boost;

        sprites.leftBoostLaggingMax.visible = false;
        sprites.rightBoostLaggingMax.visible = false;
    }

    if (boost < boostLaggingMax) {
        sprites.leftBoostLaggingMax.rotation = boostToAngle(boostLaggingMax) + degToRad(178.5);
        sprites.rightBoostLaggingMax.rotation = boostToAngle(boostLaggingMax) + degToRad(178.5);

        if (!sprites.leftBoostLaggingMax.visible) {
            sprites.leftBoostLaggingMax.visible = true;
            sprites.rightBoostLaggingMax.visible = true;

            sprites.leftBoostLaggingMax.alpha = 1;
            sprites.rightBoostLaggingMax.alpha = 1;
        }

        sprites.leftBoostLaggingMax.alpha -= 0.01;
        sprites.rightBoostLaggingMax.alpha -= 0.01;

        if (sprites.leftBoostLaggingMax.alpha <= 0) {
            sprites.leftBoostLaggingMax.alpha = 0;
            sprites.rightBoostLaggingMax.alpha = 0;

            boostLaggingMax = 0;
        }
    }

    texts.rpm.text = Math.trunc(rpm).toString();
    texts.mph.text = Math.trunc(mph).toString();
    texts.boostLeft.text = Math.trunc(boost).toString() + "psi";
    texts.boostRight.text = Math.trunc(boost).toString() + "psi";

    if (indicators.left) {
        if (initState < 80) {
            sprites.leftIndicator.visible = true;
        } else {
            sprites.leftIndicator.visible = new Date().getMilliseconds() < 500;
        }
    } else {
        sprites.leftIndicator.visible = false;
    }

    if (indicators.right) {
        if (initState < 80) {
            sprites.rightIndicator.visible = true;
        } else {
            sprites.rightIndicator.visible = new Date().getMilliseconds() < 500;
        }
    } else {
        sprites.rightIndicator.visible = false;
    }

    sprites.lowBeam.visible = indicators.lowBeam;
    sprites.highBeam.visible = indicators.highBeam && indicators.lowBeam;
    sprites.mil.visible = indicators.mil;
    sprites.oil.visible = indicators.oil;
    sprites.battery.visible = indicators.battery;
    sprites.fuel.visible = indicators.fuel;

    if (currentTime() !== clock) {
        clock = currentTime();
        texts.clock.text = clock;
    }

    // Shift light
    if (rpm >= 6500) {
        app.renderer.backgroundColor = 0xFF0000;
    } else {
        app.renderer.backgroundColor = 0x000000;
    }
}

// Maintains connection to web socket
function connectWebSocket() {
    const socket = new SockJS('/gs-guide-websocket');

    stompClient = Stomp.over(socket);
    stompClient.debug = DEBUG_MODE;

    stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);

        stompClient.subscribe('/topic/status', (message) => {
            const statusMsg = JSON.parse(message.body);

            rpm = statusMsg.rpm;
            coolant = statusMsg.coolant;
            boost = statusMsg.boost;
            mph = statusMsg.mph;
            indicators.mil = statusMsg.mil;
            indicators.oil = statusMsg.oil;
            indicators.lowBeam = statusMsg.lowBeam;
            indicators.highBeam = statusMsg.highBeam;
            indicators.left = statusMsg.left;
            indicators.right = statusMsg.right;
            indicators.battery = statusMsg.battery;
            indicators.fuel = statusMsg.fuel;
        });
    }, () => {
        // Attempt to reconnect on lost connection
        window.setTimeout(function() {
            this.connectWebSocket();
        }.bind(this), 2500);
    });
}

// START THE DISPLAY!
setup();

function debugMainLoop() {
    // Update needles from keyboard
    if (keyUpState) {
        mph += 1;
        rpm += 50;
        boost += 0.1875;
        coolant += 0.625;
        fuel += 0.00625;

        if (mph > MAX_MPH)
            mph = MAX_MPH;

        if (rpm > MAX_RPM)
            rpm = MAX_RPM;

        if (boost > MAX_BOOST)
            boost = MAX_BOOST;

        if (coolant > 270.0)
            coolant = 270.0;

        if (fuel > 1)
            fuel = 1;
    }

    if (keyDownState) {
        mph -= 1;
        rpm -= 50;
        boost -= 0.1875;
        coolant -= 0.625;
        fuel -= 0.00625;

        if (mph < 0)
            mph = 0;

        if (rpm < 0)
            rpm = 0;

        if (boost < 0)
            boost = 0;

        if (coolant < 0)
            coolant = 0;

        if (fuel < 0)
            fuel = 0;
    }
}

// Only operates in debug mode
if (DEBUG_MODE) {
    keyUp.press = () => {
        keyUpState = true;
    };

    keyUp.release = () => {
        keyUpState = false;
    };

    keyDown.press = () => {
        keyDownState = true;
    };

    keyDown.release = () => {
        keyDownState = false;
    };

    keyI.press = () => {
        keyIState = true;

        indicators = setAllIndicators(indicators, true);
    };

    keyI.release = () => {
        keyIState = false;

        indicators = setAllIndicators(indicators, false);
    };

    keyB.press = () => {
        keyBState = true;
    };

    keyB.release = () => {
        keyBState = false;
    };
}
import * as PIXI from "pixi.js"
import {Utils} from "./utils";
import rpmToAngle = Utils.rpmToAngle;
import mphToAngle = Utils.mphToAngle;
import temperatureToAngle = Utils.temperatureToAngle;
import pressureToAngle = Utils.pressureToAngle;
import formatOdometer = Utils.formatOdometer;
import currentTime = Utils.currentTime;
import setAllIndicators = Utils.setAllIndicators;
import {
    GraphicsContainer,
    IndicatorContainer,
    LogMessage,
    SpriteContainer,
    StatusMessage,
    StatusMessageBody,
    TextContainer,
    VehicleParameters
} from "./types";
import '@pixi/graphics-extras';
import boostToAngle = Utils.boostToAngle;
import fuelToAngle = Utils.fuelToAngle;
import degToRad = Utils.degToRad;
import formatVoltage = Utils.formatVoltage;
import SockJS from "sockjs-client";
import { Stomp } from '@stomp/stompjs';
import { animate, linear } from "popmotion"
import { startSimulation } from "./simulation";
import '../fonts/stylesheet.css';


// Constant definitions
export const SIMULATION = true;
export const MAX_RPM = 8000.0;
export const MAX_MPH = 160.0;
export const MAX_BOOST = 30.0;

// Tracking variables
let vehicle: VehicleParameters = {
    rpm: 0,
    mph: 0,
    coolant: 170,
    fuel: 0,
    boost: 0,
    voltage: 0,
    odometer: 0,
    tripOdometer: 0,
    boostLaggingMax: 0,
    reverse: false,
    temperature: 32,
    oilPressure: 0,
};

// Indicators
let indicators: IndicatorContainer = {};

// Pixi Application
let app: PIXI.Application;

// Sprite storage
let sprites: SpriteContainer = {};

// Text elements
let texts: TextContainer = {};

// Graphics
let graphics: GraphicsContainer = {};

// Backup camera
const video = document.querySelector("#videoElement");

// STOMP client
let stompClient: any;

// Clock value
let clock = "0:00 AM";

// XHTTP
const xhttp = new XMLHttpRequest();

let initState: number = 0;


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
    // if (navigator.mediaDevices.getUserMedia) {
    //     navigator.mediaDevices.getUserMedia({video: {width: 800, height: 600}})
    //         .then(function (stream) {
    //             // @ts-ignore
    //             video.srcObject = stream;
    //         })
    //         .catch(function () {
    //             console.log("Something went wrong binding the camera!");
    //         });
    // }

    // Turn on all indicators for startup sequence
    setAllIndicators(indicators, true);

    // Load resources and start animations
    PIXI.Loader.shared.add('img/spritesheet.json').load(() => {
        // Get reference to sprite sheet
        // @ts-ignore
        const sheet = PIXI.Loader.shared.resources['img/spritesheet.json'].spritesheet;

        sprites.centerLines = new PIXI.Sprite(sheet.textures['center_lines.png']);
        sprites.centerLines.anchor.set(0.5, 0.5);
        sprites.centerLines.position.set(640, 240);
        app.stage.addChild(sprites.centerLines);

        // @ts-ignore
        // sprites.backupCamera = new PIXI.Sprite(PIXI.Texture.from(video));
        // sprites.backupCamera.anchor.set(0.5, 0.5);
        // sprites.backupCamera.height = 323.5;
        // sprites.backupCamera.position.set(640, 231);
        // sprites.backupCamera.visible = false;
        // app.stage.addChild(sprites.backupCamera);

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
        graphics.leftGaugeBoostBlackout.drawTorus(249, 240, 78, 125, boostToAngle(vehicle.boost), degToRad(35))
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

        sprites.rightGaugeBg2 = new PIXI.Sprite(sheet.textures['right_gauge_bg_2.png']);
        sprites.rightGaugeBg2.anchor.set(0.5, 0.5);
        sprites.rightGaugeBg2.position.set(1031, 240);
        sprites.rightGaugeBg2.visible = false;
        app.stage.addChild(sprites.rightGaugeBg2);

        sprites.rightFuelHilite = new PIXI.Sprite(sheet.textures['green_hilite_leading.png']);
        sprites.rightFuelHilite.anchor.set(2.85, 0.5);
        sprites.rightFuelHilite.position.set(1031, 240);
        app.stage.addChild(sprites.rightFuelHilite);

        sprites.rightFuelHilite2 = new PIXI.Sprite(sheet.textures['red_hilite_leading.png']);
        sprites.rightFuelHilite2.anchor.set(2.85, 0.5);
        sprites.rightFuelHilite2.position.set(1031, 240);
        sprites.rightFuelHilite2.visible = false;
        app.stage.addChild(sprites.rightFuelHilite2);

        // Right gauge boost black overlay
        graphics.rightGaugeFuelBlackout = new PIXI.Graphics();
        graphics.rightGaugeFuelBlackout.beginFill(0x000000);
        graphics.rightGaugeFuelBlackout.drawTorus(1031, 240, 78, 125, fuelToAngle(vehicle.fuel), degToRad(35))
        graphics.rightGaugeFuelBlackout.endFill();
        app.stage.addChild(graphics.rightGaugeFuelBlackout);

        sprites.rightGaugeFg = new PIXI.Sprite(sheet.textures['right_gauge_fg.png']);
        sprites.rightGaugeFg.anchor.set(0.5, 0.5);
        sprites.rightGaugeFg.position.set(1031, 240);
        app.stage.addChild(sprites.rightGaugeFg);

        sprites.rpmNeedle = new PIXI.Sprite(sheet.textures['big_needle.png']);
        sprites.rpmNeedle.anchor.set(2.54, 0.5);
        sprites.rpmNeedle.position.set(249, 240);
        sprites.rpmNeedle.angle = rpmToAngle(vehicle.rpm);
        app.stage.addChild(sprites.rpmNeedle);

        sprites.mphNeedle = new PIXI.Sprite(sheet.textures['big_needle.png']);
        sprites.mphNeedle.anchor.set(2.54, 0.5);
        sprites.mphNeedle.position.set(1031, 240);
        sprites.mphNeedle.angle = mphToAngle(vehicle.mph);
        app.stage.addChild(sprites.mphNeedle);

        sprites.coolantNeedle = new PIXI.Sprite(sheet.textures['little_needle.png']);
        sprites.coolantNeedle.anchor.set(6.52, 0.5);
        sprites.coolantNeedle.position.set(249, 240);
        sprites.coolantNeedle.angle = temperatureToAngle(vehicle.coolant);
        app.stage.addChild(sprites.coolantNeedle);

        sprites.oilNeedle = new PIXI.Sprite(sheet.textures['little_needle.png']);
        sprites.oilNeedle.anchor.set(6.52, 0.5);
        sprites.oilNeedle.position.set(1031, 240);
        sprites.oilNeedle.angle = pressureToAngle(vehicle.oilPressure);
        app.stage.addChild(sprites.oilNeedle);

        sprites.centerLogo = new PIXI.Sprite(sheet.textures['center_logo.png']);
        sprites.centerLogo.anchor.set(0.5, 0.5);
        sprites.centerLogo.position.set(640, 240);
        sprites.centerLogo.alpha = 0;
        sprites.centerLogo.interactive = true;
        sprites.centerLogo.on('pointerdown', () => {
            location.href = "/status.html";
        });
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

        sprites.coolant = new PIXI.Sprite(sheet.textures['coolant.png']);
        sprites.coolant.anchor.set(0.5, 0.5);
        sprites.coolant.position.set(537, 362);
        sprites.coolant.alpha = 0;
        app.stage.addChild(sprites.coolant);

        sprites.resetTrip = new PIXI.Sprite(sheet.textures['reset.png']);
        sprites.resetTrip.anchor.set(0.5, 0.5);
        sprites.resetTrip.position.set(410, 423);
        sprites.resetTrip.alpha = 0.8;
        sprites.resetTrip.interactive = true;
        sprites.resetTrip.on('pointerdown', () => {
            xhttp.open("GET", "/interaction/resetTrip", true);
            xhttp.send();
        });
        app.stage.addChild(sprites.resetTrip);

        // Main gauge font
        PIXI.BitmapFont.from("LargeGauge", {
            fontFamily: "bladitwo4fitalic",
            fontStyle: "italic",
            align: "center",
            fontSize: 40,
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

        texts.rpm = new PIXI.BitmapText(Math.trunc(vehicle.rpm).toString(), {fontName: "LargeGauge"});
        texts.rpm.anchor.set(0.5, 0.5);
        texts.rpm.position.set(247, 235);
        app.stage.addChild(texts.rpm);

        texts.mph = new PIXI.BitmapText(Math.trunc(vehicle.mph).toString(), {fontName: "LargeGauge"});
        texts.mph.anchor.set(0.5, 0.5);
        texts.mph.position.set(1029, 235);
        app.stage.addChild(texts.mph);

        texts.boostLeft = new PIXI.BitmapText(Math.trunc(vehicle.boost).toString() + "psi", {fontName: "SmallGauge"});
        texts.boostLeft.anchor.set(0.5, 0.5);
        texts.boostLeft.position.set(247, 337);
        app.stage.addChild(texts.boostLeft);

        texts.tripOdometer = new PIXI.Text("Trip: " + formatOdometer(vehicle.tripOdometer) + " mi", {
            fontFamily: "Arial",
            align: "left",
            fontSize: 20,
            strokeThickness: 2,
            fill: "white"
        });
        texts.tripOdometer.anchor.set(0.0, 0.5);
        texts.tripOdometer.position.set(430, 423);
        texts.tripOdometer.alpha = 0.8;
        app.stage.addChild(texts.tripOdometer);

        texts.odometer = new PIXI.Text(formatOdometer(vehicle.odometer) + " mi", {
            fontFamily: "Arial",
            align: "right",
            fontSize: 20,
            strokeThickness: 2,
            fill: "white"
        });
        texts.odometer.anchor.set(1.0, 0.5);
        texts.odometer.position.set(875, 423);
        texts.odometer.alpha = 0.8;
        app.stage.addChild(texts.odometer);

        texts.temperature = new PIXI.Text("Inside: " + Math.round(vehicle.temperature) + "°", {
            fontFamily: "Arial",
            align: "center",
            fontSize: 20,
            strokeThickness: 2,
            fill: "white"
        });
        texts.temperature.anchor.set(0.0, 0.5);
        texts.temperature.position.set(400, 55);
        texts.temperature.alpha = 0.8;
        app.stage.addChild(texts.temperature);

        texts.clock = new PIXI.Text(currentTime(), {
            fontFamily: "Arial",
            align: "center",
            fontSize: 20,
            strokeThickness: 2,
            fill: "white"
        });
        texts.clock.anchor.set(1, 0.5);
        texts.clock.position.set(875, 55);
        texts.clock.alpha = 0.8;
        app.stage.addChild(texts.clock);

        texts.batteryVoltage = new PIXI.Text("0", {
            fontFamily: "Arial",
            align: "center",
            fontSize: 15,
            strokeThickness: 2,
            fill: "white"
        });
        texts.batteryVoltage.anchor.set(0.5, 0.5);
        texts.batteryVoltage.position.set(1031, 388.5);
        texts.batteryVoltage.alpha = 0.8;
        app.stage.addChild(texts.batteryVoltage);

        // Start animations
        app.start();
    });

    // Start initialization loop
    app.ticker.add(initLoop);
}

// Initialization Loop
function initLoop() {

    if (initState < 40) {
        vehicle.rpm += 200;
        vehicle.mph += 4;
        vehicle.coolant += 2.5;
        vehicle.fuel += 0.025;
        vehicle.boost += 0.75;
        vehicle.voltage += 0.375;
        vehicle.oilPressure += 2;

        sprites.leftIndicator.alpha += 0.025;
        sprites.rightIndicator.alpha += 0.025;
        sprites.lowBeam.alpha += 0.025;
        sprites.highBeam.alpha += 0.025;
        sprites.mil.alpha += 0.025;
        sprites.oil.alpha += 0.025;
        sprites.battery.alpha += 0.025;
        sprites.fuel.alpha += 0.025;
        sprites.coolant.alpha += 0.025;
    }
    if (initState >= 40) {
        vehicle.rpm -= 200;
        vehicle.mph -= 4;
        vehicle.coolant -= 2.5;
        vehicle.fuel -= 0.025;
        vehicle.boost -= 0.75;
        vehicle.voltage -= 0.375;
        vehicle.oilPressure -= 2;

        sprites.leftIndicator.alpha -= 0.025;
        sprites.rightIndicator.alpha -= 0.025;
        sprites.lowBeam.alpha -= 0.025;
        sprites.highBeam.alpha -= 0.025;
        sprites.mil.alpha -= 0.025;
        sprites.oil.alpha -= 0.025;
        sprites.battery.alpha -= 0.025;
        sprites.fuel.alpha -= 0.025;
        sprites.coolant.alpha -= 0.025;
    }

    if (initState < 80) {
        sprites.centerLogo.alpha += 0.01;
    }

    drawChangingElements();

    initState++;

    if (initState >= 80) {
        app.ticker.remove(initLoop);

        setAllIndicators(indicators, false);

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
            sprites.coolant.alpha = 1;
        }, 1);

        vehicle.boostLaggingMax = 0;

        // Create websocket
        if (!SIMULATION)
            connectWebSocket();
        else
            startSimulation(vehicle, indicators);

        // Start initialization loop
        app.ticker.add(mainLoop);
    }
}

// Main loop
function mainLoop() {
    drawChangingElements();
}

function drawChangingElements() {
    if (vehicle.fuel <= 0.25) {
        sprites.rightFuelHilite2.visible = true;
        sprites.rightGaugeBg2.visible = true;
        sprites.rightFuelHilite.visible = false;
        sprites.rightGaugeBg.visible = false;
    } else {
        sprites.rightFuelHilite.visible = true;
        sprites.rightGaugeBg.visible = true;
        sprites.rightFuelHilite2.visible = false;
        sprites.rightGaugeBg2.visible = false;
    }

    // Left gauge boost black overlay
    graphics.leftGaugeBoostBlackout.clear();
    graphics.leftGaugeBoostBlackout.beginFill(0x000000);
    graphics.leftGaugeBoostBlackout.drawTorus(249, 240, 78, 125, boostToAngle(vehicle.boost), degToRad(35))
    graphics.leftGaugeBoostBlackout.endFill();

    // Right gauge boost black overlay
    graphics.rightGaugeFuelBlackout.clear();
    graphics.rightGaugeFuelBlackout.beginFill(0x000000);
    graphics.rightGaugeFuelBlackout.drawTorus(1031, 240, 78, 125, fuelToAngle(vehicle.fuel), degToRad(35))
    graphics.rightGaugeFuelBlackout.endFill();

    sprites.rpmNeedle.angle = rpmToAngle(vehicle.rpm);
    sprites.mphNeedle.angle = mphToAngle(vehicle.mph);
    sprites.coolantNeedle.angle = temperatureToAngle(vehicle.coolant);
    sprites.oilNeedle.angle = pressureToAngle(vehicle.oilPressure);
    sprites.leftBoostHilite.rotation = boostToAngle(vehicle.boost) + degToRad(179);
    sprites.rightFuelHilite.rotation = fuelToAngle(vehicle.fuel) + degToRad(179);
    sprites.rightFuelHilite2.rotation = fuelToAngle(vehicle.fuel) + degToRad(179);

    if (vehicle.reverse) {
        sprites.centerLogo.visible = false;
        // sprites.backupCamera.visible = true;
    } else {
        sprites.centerLogo.visible = true;
        // sprites.backupCamera.visible = false;
    }

    if (vehicle.boost > vehicle.boostLaggingMax && initState >= 80) {
        vehicle.boostLaggingMax = vehicle.boost;

        sprites.leftBoostLaggingMax.visible = false;
    }

    if (vehicle.boost < vehicle.boostLaggingMax) {
        sprites.leftBoostLaggingMax.rotation = boostToAngle(vehicle.boostLaggingMax) + degToRad(179);

        if (!sprites.leftBoostLaggingMax.visible) {
            sprites.leftBoostLaggingMax.visible = true;

            sprites.leftBoostLaggingMax.alpha = 1;
        }

        sprites.leftBoostLaggingMax.alpha -= 0.01;

        if (sprites.leftBoostLaggingMax.alpha <= 0) {
            sprites.leftBoostLaggingMax.alpha = 0;

            vehicle.boostLaggingMax = 0;
        }
    }

    texts.rpm.text = Math.trunc(vehicle.rpm).toString();
    texts.mph.text = Math.trunc(vehicle.mph).toString();
    texts.boostLeft.text = Math.trunc(vehicle.boost).toString() + "psi";
    texts.batteryVoltage.text = formatVoltage(vehicle.voltage).toString();
    texts.tripOdometer.text = "Trip: " + formatOdometer(vehicle.tripOdometer) + " mi";
    texts.odometer.text = formatOdometer(vehicle.odometer) + " mi";
    texts.temperature.text = "Inside: " + Math.round(vehicle.temperature) + "°"

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

    sprites.lowBeam.visible = indicators.lowBeam || false;
    sprites.highBeam.visible = (indicators.highBeam && indicators.lowBeam) || false;
    sprites.mil.visible = indicators.mil || false;
    sprites.oil.visible = indicators.oil || false;
    sprites.battery.visible = vehicle.voltage < 12 || vehicle.voltage > 15;
    sprites.fuel.visible = vehicle.fuel <= 0.25;
    sprites.coolant.visible = indicators.coolant || false;

    if (currentTime() !== clock) {
        clock = currentTime();
        texts.clock.text = clock;
    }

    // Shift light
    if (vehicle.rpm >= 6500) {
        app.renderer.backgroundColor = 0xFF0000;
    } else {
        app.renderer.backgroundColor = 0x000000;
    }
}

// Maintains connection to web socket
function connectWebSocket(this: any) {
    const socket = new SockJS('/gs-guide-websocket');

    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect({}, (frame: string) => {
        console.log('Connected to: ' + frame);

        stompClient.subscribe('/topic/status', (message: StatusMessage) => {
            const statusMsg = JSON.parse(message.body + "");

            vehicle.rpm = statusMsg.rpm;
            vehicle.mph = statusMsg.mph;
            vehicle.coolant = statusMsg.coolant;
            vehicle.fuel = statusMsg.fuel;
            vehicle.boost = statusMsg.boost;
            vehicle.voltage = statusMsg.voltage;
            vehicle.odometer = statusMsg.odometer;
            vehicle.tripOdometer = statusMsg.tripOdometer;
            vehicle.reverse = statusMsg.reverse;
            vehicle.temperature = statusMsg.temperature;
            vehicle.oilPressure = statusMsg.oilPressure;

            indicators.mil = statusMsg.mil;
            indicators.oil = statusMsg.oilPressure < 10;
            indicators.lowBeam = statusMsg.lowBeam;
            indicators.highBeam = statusMsg.highBeam;
            indicators.left = statusMsg.left;
            indicators.right = statusMsg.right;
            indicators.coolant = statusMsg.coolant >= 257;
        });

        stompClient.subscribe('/topic/logs', (message: LogMessage) => {
            const logMessages = message.body;

            if (logMessages.length !== 0) {
                console.log(logMessages);
            }
        });
    }, () => {
        // Attempt to reconnect on lost connection
        window.setTimeout(function(this: any) {
            this.connectWebSocket();
        }.bind(this), 2500);
    });
}

// START THE DISPLAY!
setup();
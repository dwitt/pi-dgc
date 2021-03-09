System.register(["pixi.js", "./utils", "@pixi/graphics-extras", "sockjs-client", "@stomp/stompjs"], function (exports_1, context_1) {
    "use strict";
    var PIXI, utils_1, rpmToAngle, mphToAngle, temperatureToAngle, pressureToAngle, formatOdometer, currentTime, setAllIndicators, boostToAngle, fuelToAngle, degToRad, formatVoltage, sockjs_client_1, stompjs_1, SIMULATION, MAX_RPM, MAX_MPH, MAX_BOOST, rpm, mph, coolant, fuel, initState, boost, voltage, odometer, tripOdometer, boostLaggingMax, reverse, temperature, oilPressure, indicators, app, sprites, texts, graphics, video, stompClient, clock, xhttp;
    var __moduleName = context_1 && context_1.id;
    // App setup
    function setup() {
        var type = 'WebGL';
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
            navigator.mediaDevices.getUserMedia({ video: { width: 800, height: 600 } })
                .then(function (stream) {
                // @ts-ignore
                video.srcObject = stream;
            })
                .catch(function () {
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
        PIXI.Loader.shared.add('img/spritesheet.json').load(function () {
            // Get reference to sprite sheet
            // @ts-ignore
            var sheet = PIXI.Loader.shared.resources['img/spritesheet.json'].spritesheet;
            sprites.centerLines = new PIXI.Sprite(sheet.textures['center_lines.png']);
            sprites.centerLines.anchor.set(0.5, 0.5);
            sprites.centerLines.position.set(640, 240);
            app.stage.addChild(sprites.centerLines);
            // @ts-ignore
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
            // @ts-ignore
            graphics.leftGaugeBoostBlackout.drawTorus(249, 240, 78, 125, boostToAngle(boost), degToRad(35));
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
            // @ts-ignore
            graphics.rightGaugeFuelBlackout.drawTorus(1031, 240, 78, 125, fuelToAngle(fuel), degToRad(35));
            graphics.rightGaugeFuelBlackout.endFill();
            app.stage.addChild(graphics.rightGaugeFuelBlackout);
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
            sprites.oilNeedle = new PIXI.Sprite(sheet.textures['little_needle.png']);
            sprites.oilNeedle.anchor.set(6.52, 0.5);
            sprites.oilNeedle.position.set(1031, 240);
            sprites.oilNeedle.angle = pressureToAngle(oilPressure);
            app.stage.addChild(sprites.oilNeedle);
            sprites.centerLogo = new PIXI.Sprite(sheet.textures['center_logo.png']);
            sprites.centerLogo.anchor.set(0.5, 0.5);
            sprites.centerLogo.position.set(640, 240);
            sprites.centerLogo.alpha = 0;
            sprites.centerLogo.interactive = true;
            sprites.centerLogo.on('pointerdown', function () {
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
            sprites.resetTrip = new PIXI.Sprite(sheet.textures['reset.png']);
            sprites.resetTrip.anchor.set(0.5, 0.5);
            sprites.resetTrip.position.set(410, 423);
            sprites.resetTrip.alpha = 0.8;
            sprites.resetTrip.interactive = true;
            sprites.resetTrip.on('pointerdown', function () {
                xhttp.open("GET", "/interaction/resetTrip", true);
                xhttp.send();
            });
            app.stage.addChild(sprites.resetTrip);
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
            texts.rpm = new PIXI.BitmapText(Math.trunc(rpm).toString(), { fontName: "LargeGauge" });
            texts.rpm.anchor.set(0.5, 0.5);
            texts.rpm.position.set(247, 240);
            app.stage.addChild(texts.rpm);
            texts.mph = new PIXI.BitmapText(Math.trunc(mph).toString(), { fontName: "LargeGauge" });
            texts.mph.anchor.set(0.5, 0.5);
            texts.mph.position.set(1029, 240);
            app.stage.addChild(texts.mph);
            texts.boostLeft = new PIXI.BitmapText(Math.trunc(boost).toString() + "psi", { fontName: "SmallGauge" });
            texts.boostLeft.anchor.set(0.5, 0.5);
            texts.boostLeft.position.set(247, 337);
            app.stage.addChild(texts.boostLeft);
            texts.tripOdometer = new PIXI.Text("Trip: " + formatOdometer(tripOdometer) + " mi", {
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
            texts.odometer = new PIXI.Text(formatOdometer(odometer) + " mi", {
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
            texts.temperature = new PIXI.Text("Inside: " + Math.round(temperature) + "°", {
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
            texts.batteryVoltage = new PIXI.Text(voltage.toString(), {
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
            rpm += 200;
            mph += 4;
            coolant += 2.5;
            fuel += 0.025;
            boost += 0.75;
            voltage += 0.375;
            oilPressure += 2;
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
            voltage -= 0.375;
            oilPressure -= 2;
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
            if (!SIMULATION)
                connectWebSocket();
            // Start initialization loop
            app.ticker.add(mainLoop);
        }
    }
    // Main loop
    function mainLoop() {
        if (SIMULATION)
            simLoop();
        drawChangingElements();
    }
    function drawChangingElements() {
        if (fuel <= 0.25) {
            sprites.rightFuelHilite2.visible = true;
            sprites.rightGaugeBg2.visible = true;
            sprites.rightFuelHilite.visible = false;
            sprites.rightGaugeBg.visible = false;
        }
        else {
            sprites.rightFuelHilite.visible = true;
            sprites.rightGaugeBg.visible = true;
            sprites.rightFuelHilite2.visible = false;
            sprites.rightGaugeBg2.visible = false;
        }
        // Left gauge boost black overlay
        graphics.leftGaugeBoostBlackout.clear();
        graphics.leftGaugeBoostBlackout.beginFill(0x000000);
        // @ts-ignore
        graphics.leftGaugeBoostBlackout.drawTorus(249, 240, 78, 125, boostToAngle(boost), degToRad(35));
        graphics.leftGaugeBoostBlackout.endFill();
        // Right gauge boost black overlay
        graphics.rightGaugeFuelBlackout.clear();
        graphics.rightGaugeFuelBlackout.beginFill(0x000000);
        // @ts-ignore
        graphics.rightGaugeFuelBlackout.drawTorus(1031, 240, 78, 125, fuelToAngle(fuel), degToRad(35));
        graphics.rightGaugeFuelBlackout.endFill();
        sprites.rpmNeedle.angle = rpmToAngle(rpm);
        sprites.mphNeedle.angle = mphToAngle(mph);
        sprites.coolantNeedle.angle = temperatureToAngle(coolant);
        sprites.oilNeedle.angle = pressureToAngle(oilPressure);
        sprites.leftBoostHilite.rotation = boostToAngle(boost) + degToRad(179);
        sprites.rightFuelHilite.rotation = fuelToAngle(fuel) + degToRad(179);
        sprites.rightFuelHilite2.rotation = fuelToAngle(fuel) + degToRad(179);
        if (reverse) {
            sprites.centerLogo.visible = false;
            sprites.backupCamera.visible = true;
        }
        else {
            sprites.centerLogo.visible = true;
            sprites.backupCamera.visible = false;
        }
        if (boost > boostLaggingMax && initState >= 80) {
            boostLaggingMax = boost;
            sprites.leftBoostLaggingMax.visible = false;
        }
        if (boost < boostLaggingMax) {
            sprites.leftBoostLaggingMax.rotation = boostToAngle(boostLaggingMax) + degToRad(179);
            if (!sprites.leftBoostLaggingMax.visible) {
                sprites.leftBoostLaggingMax.visible = true;
                sprites.leftBoostLaggingMax.alpha = 1;
            }
            sprites.leftBoostLaggingMax.alpha -= 0.01;
            if (sprites.leftBoostLaggingMax.alpha <= 0) {
                sprites.leftBoostLaggingMax.alpha = 0;
                boostLaggingMax = 0;
            }
        }
        texts.rpm.text = Math.trunc(rpm).toString();
        texts.mph.text = Math.trunc(mph).toString();
        texts.boostLeft.text = Math.trunc(boost).toString() + "psi";
        texts.batteryVoltage.text = formatVoltage(voltage).toString();
        texts.tripOdometer.text = "Trip: " + formatOdometer(tripOdometer) + " mi";
        texts.odometer.text = formatOdometer(odometer) + " mi";
        texts.temperature.text = "Inside: " + Math.round(temperature) + "°";
        if (indicators.left) {
            if (initState < 80) {
                sprites.leftIndicator.visible = true;
            }
            else {
                sprites.leftIndicator.visible = new Date().getMilliseconds() < 500;
            }
        }
        else {
            sprites.leftIndicator.visible = false;
        }
        if (indicators.right) {
            if (initState < 80) {
                sprites.rightIndicator.visible = true;
            }
            else {
                sprites.rightIndicator.visible = new Date().getMilliseconds() < 500;
            }
        }
        else {
            sprites.rightIndicator.visible = false;
        }
        sprites.lowBeam.visible = indicators.lowBeam || false;
        sprites.highBeam.visible = (indicators.highBeam && indicators.lowBeam) || false;
        sprites.mil.visible = indicators.mil || false;
        sprites.oil.visible = indicators.oil || false;
        sprites.battery.visible = voltage < 12 || voltage > 15;
        sprites.fuel.visible = fuel <= 0.25;
        if (currentTime() !== clock) {
            clock = currentTime();
            texts.clock.text = clock;
        }
        // Shift light
        if (rpm >= 6500) {
            app.renderer.backgroundColor = 0xFF0000;
        }
        else {
            app.renderer.backgroundColor = 0x000000;
        }
    }
    // Maintains connection to web socket
    function connectWebSocket() {
        var _this = this;
        var socket = new sockjs_client_1.default('/gs-guide-websocket');
        stompClient = stompjs_1.Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected to: ' + frame);
            stompClient.subscribe('/topic/status', function (message) {
                var statusMsg = message.body;
                rpm = statusMsg.rpm;
                coolant = statusMsg.coolant;
                boost = statusMsg.boost;
                mph = statusMsg.mph;
                fuel = statusMsg.fuel;
                voltage = statusMsg.voltage;
                odometer = statusMsg.odometer;
                temperature = statusMsg.temperature;
                tripOdometer = statusMsg.tripOdometer;
                reverse = statusMsg.reverse;
                oilPressure = statusMsg.oilPressure;
                indicators.mil = statusMsg.mil;
                indicators.oil = statusMsg.oilPressure < 10;
                indicators.lowBeam = statusMsg.lowBeam;
                indicators.highBeam = statusMsg.highBeam;
                indicators.left = statusMsg.left;
                indicators.right = statusMsg.right;
            });
            stompClient.subscribe('/topic/logs', function (message) {
                var logMessages = message.body;
                if (logMessages.length !== 0) {
                    console.log(logMessages);
                }
            });
        }, function () {
            // Attempt to reconnect on lost connection
            window.setTimeout(function () {
                this.connectWebSocket();
            }.bind(_this), 2500);
        });
    }
    function simLoop() {
    }
    return {
        setters: [
            function (PIXI_1) {
                PIXI = PIXI_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (_1) {
            },
            function (sockjs_client_1_1) {
                sockjs_client_1 = sockjs_client_1_1;
            },
            function (stompjs_1_1) {
                stompjs_1 = stompjs_1_1;
            }
        ],
        execute: function () {
            rpmToAngle = utils_1.Utils.rpmToAngle;
            mphToAngle = utils_1.Utils.mphToAngle;
            temperatureToAngle = utils_1.Utils.temperatureToAngle;
            pressureToAngle = utils_1.Utils.pressureToAngle;
            formatOdometer = utils_1.Utils.formatOdometer;
            currentTime = utils_1.Utils.currentTime;
            setAllIndicators = utils_1.Utils.setAllIndicators;
            boostToAngle = utils_1.Utils.boostToAngle;
            fuelToAngle = utils_1.Utils.fuelToAngle;
            degToRad = utils_1.Utils.degToRad;
            formatVoltage = utils_1.Utils.formatVoltage;
            // Constant definitions
            exports_1("SIMULATION", SIMULATION = true);
            exports_1("MAX_RPM", MAX_RPM = 8000.0);
            exports_1("MAX_MPH", MAX_MPH = 160.0);
            exports_1("MAX_BOOST", MAX_BOOST = 30.0);
            // Tracking variables
            rpm = 0;
            mph = 0.0;
            coolant = 170;
            fuel = 0.0;
            initState = 0;
            boost = 0;
            voltage = 0.0;
            odometer = 0.0;
            tripOdometer = 0.0;
            boostLaggingMax = 0;
            reverse = false;
            temperature = 32;
            oilPressure = 0.0;
            // Backup camera
            video = document.querySelector("#videoElement");
            // Clock value
            clock = "0:00 AM";
            // XHTTP
            xhttp = new XMLHttpRequest();
            // START THE DISPLAY!
            setup();
        }
    };
});

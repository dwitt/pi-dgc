System.register(["./main"], function (exports_1, context_1) {
    "use strict";
    var main_1, Utils;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (main_1_1) {
                main_1 = main_1_1;
            }
        ],
        execute: function () {
            (function (Utils) {
                // Converts a RPM value (0-8000) from the engine into an angle value for displaying the needle
                function rpmToAngle(rpm) {
                    // Limit to usable range
                    rpm = Math.min(Math.max(rpm, 0.0), main_1.MAX_RPM);
                    var trueAngle = (rpm / main_1.MAX_RPM) * 270.0;
                    return trueAngle - 45.0;
                }
                Utils.rpmToAngle = rpmToAngle;
                // Converts a MPH value (0-160) from the GPS into an angle value for displaying the needle
                function mphToAngle(mph) {
                    // Limit to usable range
                    mph = Math.min(Math.max(mph, 0.0), main_1.MAX_MPH);
                    var trueAngle = (mph / main_1.MAX_MPH) * 270.0;
                    return trueAngle - 45.0;
                }
                Utils.mphToAngle = mphToAngle;
                // Converts a Coolant temperature value (0-270) from the engine into an angle value for displaying the needle
                function temperatureToAngle(temp) {
                    // Limit to usable range
                    temp = Math.min(Math.max(temp, 170.0), 270.0);
                    var trueAngle = ((270.0 - temp) / 100.0) * 50.0;
                    return trueAngle - 115.0;
                }
                Utils.temperatureToAngle = temperatureToAngle;
                // Converts a fuel level value (0-1) from the sender into an angle value for displaying the needle
                function fuelToAngle(fuel) {
                    fuel = Math.min(Math.max(fuel, 0.0), 1.0);
                    var trueAngle = fuel * 247.0;
                    return degToRad(trueAngle + 145.5);
                }
                Utils.fuelToAngle = fuelToAngle;
                // Converts an oil pressure value (10-90) into an angle value for displaying the needle
                function pressureToAngle(pressure) {
                    var range = 80.0;
                    pressure = Math.min(Math.max(pressure, 10.0), 90.0) - 10.0;
                    pressure = pressure / range;
                    var trueAngle = (1.0 - pressure) * 50.0;
                    return trueAngle - 115.0;
                }
                Utils.pressureToAngle = pressureToAngle;
                function degToRad(degrees) {
                    return degrees * (Math.PI / 180.0);
                }
                Utils.degToRad = degToRad;
                function boostToAngle(boost) {
                    boost = Math.min(Math.max(boost, 0.0), main_1.MAX_BOOST);
                    var trueAngle = (boost / main_1.MAX_BOOST) * 247.0;
                    return degToRad(trueAngle + 145.5);
                }
                Utils.boostToAngle = boostToAngle;
                function currentTime() {
                    var date = new Date();
                    var hours = date.getHours();
                    var half = (hours >= 1 && hours <= 11) ? "AM" : "PM";
                    hours = (hours >= 1 && hours <= 11) ? hours : ((hours === 0 || hours === 12) ? 12 : hours - 12);
                    var minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
                    return hours + ":" + minutes + " " + half;
                }
                Utils.currentTime = currentTime;
                function setAllIndicators(indicators, targetState) {
                    var targetIndicators = {};
                    for (var _i = 0, _a = Object.entries(indicators); _i < _a.length; _i++) {
                        var _b = _a[_i], key = _b[0], _ = _b[1];
                        targetIndicators[key] = targetState;
                    }
                    return targetIndicators;
                }
                Utils.setAllIndicators = setAllIndicators;
                function formatVoltage(voltage) {
                    return Number(Math.round(Number(voltage + 'e' + 1)) + 'e-' + 1);
                }
                Utils.formatVoltage = formatVoltage;
                function formatOdometer(odometer) {
                    var rounded = Number(Math.round(Number(odometer + 'e' + 1)) + 'e-' + 1).toString();
                    // Add trailing 0 if not present
                    if (!rounded.includes(".")) {
                        rounded = rounded + ".0";
                    }
                    return rounded;
                }
                Utils.formatOdometer = formatOdometer;
            })(Utils || (Utils = {}));
            exports_1("Utils", Utils);
        }
    };
});

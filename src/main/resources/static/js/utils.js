// Converts a RPM value (0-8000) from the engine into an angle value for displaying the needle
function rpmToAngle(rpm) {
    // Limit to usable range
    rpm = Math.min(Math.max(parseInt(rpm), 0), MAX_RPM);

    let trueAngle = (rpm / MAX_RPM) * 270.0;

    return trueAngle - 45.0;
}

// Converts a MPH value (0-160) from the GPS into an angle value for displaying the needle
function mphToAngle(mph) {
    // Limit to usable range
    mph = Math.min(Math.max(parseInt(mph), 0), MAX_MPH);

    let trueAngle = (mph / MAX_MPH) * 270.0;

    return trueAngle - 45.0;
}

// Converts a Coolant temperature value (0-270) from the engine into an angle value for displaying the needle
function temperatureToAngle(temp) {
    // Limit to usable range
    temp = Math.min(Math.max(parseInt(temp), 170), 270);

    let trueAngle = ((270.0 - temp) / 100.0) * 50.0;

    return trueAngle - 115.0;
}

// Converts a fuel level value (0-1) from the sender into an angle value for displaying the needle
function fuelToAngle(level) {
    // Limit to usable range
    level = Math.min(Math.max(level, 0), 1);

    let trueAngle = (1.0 - level) * 50.0;

    return trueAngle - 115.0;
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180.0);
}

function boostToAngle(boost) {
    boost = Math.min(Math.max(boost, 0), MAX_BOOST);

    let trueAngle = (boost / MAX_BOOST) * 247.0;

    return degToRad(trueAngle + 145.5);
}

function currentTime() {
    const date = new Date();
    let hours = date.getHours();
    const half = (hours >= 1 && hours <= 11) ? "AM" : "PM";
    hours = (hours >= 1 && hours <= 11) ? hours : ((hours === 0) ? 12 : hours - 12);
    const minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();

    return hours + ":" + minutes + " " + half;
}

function setAllIndicators(indicators, targetState) {
    let targetIndicators = {};

    for(let key of Object.keys(indicators)) {
        targetIndicators[key] = targetState;
    }

    return targetIndicators;
}
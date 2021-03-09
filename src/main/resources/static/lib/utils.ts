import {MAX_BOOST, MAX_MPH, MAX_RPM} from "./index";
import {IndicatorContainer} from "./types";


export module Utils {
    // Converts a RPM value (0-8000) from the engine into an angle value for displaying the needle
    export function rpmToAngle(rpm: number) {
        // Limit to usable range
        rpm = Math.min(Math.max(rpm, 0.0), MAX_RPM);

        let trueAngle = (rpm / MAX_RPM) * 270.0;

        return trueAngle - 45.0;
    }

    // Converts a MPH value (0-160) from the GPS into an angle value for displaying the needle
    export function mphToAngle(mph: number) {
        // Limit to usable range
        mph = Math.min(Math.max(mph, 0.0), MAX_MPH);

        let trueAngle = (mph / MAX_MPH) * 270.0;

        return trueAngle - 45.0;
    }

    // Converts a Coolant temperature value (0-270) from the engine into an angle value for displaying the needle
    export function temperatureToAngle(temp: number) {
        // Limit to usable range
        temp = Math.min(Math.max(temp, 170.0), 270.0);

        let trueAngle = ((270.0 - temp) / 100.0) * 50.0;

        return trueAngle - 115.0;
    }

    // Converts a fuel level value (0-1) from the sender into an angle value for displaying the needle
    export function fuelToAngle(fuel: number) {
        fuel = Math.min(Math.max(fuel, 0.0), 1.0);

        let trueAngle = fuel * 247.0;

        return degToRad(trueAngle + 145.5);
    }

    // Converts an oil pressure value (10-90) into an angle value for displaying the needle
    export function pressureToAngle(pressure: number) {
        const range = 80.0;
        pressure = Math.min(Math.max(pressure, 10.0), 90.0) - 10.0;
        pressure = pressure / range;

        let trueAngle = (1.0 - pressure) * 50.0;

        return trueAngle - 115.0;
    }

    export function degToRad(degrees: number) {
        return degrees * (Math.PI / 180.0);
    }

    export function boostToAngle(boost: number) {
        boost = Math.min(Math.max(boost, 0.0), MAX_BOOST);

        let trueAngle = (boost / MAX_BOOST) * 247.0;

        return degToRad(trueAngle + 145.5);
    }

    export function currentTime() {
        const date = new Date();
        let hours = date.getHours();
        const half = (hours >= 1 && hours <= 11) ? "AM" : "PM";
        hours = (hours >= 1 && hours <= 11) ? hours : ((hours === 0 || hours === 12) ? 12 : hours - 12);
        const minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();

        return hours + ":" + minutes + " " + half;
    }

    export function setAllIndicators(indicators: IndicatorContainer, targetState: boolean): IndicatorContainer {
        return {
            left: targetState,
            right: targetState,
            lowBeam: targetState,
            highBeam: targetState,
            mil: targetState,
            oil: targetState,
            battery: targetState,
            fuel: targetState,
        };
    }

    export function formatVoltage(voltage: number) {
        return Number(Math.round(Number(voltage + 'e' + 1))+'e-'+1);
    }

    export function formatOdometer(odometer: number) {
        let rounded: string = Number(Math.round(Number(odometer + 'e' + 1))+'e-'+1).toString();

        // Add trailing 0 if not present
        if (!rounded.includes(".")) {
            rounded = rounded + ".0";
        }

        return rounded;
    }
}
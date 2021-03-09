import { animate, linear } from "popmotion";
import { IndicatorContainer, VehicleParameters } from "./types";

export function startSimulation(vehicle: VehicleParameters, indicators: IndicatorContainer) {
    vehicle.tripOdometer = 123.4;
    vehicle.odometer = 56789.1;
    vehicle.temperature = 72.3;

    // RPM
    animate({
        from: 0,
        to: 6499,
        repeat: Infinity,
        repeatType: "mirror",
        duration: 5000,
        ease: linear,
        onUpdate: latest => {
            vehicle.rpm = latest;
        }
    })

    // MPH
    animate({
        from: 0,
        to: 160,
        repeat: Infinity,
        repeatType: "mirror",
        duration: 4500,
        ease: linear,
        onUpdate: latest => {
            vehicle.mph = latest;
        }
    })

    // Boost
    animate({
        from: 0,
        to: 30,
        repeat: Infinity,
        repeatType: "mirror",
        duration: 5500,
        ease: linear,
        onUpdate: latest => {
            vehicle.boost = latest;
        }
    })

    // Fuel
    animate({
        from: 0,
        to: 1,
        repeat: Infinity,
        repeatType: "mirror",
        duration: 5000,
        ease: linear,
        onUpdate: latest => {
            vehicle.fuel = latest;
        }
    })

    // Battery
    animate({
        from: 10,
        to: 15.5,
        repeat: Infinity,
        repeatType: "mirror",
        duration: 7000,
        ease: linear,
        onUpdate: latest => {
            vehicle.voltage = latest;
        }
    })

    // Coolant
    animate({
        from: 170,
        to: 270,
        repeat: Infinity,
        repeatType: "mirror",
        duration: 4000,
        ease: linear,
        onUpdate: latest => {
            vehicle.coolant = latest;

            indicators.coolant = vehicle.coolant >= 257;
        }
    })

    // Oil
    animate({
        from: 0,
        to: 100,
        repeat: Infinity,
        repeatType: "mirror",
        duration: 5000,
        ease: linear,
        onUpdate: latest => {
            vehicle.oilPressure = latest

            indicators.oil = vehicle.oilPressure < 10;
        }
    })
}
package sh.ellis.pidgc.config

import org.ini4j.Wini
import sh.ellis.pidgc.state.State
import java.io.File

object Config {
    private val ini = Wini(File("./config.ini"))

    var batteryCorrection: Double = 1.49
    var batteryMin: Double = 12.0
    var batteryMax: Double = 15.0
    var currentOdometer: Double = 0.0
    var currentTripOdometer: Double = 0.0
    var speedodometerSmoothing: Int = 10
    var vssPulsesPerMile: Int = 8000

    init {
        vssPulsesPerMile = ini.get("vss", "pulses_per_mile", Int::class.javaPrimitiveType)
        batteryMin = ini.get("battery", "min_voltage", Double::class.javaPrimitiveType)
        batteryMax = ini.get("battery", "max_voltage", Double::class.javaPrimitiveType)
        batteryCorrection = ini.get("battery", "correction", Double::class.javaPrimitiveType)
        speedodometerSmoothing = ini.get("speedometer", "smoothing", Int::class.javaPrimitiveType)

        // Initialize odometer values
        State.odometer = ini.get("odometer", "current", Double::class.javaPrimitiveType)
        currentOdometer = State.odometer
        State.tripOdometer = ini.get("odometer", "trip", Double::class.javaPrimitiveType)
        currentTripOdometer = State.tripOdometer
    }

    fun writeOdometer(odometer: Double, tripOdometer: Double) {
        // Only write if needed

        if (odometer != currentOdometer) {
            ini.put("odometer", "current", odometer)
            ini.store()
            currentOdometer = odometer
        }

        if (tripOdometer != currentTripOdometer) {
            ini.put("odometer", "trip", tripOdometer)
            ini.store()
            currentTripOdometer = tripOdometer
        }
    }
}
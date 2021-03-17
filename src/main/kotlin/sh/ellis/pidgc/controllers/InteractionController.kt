package sh.ellis.pidgc.controllers

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import sh.ellis.pidgc.serial.Serial
import sh.ellis.pidgc.state.State

@RestController
@RequestMapping("/interaction")
class InteractionController {

    @GetMapping("/resetTrip")
    fun resetTrip() {
        State.tripOdometer = 0.0
        Serial.writeOdometers(State.tripOdometer, State.odometer)
    }

    @GetMapping("/zeroPulseCounter")
    fun zeroPulseCounter() {
        State.totalPulses = 0
    }

    @GetMapping("/saveVssPpm")
    fun saveVssPpm(
        @RequestParam ppm: Int
    ) {
        Serial.writePpm(ppm)
    }
}
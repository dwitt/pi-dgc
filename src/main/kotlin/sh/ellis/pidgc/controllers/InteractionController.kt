package sh.ellis.pidgc.controllers

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import sh.ellis.pidgc.config.Config
import sh.ellis.pidgc.state.State

@RestController
@RequestMapping("/interaction")
class InteractionController {

    @GetMapping("/resetTrip")
    fun resetTrip() {
        State.tripOdometer = 0.0
        Config.writeOdometer(State.odometer, State.tripOdometer)
    }
}
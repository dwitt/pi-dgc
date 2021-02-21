package sh.ellis.pidgc.websocket

import mu.KotlinLogging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import sh.ellis.pidgc.model.StatusMessage
import sh.ellis.pidgc.state.State

@Component
class Websocket {

    private val logger = KotlinLogging.logger {}

    @Autowired
    private val template: SimpMessagingTemplate? = null

    @Scheduled(fixedRate = 25)
    fun sendStatus() {
        template?.convertAndSend("/topic/status",
            StatusMessage(
                mph = State.mph.getAverage(),
                rpm = State.rpm,
                boost = State.boost,
                coolant = State.coolant,
                fuel = State.fuel,
                mil = State.mil,
                oil = State.oil,
                lowBeam = State.lowBeam,
                highBeam = State.highBeam,
                left = State.left,
                right = State.right,
                reverse = State.reverse,
                voltage = State.battery,
                odometer = State.odometer,
                tripOdometer = State.tripOdometer
            ))
    }

    @Scheduled(fixedRate = 1000)
    fun sendLogs() {
        template?.convertAndSend("/topic/logs", State.getLogMessages())
    }
}
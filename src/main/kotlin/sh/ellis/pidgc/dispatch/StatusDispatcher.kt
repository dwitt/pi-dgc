package sh.ellis.pidgc.dispatch

import mu.KotlinLogging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import sh.ellis.pidgc.model.Message
import sh.ellis.pidgc.state.State

@Component
class StatusDispatcher {

    private val logger = KotlinLogging.logger {}

    @Autowired
    private val template: SimpMessagingTemplate? = null

    @Scheduled(fixedRate = 25)
    fun dispatchStatus() {
        template?.convertAndSend("/topic/status",
            Message(
                mph = State.mph,
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
                battery = State.battery
            ))
    }

}
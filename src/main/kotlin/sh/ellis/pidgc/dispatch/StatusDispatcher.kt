package sh.ellis.pidgc.dispatch

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import sh.ellis.pidgc.model.Message
import kotlin.random.Random
import mu.KotlinLogging

@Component
class StatusDispatcher {

    @Autowired
    private val template: SimpMessagingTemplate? = null

    @Scheduled(fixedRate = 50)
    fun dispatchStatus() {
        template?.convertAndSend("/topic/status",
            Message(
                rpm = Random.nextInt(4000, 4100)
            ))
    }

}
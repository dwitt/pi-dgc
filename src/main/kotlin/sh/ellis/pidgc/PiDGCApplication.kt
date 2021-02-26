package sh.ellis.pidgc

import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.scheduling.annotation.EnableScheduling
import sh.ellis.pidgc.canbus.CanbusManager
import sh.ellis.pidgc.config.Config
import sh.ellis.pidgc.controllers.InteractionController
import sh.ellis.pidgc.serial.Serial
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener
import sh.ellis.pidgc.utils.isWindows
import sh.ellis.pidgc.websocket.Websocket
import kotlin.concurrent.thread


@EnableScheduling
@SpringBootApplication
class PiDGCApplication {

    // Start main threads once Spring is loaded
    @PostConstruct
    fun init() {
        Config

        if (!isWindows()) {
            Thread(CanbusManager()).start()
            Thread(Serial).start()
        }
    }
}

fun main(args: Array<String>) {
    runApplication<PiDGCApplication>(*args)
}

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
import kotlin.concurrent.thread


@Configuration
@EnableAutoConfiguration
@EnableScheduling
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

    @PreDestroy
    fun shutdown() {
    }

    // Open Chromium once everything is done
    @EventListener(ApplicationReadyEvent::class)
    fun started() {
        if (!isWindows()) {
            // Start Chromium
            thread(true) {
                try {
//                    ProcessBuilder("bash", "-c", "sudo -u pi chromium-browser 'http://localhost:8080'").start()
                } catch (e: Exception) {
                }
            }
        }
    }

}

fun main(args: Array<String>) {
    runApplication<PiDGCApplication>(*args)
}

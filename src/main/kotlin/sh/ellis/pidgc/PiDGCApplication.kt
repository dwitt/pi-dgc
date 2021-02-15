package sh.ellis.pidgc

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling
import sh.ellis.pidgc.can.CanManager
import sh.ellis.pidgc.gpio.GpioManager
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy

@SpringBootApplication
@EnableScheduling
class PiDGCApplication {

    // Start main threads once Spring is loaded
    @PostConstruct
    fun init() {
        Thread(CanManager()).start()

        GpioManager.init()
    }

    @PreDestroy
    fun shutdown() {
        GpioManager.shutdown()
    }

}

fun main(args: Array<String>) {
    runApplication<PiDGCApplication>(*args)
}

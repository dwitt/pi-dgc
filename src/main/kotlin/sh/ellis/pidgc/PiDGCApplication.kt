package sh.ellis.pidgc

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling
import sh.ellis.pidgc.canbus.CanbusManager
import sh.ellis.pidgc.config.Config
import sh.ellis.pidgc.serial.Serial
import sh.ellis.pidgc.utils.isWindows
import javax.annotation.PostConstruct


@EnableScheduling
@SpringBootApplication
class PiDGCApplication {

    // Start main threads once Spring is loaded
    @PostConstruct
    fun init() {
        Config

        Thread(Serial).start()

        if (!isWindows()) {
            Thread(CanbusManager()).start()
        }
    }
}

fun main(args: Array<String>) {
    runApplication<PiDGCApplication>(*args)
}

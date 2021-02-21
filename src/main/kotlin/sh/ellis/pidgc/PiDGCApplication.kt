package sh.ellis.pidgc

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling
import sh.ellis.pidgc.canbus.CanbusManager
import sh.ellis.pidgc.config.Config
import sh.ellis.pidgc.serial.Serial
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy

@SpringBootApplication
@EnableScheduling
class PiDGCApplication {

    // Start main threads once Spring is loaded
    @PostConstruct
    fun init() {
        Config
//        Thread(CanbusManager()).start()
        Thread(Serial).start()
    }

    @PreDestroy
    fun shutdown() {
    }

}

fun main(args: Array<String>) {
    runApplication<PiDGCApplication>(*args)
}

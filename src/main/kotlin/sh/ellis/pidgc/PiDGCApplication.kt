package sh.ellis.pidgc

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import sh.ellis.pidgc.can.CanManager
import javax.annotation.PostConstruct

@SpringBootApplication
class PiDGCApplication {

    @PostConstruct
    fun init() {
       Thread(CanManager()).start()
    }

}

fun main(args: Array<String>) {
    runApplication<PiDGCApplication>(*args)
}

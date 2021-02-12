package sh.ellis.pidgc

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PiDGCApplication

fun main(args: Array<String>) {
    runApplication<PiDGCApplication>(*args)
}

package sh.ellis.pidgc.gpio

import com.pi4j.io.gpio.*
import mu.KotlinLogging
import com.pi4j.io.gpio.event.GpioPinDigitalStateChangeEvent
import com.pi4j.io.gpio.event.GpioPinListenerDigital


// Manages all interaction with GPIO
object GpioManager: GpioPinListenerDigital {

    private val logger = KotlinLogging.logger {}
    private var gpio = GpioFactory.getInstance()

    fun init() {
        // Configure pin states
        val mphPin = gpio.provisionDigitalInputPin(RaspiPin.GPIO_20)
        val lowBeam = gpio.provisionDigitalInputPin(RaspiPin.GPIO_21)
        val highBeam = gpio.provisionDigitalInputPin(RaspiPin.GPIO_22)
        val left = gpio.provisionDigitalInputPin(RaspiPin.GPIO_23)
        val right = gpio.provisionDigitalInputPin(RaspiPin.GPIO_24)
        val battery = gpio.provisionDigitalInputPin(RaspiPin.GPIO_25)

        // Register listeners
        mphPin.addListener(this)
        lowBeam.addListener(this)
        highBeam.addListener(this)
        left.addListener(this)
        right.addListener(this)
        battery.addListener(this)
    }

    fun shutdown() {
        gpio.shutdown()
    }

    override fun handleGpioPinDigitalStateChangeEvent(event: GpioPinDigitalStateChangeEvent?) {
        when (event?.pin) {

            // MPH from vehicle speed sensor
            RaspiPin.GPIO_20 -> {

            }
        }
    }
}
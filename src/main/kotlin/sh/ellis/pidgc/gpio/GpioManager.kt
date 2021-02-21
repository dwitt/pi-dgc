//package sh.ellis.pidgc.gpio
//
//import com.pi4j.io.gpio.*
//import mu.KotlinLogging
//import com.pi4j.io.gpio.event.GpioPinDigitalStateChangeEvent
//import com.pi4j.io.gpio.event.GpioPinListenerDigital
//import sh.ellis.pidgc.state.State
//import com.pi4j.io.i2c.I2CBus
//import com.pi4j.gpio.extension.ads.ADS1115Pin
//import com.pi4j.gpio.extension.ads.ADS1115GpioProvider
//import com.pi4j.gpio.extension.ads.ADS1x15GpioProvider
//import sh.ellis.pidgc.config.Config
//import sh.ellis.pidgc.utils.SynchronizedLimitedStack
//import java.time.Instant
//import java.time.temporal.ChronoUnit
//import kotlin.math.roundToInt
//
//
//// Manages all interaction with GPIO
//object GpioManager: GpioPinListenerDigital, Runnable {
//
//    private val logger = KotlinLogging.logger {}
//    private val gpio = GpioFactory.getInstance()
//    private val adsProvider = ADS1115GpioProvider(I2CBus.BUS_1, ADS1115GpioProvider.ADS1115_ADDRESS_0x48)
//
//    private val MICROS_PER_HOUR: Long = 3600000000
//    private val FUEL_PIN = ADS1115Pin.INPUT_A0
//    private val BATT_PIN = ADS1115Pin.INPUT_A1
//
//    private val vssSignals = SynchronizedLimitedStack<Instant>(2)
//
//    fun init() {
//        // Configure digital pin states
//        val mphPin = gpio.provisionDigitalInputPin(RaspiPin.GPIO_21)
//        val lowBeam = gpio.provisionDigitalInputPin(RaspiPin.GPIO_22)
//        val highBeam = gpio.provisionDigitalInputPin(RaspiPin.GPIO_23)
//        val left = gpio.provisionDigitalInputPin(RaspiPin.GPIO_24)
//        val right = gpio.provisionDigitalInputPin(RaspiPin.GPIO_25)
//
//        // Register digital listeners
//        mphPin.addListener(this)
//        lowBeam.addListener(this)
//        highBeam.addListener(this)
//        left.addListener(this)
//        right.addListener(this)
//
//        // Provision gpio analog input pins from ADS1115
//        gpio.provisionAnalogInputPin(adsProvider, FUEL_PIN)
//        gpio.provisionAnalogInputPin(adsProvider, BATT_PIN)
//
//        // Set PGA value PGA_4_096V to a 1:1 scaled input for all pins
//        adsProvider.setProgrammableGainAmplifier(
//            ADS1x15GpioProvider.ProgrammableGainAmplifierValue.PGA_4_096V,
//            ADS1115Pin.INPUT_A0, ADS1115Pin.INPUT_A1, ADS1115Pin.INPUT_A2, ADS1115Pin.INPUT_A3)
//
//        // Start monitoring analog values
//        Thread(this).start()
//    }
//
//    override fun handleGpioPinDigitalStateChangeEvent(event: GpioPinDigitalStateChangeEvent?) {
//        when (event?.pin) {
//
//            // MPH from vehicle speed sensor
//            RaspiPin.GPIO_21 -> {
//                if (event?.state == PinState.HIGH) {
//                    vssSignals.add(Instant.now())
//                }
//            }
//
//            // Low beam from headlight switch
//            RaspiPin.GPIO_22 -> State.lowBeam = event?.state == PinState.HIGH
//
//            // High beam from headlight switch
//            RaspiPin.GPIO_23 -> State.highBeam = event?.state == PinState.HIGH
//
//            // Left indicator from stalk switch
//            RaspiPin.GPIO_24 -> State.left = event?.state == PinState.HIGH
//
//            // Right indicator from stalk switch
//            RaspiPin.GPIO_25 -> State.right = event?.state == PinState.HIGH
//        }
//    }
//
//    override fun run() {
//        // Loop forever
//        while (true) {
//            val fuelLevel = adsProvider.getImmediateValue(FUEL_PIN)
//            State.fuel = fuelLevel
//
//            val battVoltage = adsProvider.getImmediateValue(BATT_PIN)
//            State.battery = battVoltage < 12 || battVoltage >= 14
//
//            // Calculate MPH from stored signal times
//            val currentTime = Instant.now()
//            val list = vssSignals.getAll()
//
//            if (list.size < 2 || ChronoUnit.MILLIS.between(currentTime, list[1]) >= 1000) {
//                State.mph = 0
//            } else {
//                val oneMphInMicros = MICROS_PER_HOUR / Config.vssPulsesPerMile
//                val microsBetweenLastTwoPulses = ChronoUnit.MICROS.between(list[1], list[0])
//                val calculatedMph = oneMphInMicros.toDouble() / microsBetweenLastTwoPulses.toDouble()
//
//                // Save rounded MPH
//                State.mph = calculatedMph.roundToInt()
//            }
//
//            // Sleep for a bit
//            Thread.sleep(100)
//        }
//    }
//
//    fun shutdown() {
//        gpio.shutdown()
//    }
//}
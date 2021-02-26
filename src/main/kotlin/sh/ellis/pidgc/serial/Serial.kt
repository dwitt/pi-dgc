package sh.ellis.pidgc.serial

import com.fazecast.jSerialComm.SerialPort
import mu.KotlinLogging
import com.fazecast.jSerialComm.SerialPortEvent

import com.fazecast.jSerialComm.SerialPortMessageListener
import org.springframework.ui.context.Theme
import sh.ellis.pidgc.config.Config
import sh.ellis.pidgc.state.State
import sh.ellis.pidgc.utils.isWindows
import sh.ellis.pidgc.utils.shutdownSystem
import java.lang.Exception
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.math.roundToInt
import kotlin.reflect.KProperty1


// Manages communication with external board via serial port
object Serial : Runnable {

    private val logger = KotlinLogging.logger {}
    private var comPort: SerialPort? = null
    private var lastPacket = Instant.MIN
    private var lastPulseTime: Instant = Instant.now()
    private var lastPulseValue: Long = 0

    private object MessageListener : SerialPortMessageListener {
        override fun getListeningEvents(): Int {
            return SerialPort.LISTENING_EVENT_DATA_RECEIVED
        }

        override fun getMessageDelimiter(): ByteArray {
            return byteArrayOf('|'.toByte())
        }

        override fun delimiterIndicatesEndOfMessage(): Boolean {
            return true
        }

        override fun serialEvent(event: SerialPortEvent) {
            lastPacket = Instant.now()

            val kvString = event.receivedData.map {
                it.toChar()
            }
                .joinToString("")
                .replace("|", "")

            try {
                setState(kvString)
            } catch(e: Exception) {}
        }
    }

    override fun run() {
        // Loop forever
        while(true) {
            if (Instant.now().minusMillis(20000) > lastPacket) {
                State.addLogMessage("Serial port seems to be stalled or closed. Reopening.")

                // Attempt to close port first, just in case
                try {
                    comPort?.removeDataListener()
                    comPort?.closePort()
                } catch (e: Exception) {}

                val portString = if (isWindows()) "COM4" else "/dev/ttyACM0"
                comPort = SerialPort.getCommPort(portString)
                comPort?.openPort()
                comPort?.setRTS()
                Thread.sleep(1000)
                comPort?.clearRTS()
                comPort?.baudRate = 115200
                comPort?.addDataListener(MessageListener)
            }

            Thread.sleep(2000)
        }
    }

    private fun setState(kvString: String) {
        val parts = kvString.split(":")

        when(parts[0]) {
            "boost" -> State.boost = parts[1].toDouble()
            "fuel" -> State.fuel = parts[1].toDouble()
            "hi" -> State.highBeam = parts[1].toBoolean()
            "left" -> State.left = parts[1].toBoolean()
            "lo" -> State.lowBeam = parts[1].toBoolean()
            "oil" -> State.oil = parts[1].toBoolean()
            "pulses" -> handlePulses(parts)
            "rev" -> State.reverse = parts[1].toBoolean()
            "right" -> State.right = parts[1].toBoolean()
            "volt" -> State.batt = parts[1].toDouble()
            "sd" -> shutdownSystem()
        }
    }

    private fun handlePulses(parts: List<String>) {
        // Update speedometer & odometer
        val currentTime = Instant.now()
        val pulses = parts[1].toLong()

        fun reset() {
            State.mph.clear()
            lastPulseTime = currentTime
            lastPulseValue = pulses
            return
        }

        if (pulses > lastPulseValue) {
            val microsDifference = ChronoUnit.MICROS.between(lastPulseTime, currentTime)
            val pulseDifference = pulses - lastPulseValue
            val pulseBase = 3_600_000_000.0 / Config.vssPulsesPerMile.toDouble()

            // Clear MPH state if values are stale
            if (microsDifference == 0L || microsDifference > 500_000) {
                return reset()
            }

            // Calculate MPH
            val timeScale = pulseBase / microsDifference.toDouble()
            val pulseScale = pulseDifference.toDouble() / 1.0
            val mph = timeScale * pulseScale

            if (mph < 0.0 || mph > 200.0) {
                return reset()
            }

            State.mph.add(mph)

            State.odometer += pulseDifference / Config.vssPulsesPerMile.toDouble()
            State.tripOdometer += pulseDifference / Config.vssPulsesPerMile.toDouble()

            Config.writeOdometer(State.odometer, State.tripOdometer)
        }

        // Store new values
        lastPulseTime = currentTime
        lastPulseValue = pulses
    }
}
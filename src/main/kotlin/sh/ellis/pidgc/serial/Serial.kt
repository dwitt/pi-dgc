package sh.ellis.pidgc.serial

import com.fazecast.jSerialComm.SerialPort
import com.fazecast.jSerialComm.SerialPortEvent
import com.fazecast.jSerialComm.SerialPortMessageListener
import mu.KotlinLogging
import sh.ellis.pidgc.config.Config
import sh.ellis.pidgc.state.State
import sh.ellis.pidgc.utils.isWindows
import sh.ellis.pidgc.utils.shutdownSystem
import java.time.Instant





// Manages communication with external board via serial port
object Serial : Runnable {

    private const val NO_PULSE = 99999L
    private val VALID_PACKETS = listOf(
        "batt", "boost", "fuel", "hi", "left", "lo", "oil", "pulses", "rev", "right", "shutdown"
    )

    private val logger = KotlinLogging.logger {}
    private var comPort: SerialPort? = null
    private var lastPacket = Instant.MIN

    private class MessageListener : SerialPortMessageListener {
        override fun getListeningEvents(): Int {
            return SerialPort.LISTENING_EVENT_DATA_RECEIVED
        }

        override fun getMessageDelimiter(): ByteArray {
            return byteArrayOf(0x0A)
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
                .replace("\n", "")

            try {
                processPacket(kvString)
            } catch(e: Exception) {}
        }
    }

    override fun run() {
        // Loop forever
//        while(true) {
//            if (Instant.now().minusMillis(2500) > lastPacket) {
                State.addLogMessage("Serial port seems to be stalled or closed. Reopening.")

                // Attempt to close port first, just in case
//                try {
//                    comPort?.removeDataListener()
//                    comPort?.closePort()
//                } catch (e: Exception) {}

                val portString = if (isWindows()) "COM5" else "/dev/ttyACM0"
                comPort = SerialPort.getCommPort(portString)
                comPort?.openPort()
//                comPort?.setRTS()
//                Thread.sleep(1000)
//                comPort?.clearRTS()
                comPort?.baudRate = 115200
                comPort?.addDataListener(MessageListener())
//            }

//            Thread.sleep(2000)
//        }
    }

    private fun processPacket(packet: String) {
        val parts = packet.split(":")

        when(parts[0]) {
            "batt" -> State.battery = parts[1].toDouble()
            "fuel" -> State.fuel = parts[1].toDouble()
            "hi" -> State.highBeam = parts[1].toBoolean()
            "left" -> State.left = parts[1].toBoolean()
            "lo" -> State.lowBeam = parts[1].toBoolean()
            "log" -> State.addLogMessage(parts[1])
            "pulses" -> handlePulses(parts[1])
            "rev" -> State.reverse = parts[1].toBoolean()
            "right" -> State.right = parts[1].toBoolean()
            "temp" -> State.temperature = parts[1].toDouble() + Config.tempCompensation
            "shutdown" -> if (parts[1].toBoolean()) shutdownSystem()
        }
    }

    private fun handlePulses(value: String) {
        val parts = value.split(",")

        // Update speedometer & odometer
        val numPulses = parts[0].toLong()
        val pulseSeparationMicros = parts[1].toLong()

        // Pulses counted / pulses per mile = distance travelled.
        val distance = numPulses / Config.vssPulsesPerMile.toDouble()
        State.odometer += distance
        State.tripOdometer += distance
        Config.writeOdometer(State.odometer, State.tripOdometer)

        if (pulseSeparationMicros != NO_PULSE && pulseSeparationMicros > 0L) {
            // Calculate MPH
            val oneMphInMicros = 3_600_000_000.0 / Config.vssPulsesPerMile.toDouble()
            val mph = oneMphInMicros / pulseSeparationMicros.toDouble()
            State.mph.add(mph)
        }
    }
}
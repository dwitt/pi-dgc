package sh.ellis.pidgc.canbus

import mu.KotlinLogging
import sh.ellis.pidgc.config.Config
import sh.ellis.pidgc.state.State
import tel.schich.javacan.*
import java.nio.ByteBuffer
import java.time.Duration

// Manages all interactions with OBD2 via canbus
class CanbusManager: Runnable {

    private val logger = KotlinLogging.logger {}

    @ExperimentalUnsignedTypes
    override fun run() {
        CanChannels.newRawChannel().use {
            it.bind(NetworkDevice.lookup("can0"))
            it.configureBlocking(true)
            it.setOption(CanSocketOptions.FILTER, arrayOf( CanFilter(0x7E8)))
            it.setOption(CanSocketOptions.SO_RCVTIMEO, Duration.ofMillis(1))

            var lastHiRes: Long = System.currentTimeMillis()
            var lastLowRes = lastHiRes

            while(true) {
                val currentTime: Long = System.currentTimeMillis()

                if (currentTime - lastHiRes >= 50) {
                    // Request engine RPM
                    // it.write(makeCanRequest(0x0C))
                    // readResponse(it)

                    lastHiRes = currentTime
                }

                if (currentTime - lastLowRes >= 500) {
                    // Request control module voltage
                    it.write(makeCanRequest(0x42))
                    readResponse(it)

                    // Request coolant temp
                    it.write(makeCanRequest(0x05))
                    readResponse(it)

                    // Request MIL status
                    it.write(makeCanRequest(0x01))
                    readResponse(it)

                    lastLowRes = currentTime
                }

                // Hopefully catch any timed out responses
                readResponse(it)
            }
        }
    }

    @ExperimentalUnsignedTypes
    private fun readResponse(canChannel : RawCanChannel) {
        try {
            processResponse(canChannel.read())
        } catch (e: Exception) {
            // This is fine, the read timeout is just being hit.
        }
    }

    @ExperimentalUnsignedTypes
    private fun processResponse(frame: CanFrame) {
        // Store frame data
        val data: ByteBuffer = ByteBuffer.allocate(frame.dataLength)
        frame.getData(data)

        // Get message length
        val length: Int = data[0].toInt()

        // Verify mode
        if (data[1].toInt() != 0x41)
            return

        // Handle response PID
        when (data[2].toInt()) {

            // RPM
            0x0C -> {
                if (length != 4) {
                    logger.error("RPM message length != 4")
                    return
                }

                State.rpm = ((256 * data[3].toUByte().toInt()) + data[4].toUByte().toInt()) / 4
            }

            // Coolant
            0x05 -> {
                if (length != 3) {
                    logger.error("Coolant message length != 3")
                    return
                }

                State.coolant = (((data[3].toUByte().toInt().toFloat() - 40.0) * 1.8) + 32.0).toInt()
            }

            // MIL
            0x01 -> {
                if (length != 6) {
                    logger.error("MIL message length != 6: $length")
                    return
                }

                State.mil = data[3].toUByte().msb.toUInt() == (0xF).toUInt()
            }

            // Control Module Voltage
            0x42 -> {
                if (length != 4) {
                    logger.error("Control Module Voltage message length != 4")
                    return
                }

                State.battery = (((256.0 * data[3].toUByte().toDouble()) + data[4].toUByte().toDouble()) / 1000.0) * Config.batteryCorrection
            }
        }
    }

    private fun makeCanRequest(activeByte: Byte): CanFrame {
        return CanFrame.createRaw(
            0x7E0,
            0,
            byteArrayOf(
                0x02,
                0x01,
                activeByte
            ),
            0,
            3
        )
    }

    @ExperimentalUnsignedTypes
    val UByte.msb get() = (this.toInt() shr 4 and 0b1111).toUByte()
    @ExperimentalUnsignedTypes
    val UByte.lsb get() = (this.toInt() and 0b1111).toUByte()
}
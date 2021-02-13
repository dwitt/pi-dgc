package sh.ellis.pidgc.can

import mu.KotlinLogging
import tel.schich.javacan.CanChannels
import tel.schich.javacan.CanFilter
import tel.schich.javacan.CanSocketOptions
import tel.schich.javacan.NetworkDevice

class CanManager: Runnable {

    private val logger = KotlinLogging.logger {}

    override fun run() {
        CanChannels.newRawChannel().use {
            it.bind(NetworkDevice.lookup("vcan0"))
            it.setOption(CanSocketOptions.LOOPBACK, false)
            it.configureBlocking(true)
            it.setOption(CanSocketOptions.FILTER, arrayOf(CanFilter.NONE))
        }
    }
}
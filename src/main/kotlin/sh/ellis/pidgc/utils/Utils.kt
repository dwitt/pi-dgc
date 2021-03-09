package sh.ellis.pidgc.utils

import kotlin.system.exitProcess

fun isWindows(): Boolean {
    val os = System.getProperty("os.name").toLowerCase()

    return when {
        os.contains("win") -> true
        else -> false
    }
}

fun shutdownSystem() {
    Runtime.getRuntime().exec("sudo shutdown -h now")
    exitProcess(0)
}
package sh.ellis.pidgc.utils

fun isWindows(): Boolean {
    val os = System.getProperty("os.name").toLowerCase()

    return when {
        os.contains("win") -> true
        else -> false
    }
}

fun shutdownSystem() {
    val p = Runtime.getRuntime().exec("sudo shutdown -h now")
    p.waitFor()
}
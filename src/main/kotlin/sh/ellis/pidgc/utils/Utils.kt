package sh.ellis.pidgc.utils

fun isWindows(): Boolean {
    val os = System.getProperty("os.name").toLowerCase()

    return when {
        os.contains("win") -> true
        else -> false
    }
}
package sh.ellis.pidgc.model

// Data class used to transmit JSON via websocket to frontend
data class Message(
    val mph: Int,           // Vehicle speed sensor, Pi GPIO
    val rpm: Int,           // OBD2
    val boost: Int,         // OBD2
    val coolant: Int,       // OBD2
    val fuel: Int,          // Analog, Pi analog?
    val mil: Boolean,       // OBD2
    val oil: Boolean,       // OBD2
    val lowBeam: Boolean,   // GPIO
    val highBeam: Boolean,  // GPIO
    val left: Boolean,      // GPIO
    val right: Boolean,     // GPIO
    val battery: Boolean    // Analog, Pi analog?
)
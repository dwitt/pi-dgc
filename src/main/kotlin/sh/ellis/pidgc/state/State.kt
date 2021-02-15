package sh.ellis.pidgc.state

object State {
    @set:Synchronized
    var mph: Int = 0

    @set:Synchronized
    var rpm: Int = 0

    @set:Synchronized
    var boost: Int = 0

    @set:Synchronized
    var coolant: Int = 0

    @set:Synchronized
    var fuel: Int = 0

    @set:Synchronized
    var mil: Boolean = false

    @set:Synchronized
    var oil: Boolean = false

    @set:Synchronized
    var lowBeam: Boolean = false

    @set:Synchronized
    var highBeam: Boolean = false

    @set:Synchronized
    var left: Boolean = false

    @set:Synchronized
    var right: Boolean = false

    @set:Synchronized
    var battery: Boolean = false
}
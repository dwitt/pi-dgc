// Maintains connection to web socket
function connectWebSocket() {
    const socket = new SockJS('/gs-guide-websocket');

    stompClient = Stomp.over(socket);
    stompClient.debug = DEBUG_MODE;

    stompClient.connect({}, (frame) => {
        console.log('Connected to: ' + frame);

        stompClient.subscribe('/topic/status', (message) => {
            const statusMsg = JSON.parse(message.body);

            rpm = statusMsg.rpm;
            coolant = statusMsg.coolant;
            boost = statusMsg.boost;
            mph = statusMsg.mph;
            fuel = statusMsg.fuel;
            voltage = statusMsg.voltage;
            odometer = statusMsg.odometer;
            temperature = statusMsg.temperature;
            tripOdometer = statusMsg.tripOdometer;
            reverse = statusMsg.reverse;
            oilPressure = statusMsg.oilPressure;

            indicators.mil = statusMsg.mil;
            indicators.oil = statusMsg.oil < 10;
            indicators.lowBeam = statusMsg.lowBeam;
            indicators.highBeam = statusMsg.highBeam;
            indicators.left = statusMsg.left;
            indicators.right = statusMsg.right;
        });

        stompClient.subscribe('/topic/logs', (message) => {
            const logMessages = JSON.parse(message.body);

            if (logMessages.length !== 0) {
                console.log(logMessages);
            }
        });
    }, () => {
        // Attempt to reconnect on lost connection
        window.setTimeout(function() {
            this.connectWebSocket();
        }.bind(this), 2500);
    });
}

connectWebSocket();
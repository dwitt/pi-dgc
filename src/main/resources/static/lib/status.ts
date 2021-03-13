import SockJS from "sockjs-client";
import { Stomp } from '@stomp/stompjs';
import {
    GraphicsContainer,
    IndicatorContainer,
    LogMessage,
    SpriteContainer,
    StatusMessage,
    StatusMessageBody,
    TextContainer,
    VehicleParameters
} from "./types";

// STOMP client
let stompClient: any;

// Tracking variables
let vehicle: VehicleParameters = {
    rpm: 0,
    mph: 0,
    coolant: 170,
    fuel: 0,
    boost: 0,
    voltage: 0,
    odometer: 0,
    tripOdometer: 0,
    boostLaggingMax: 0,
    reverse: false,
    temperature: 32,
    oilPressure: 0,
};

// Maintains connection to web socket
function connectWebSocket(this: any) {
    const socket = new SockJS('/gs-guide-websocket');

    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect({}, (frame: string) => {
        console.log('Connected to: ' + frame);

        stompClient.subscribe('/topic/status', (message: StatusMessage) => {
            const statusMsg = JSON.parse(message.body + "");

            (<HTMLInputElement>document.getElementById("rpm")).value = statusMsg.rpm;
            (<HTMLInputElement>document.getElementById("mph")).value = statusMsg.mph;
            (<HTMLInputElement>document.getElementById("coolant")).value = statusMsg.coolant;
            (<HTMLInputElement>document.getElementById("fuel")).value = statusMsg.fuel;
            (<HTMLInputElement>document.getElementById("boost")).value = statusMsg.boost;
            (<HTMLInputElement>document.getElementById("voltage")).value = statusMsg.voltage;
            (<HTMLInputElement>document.getElementById("odometer")).value = statusMsg.odometer;
            (<HTMLInputElement>document.getElementById("trip-odometer")).value = statusMsg.tripOdometer;
            (<HTMLInputElement>document.getElementById("reverse")).value = statusMsg.reverse;
            (<HTMLInputElement>document.getElementById("temperature")).value = statusMsg.temperature;
            (<HTMLInputElement>document.getElementById("oilPressure")).value = statusMsg.oilPressure;
            (<HTMLInputElement>document.getElementById("low")).value = statusMsg.lowBeam;
            (<HTMLInputElement>document.getElementById("high")).value = statusMsg.highBeam;
            (<HTMLInputElement>document.getElementById("left")).value = statusMsg.left;
            (<HTMLInputElement>document.getElementById("right")).value = statusMsg.right;
        });

        stompClient.subscribe('/topic/logs', (message: LogMessage) => {
            const logMessages = message.body;

            if (logMessages.length !== 0) {
                let logArea: HTMLTextAreaElement = document.getElementById("logs") as HTMLTextAreaElement;
                logArea.value += logArea.textContent;
            }
        });
    }, () => {
        // Attempt to reconnect on lost connection
        window.setTimeout(function(this: any) {
            this.connectWebSocket();
        }.bind(this), 2500);
    });
}

// Start polling for status
connectWebSocket();
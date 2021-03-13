#include <avr/io.h>
#include <avr/interrupt.h>
#include <Smoothed.h>
#include <BMP085.h>
#include <Wire.h>
#include "readers.h"
#include "pins.h"
#include "types.h"
#include "odometer.h"
#include "serialReader.h"

#define LO_FREQ   999999999 // 15000000
#define MD_FREQ   999999999 // 250000
#define HI_FREQ   999999999 // 100000
#define NO_PULSE  99999

elapsedMicros lowFrequency;
elapsedMicros mediumFrequency;
elapsedMicros highFrequency;

bool startedShutdown = false;

Smoothed<int> highBeam;
Smoothed<int> lowBeam;
Smoothed<int> reverseLight;
Smoothed<int> rightIndicator;
Smoothed<int> leftIndicator;
Smoothed<float> battery;
Smoothed<float> fuelLevel;

volatile unsigned long lastPulse = 0;
volatile unsigned long pulseSeparation = 0;
volatile unsigned int pulseCounter = 0;

BMP085 ptSensor;

void setup() {
  Serial.begin(115200);

  // Turn on LED as a power indicator
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);

  // Set value to expiration so it will fire immediately on boot
  lowFrequency = LO_FREQ;

  battery.begin(SMOOTHED_AVERAGE, 10);
  highBeam.begin(SMOOTHED_AVERAGE, 10);
  lowBeam.begin(SMOOTHED_AVERAGE, 10);
  reverseLight.begin(SMOOTHED_AVERAGE, 10);
  rightIndicator.begin(SMOOTHED_AVERAGE, 10);
  leftIndicator.begin(SMOOTHED_AVERAGE, 10);
  fuelLevel.begin(SMOOTHED_AVERAGE, 10);

  pinMode(digitalPinToInterrupt(VSS), INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(VSS), vssInterrupt, RISING);

  ptSensor.init();

  // Send initial odometer values
  sendOdometerValues();
}

void vssInterrupt() {
  unsigned long currentPulse = micros();
  
  if (lastPulse > currentPulse) {
    lastPulse = currentPulse;
    pulseSeparation = NO_PULSE;
  } else {
    pulseSeparation = currentPulse - lastPulse;
    lastPulse = currentPulse;
  }

  pulseCounter++;
}

void loop() {  
  // Poll analog pins
  readAnalog();

  // High frequency updates
  if (highFrequency >= HI_FREQ) {
    highFrequency -= HI_FREQ;

    cli();
    unsigned int numPulses = pulseCounter;
    unsigned int pulseSep = pulseSeparation;
    sei();
    pulseCounter = 0;

    // Send numPulses & pulseSep
    char output[25] = {0};
    sprintf(output, "pulses:%d,%d", numPulses, pulseSep);
    Serial.println(output);
  }

  // Medium frequency updates
  if (mediumFrequency >= MD_FREQ) {
    mediumFrequency -= MD_FREQ;

    char output[512] = {0};
    sprintf(
      output, 
      "batt:%f\nfuel:%f\nhi:%d\nleft:%d\nlo:%d\nrev:%d\nright:%d\n",
      battery.get(),
      fuelLevel.get(),
      highBeam.get() >= 512 ? true : false,
      leftIndicator.get() >= 512 ? true : false,
      lowBeam.get() >= 512 ? true : false,
      reverseLight.get() >= 512 ? true : false,
      rightIndicator.get() >= 512 ? true : false
    );
    Serial.print(output);
  }

  // Low frequency updates
  if (lowFrequency >= LO_FREQ) {
    lowFrequency -= LO_FREQ;

    float temperature = ptSensor.bmp085GetTemperature(ptSensor.bmp085ReadUT());

    char output[256] = {0};
    sprintf(
      output, 
      "temp:%f\n",
      (temperature * 1.8) + 32.0 // Convert to degF
    );
    Serial.print(output);
  }

  // Check for commands from Pi
  char *serialMessage = getSerialMessage();
  if (serialMessage != NULL) {
    // Pi requesting odometer values
    if (strcmp(serialMessage, "so") == 0)
      sendOdometerValues();

    // Pi writing odometer values
    else if(strstr(serialMessage, "wo:") != NULL) {
      char *values = serialMessage + 3;

      char *token = strtok(values, ",");
      writeMileage(TRIP, atof(token));

      token = strtok(NULL, ",");
      writeMileage(REGULAR, atof(token));
    }
  }

  // Only write odometers to EEPROM if battery voltage is good to prevent corruption
  if (battery.get() > 5.0) {
    writeMileage(REGULAR, odometer);
    writeMileage(TRIP, tripOdometer); 
  }
}

void readAnalog() {
  battery.add(readBattery());
  highBeam.add(readHighBeam());
  lowBeam.add(readLowBeam());
  reverseLight.add(readReverseLight());
  rightIndicator.add(readRightIndicator());
  leftIndicator.add(readLeftIndicator());
  fuelLevel.add(readFuelLevel()); 
}

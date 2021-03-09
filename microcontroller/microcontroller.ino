#include <avr/io.h>
#include <avr/interrupt.h>
#include <Smoothed.h>
#include <BMP085.h>
#include <Wire.h>
#include "readers.h"
#include "pins.h"

#define LO_FREQ   15000000
#define MD_FREQ   250000
#define HI_FREQ   100000
#define NO_PULSE  99999

elapsedMicros lowFrequency;
elapsedMicros mediumFrequency;
elapsedMicros highFrequency;
elapsedMillis piShutdownTimer;

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
  
  pinMode(PI_PWR, OUTPUT);

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

  // Send Serial updates if necessary
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

  // If the battery voltage is less than 5vdc, we assume we should shut down
  if (battery.get() < 5.0) {
    if (!startedShutdown) {
      // Start the shutdown sequence
      startedShutdown = true;
      piShutdownTimer = 0;
      Serial.println("shutdown:true");
    } else {
      if (piShutdownTimer >= 120000) {
        // Open relay and kill power to Pi
        digitalWrite(PI_PWR, LOW);
        piShutdownTimer = 120001;
      }
    }
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

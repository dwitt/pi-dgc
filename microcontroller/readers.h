#include "pins.h"

// Reads battery voltage (0-15)
float readBattery() {
  return ((float)analogRead(IGNI) / 1024.0) * 18.45; // 18.45 multiplier determined experimentally
}

int readHighBeam() {
  return analogRead(HIBM);
}

int readLowBeam() {
  return analogRead(LOBM);
}

int readReverseLight() {
  return analogRead(REV);
}

int readRightIndicator() {
  return analogRead(RIGHT);
}

int readLeftIndicator() {
  return analogRead(LEFT);
}

// Read exponential fuel level
float readFuelLevel() {
  float fuelRaw = (float)analogRead(FUEL);

  if (fuelRaw < 25.0)
    return 0.0;
    
  float fuelProcessed = 1.55397 * pow(0.995521, fuelRaw);
  return min(fuelProcessed, 1.0);
}

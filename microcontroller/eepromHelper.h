#include <EEPROM.h>
#include "types.h"

void writeMileage(int address, Mileage *mileage) {
  for(unsigned int i=0; i < sizeof(Mileage); i++) {
    EEPROM.write(address + i, mileage->uBytes[i]);
  }
}

Mileage readMileage(int address) {
  Mileage temp;

  for(unsigned int i=0; i < sizeof(Mileage); i++) {
    temp.uBytes[i] = EEPROM.read(address + i);
  }

  return temp;
}

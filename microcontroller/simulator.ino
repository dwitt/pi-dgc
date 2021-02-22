float randomFloat(float minf, float maxf) {
  return minf + random(1UL << 31) * (maxf - minf) / (1UL << 31);  // use 1ULL<<63 for max double values)
}

int vssPulses = 0;
float vssPulseSin = randomFloat(-3.14159, 3.14159f);
float boost = randomFloat(0.0f, 30.0f);
float boostSin = randomFloat(-3.14159, 3.14159f);
float fuel = randomFloat(0.0f, 1.0f);
float fuelSin = randomFloat(-3.14159, 3.14159f);

void setup() {
   Serial.begin(115200);
}

void loop() {
  sendVssPulses();
  delay(10);
  
  sendBoost();
  delay(1);

  sendFuel();
 delay(1);
}

void sendVssPulses() {
  Serial.print("pulses:");
  Serial.print(vssPulses);
  Serial.print("|");

  vssPulseSin += 0.001f;
  vssPulses += 3 + round(sin(vssPulseSin) * 3.0f);
}

void sendBoost() {
  Serial.print("boost:");
  Serial.print(boost);
  Serial.print("|");

  boost = abs(sin(boostSin)) * 30.0f;
  boostSin += 0.025f;
}

void sendFuel() {
  Serial.print("fuel:");
  Serial.print(fuel);
  Serial.print("|");

  fuel = abs(sin(fuelSin));
  fuelSin += 0.0025f;
}

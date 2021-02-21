void setup() {
   Serial.begin(115200);
}

int pulses = 0;

void loop() {
  Serial.print("pulses:");
  Serial.print(pulses);
  Serial.print("|");

  pulses += 10;

  delay(75);
}

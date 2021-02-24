# pi-dgc
Raspberry Pi based Digital Gauge Cluster

Setup steps on Buster Lite:
- raspi-config / Boot Options / Console Autologin
- `sudo apt-get install libgles2`
- `sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox`
- `sudo apt-get install --no-install-recommends chromium-browser`
- `sudo apt-get install default-jdk`
- `mkdir ~/pidgc`
- Put pidgc.jar into ~/pidgc
- Edit `/boot/config.txt`. Add:
~~~
initial_turbo=60
disable_splash=1
boot_delay=0
force_turbo=1
dtparam=spi=on
dtoverlay=mcp2515-can0,oscillator=16000000,interrupt=25
dtoverlay=spi-bcm2835-overlay
~~~
- Add `quiet fastboot` to `/boot/cmdline.txt`
- Copy contents of `linux/openbox_autostart` from repo into file `/etc/xdg/openbox/autostart`
- Copy contents of `linux/pidgc.service` from repo into file `/etc/systemd/system/pidgc.service`
- Copy contents of `linux/pidgc.sh` from repo into file `/usr/local/bin/pidgc.sh`
- `sudo systemctl enable pidgc.service`
- `sudo /sbin/ip link set can0 up type can bitrate 500000`
- Add `[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor` to ~/.bash_profile
- Disable unused services once everything is done. This decreases boot time substantially:
  - sudo systemctl disable ssh
  - sudo systemctl disable hciuart 
  - sudo systemctl disable nmbd
  - sudo systemctl disable smbd
  - sudo systemctl disable systemd-timesyncd
  - sudo systemctl disable wpa_supplicant
  - sudo systemctl disable rpi-eeprom-update
  - sudo systemctl disable raspi-config
  - sudo systemctl disable networking
  - sudo systemctl disable dhcpcd

Now when you reboot the system should start into startx and run Chromium with http://localhost:8080.
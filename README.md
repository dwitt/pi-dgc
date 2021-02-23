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
- Edit OpenBox config (`sudo nano /etc/xdg/openbox/autostart`)
~~~
# Disable any form of screen saver / screen blanking / power management
xset s off
xset s noblank
xset -dpms

# Allow quitting the X server with CTRL-ATL-Backspace
setxkbmap -option terminate:ctrl_alt_bksp

# Start Chromium in kiosk mode
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
java -XX:TieredStopAtLevel=1 -noverify -XX:+AlwaysPreTouch -Duser.dir=/home/pi/pidgc -jar /home/pi/pidgc/pidgc.jar
~~~
- Add `[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor` to ~/.bash_profile
- Create can0
    - `sudo nano /boot/config.txt`, add these three lines
    - `dtparam=spi=on`
    - `dtoverlay=mcp2515-can0,oscillator=16000000,interrupt=25`
    - `dtoverlay=spi-bcm2835-overlay`
- `sudo /sbin/ip link set can0 up type can bitrate 500000`
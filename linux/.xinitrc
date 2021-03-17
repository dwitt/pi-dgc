#!/bin/sh
# ~/.xinitrc
xrandr --output HDMI-1 --mode 1280x480

xset -dpms
xset s off
xset s noblank

# Allow quitting the X server with CTRL-ATL-Backspace
setxkbmap -option terminate:ctrl_alt_bksp

# Remove old sessions of chromium
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences

unclutter -idle 0 &
chromium-browser http://localhost:8080 --window-size=1280,480 --window-position=0,0 \
    --start-fullscreen --kiosk --noerrdialogs \
    --disable-translate --no-first-run --fast --fast-start \
    --disable-infobars --disable-features=TranslateUI \
    --disk-cache-dir=/dev/null --password-store=basic \
    --enable-features=OverlayScrollbar,OverlayScrollbarFlashAfterAnyScrollUpdate,OverlayScrollbarFlashWhenMouseEnter
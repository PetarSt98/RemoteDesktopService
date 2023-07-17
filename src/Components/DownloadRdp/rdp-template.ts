export const customizeRdpFile = (resourceName: string) => {
  return `full address:s:${resourceName}.cern.ch
desktopwidth:i:1280
desktopheight:i:1024
session bpp:i:16
compression:i:1
keyboardhook:i:2
displayconnectionbar:i:1
disable wallpaper:i:1
disable full window drag:i:1
allow desktop composition:i:0
allow font smoothing:i:0
disable menu anims:i:1
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
audiomode:i:0
redirectprinters:i:1
redirectcomports:i:0
redirectsmartcards:i:1
redirectclipboard:i:1
redirectposdevices:i:0
autoreconnection enabled:i:1
authentication level:i:0
prompt for credentials:i:0
negotiate security layer:i:1
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
gatewayhostname:s:cerngt01.cern.ch
gatewayusagemethod:i:1
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:1

omptcredentialonce:i:1
drivestoredirect:s:
  `;
};

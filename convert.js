const fs = require('fs');

// We just copy the jpg and name it icon.ico for now as a simple workaround for the user.
// True ICO format conversion requires an external package like png-to-ico which we don't have readily available in this node environment without installing.
// Electron CAN use PNGs for icons on Windows in some cases, so let's try just providing a PNG.

fs.copyFileSync('/src/assets/images/rgamer_logo_icon_1789141756599.jpg', 'icon.png');
console.log('Created icon.png');

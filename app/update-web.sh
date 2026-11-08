#!/bin/sh
# Copies the latest Kitty into the iPhone app project. Run on the Mac from this folder: sh update-web.sh
cp ../index.html ../fb.js ../icon-*.png ../manifest.webmanifest www/ 2>/dev/null
sed -i '' "s#const APP_URL = location.origin+location.pathname;#const APP_URL = 'https://edcroon.github.io/kitty/';#" www/index.html
npx cap copy ios

#!/usr/bin/env python3

import urllib.parse

chars = ''.join([chr(i) for i in range(0X021, 0X07E)])
print('https://fonts.googleapis.com/css?family=Mulish:ital,wght@400..500;1,400&display=block&text='
      + urllib.parse.quote(chars))


# Either download and base64 the font or use this tool:
# https://amio.github.io/embedded-google-fonts/

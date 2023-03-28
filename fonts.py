#!/usr/bin/env python3

import urllib.parse

api = 'https://fonts.googleapis.com/css2'
# font = 'family=Mulish:ital,wght@0,400..500;1,400'
font = 'family=Mulish:ital,wght@0,400'
# chars = ''.join([chr(i) for i in range(0X021, 0X07E)])

# Obtained from:
# document.querySelector('.resume__Wrapper-sc-1vort98-0').textContent.replace(/\s+/g, '')
chars = 'DevrajMhtlinkd.com/@EXPRINCGg,TL-sbuA201SBpfy+z5wxUq9$3%YOV7()46F&JH!WKQ←'


print(api + '?' + font + '&display=block&text=' + urllib.parse.quote(chars))


# Either download and base64 the font or use this tool:
# https://amio.github.io/embedded-google-fonts/

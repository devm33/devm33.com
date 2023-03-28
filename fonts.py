#!/usr/bin/env python3

import urllib.parse

api = 'https://fonts.googleapis.com/css2'
# font = 'family=Mulish:ital,wght@0,400..500;1,400'
font = 'family=Mulish:ital,wght@0,400'
# chars = ''.join([chr(i) for i in range(0X021, 0X07E)])

# Obtained from:
# Array.from(new Set(Array.from(document.querySelector('.resume__Wrapper-sc-1vort98-0').textContent.replace(/\s+/g, '')))).sort().join('')
chars = '!$%&()+,-./012345679@ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz←'


print(api + '?' + font + '&display=block&text=' + urllib.parse.quote(chars))


# Either download and base64 the font or use this tool:
# https://amio.github.io/embedded-google-fonts/

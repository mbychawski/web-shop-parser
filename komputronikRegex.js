 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
exports.getRegex = function() {
    return komputronikRegex;
};

var komputronikRegex = {
    "model" : null,
    "price" : null,
    "processor-brand"   : /procesora?\s+\*\s+(Intel|AMD)/,
    "processor-model"   : /(?:(?:model\s*procesora)|(?:procesor))\s+\*\s+([^\n]+)/,
    "ram-size"          : /pamię.*\s*(?:RAM|operacyjnej)\s+\*\s+([^\n]+)\s+(GB|MB)/,
    "hard-drive-size"   : /pojemność\s*dysku.*\*\s+([^\n]+)\s+(GB|TB)/,
    "brand"             : /Producent\s+\*\s+([^\n]+)/,
    "weight"            : /(?:waga|masa)\s+\*\s+([^\n]+)\s+(kg|g)/,
    "screen-size"       : /przekątna\s*(?:ekranu|wyświetlacza)\s*(?:LCD)*\s+\*\s+([^\n]+)\s+(cali|cale)/,
    "screen-resolution" : /(?:nominalna)?\s*rozdzielczość\s*(?:LCD)?\s*\*\s+([^\n]+)\s*(pikseli|px)/,
    "screen-type"       : /technologia\s*(?:wykonania|dotykowa)\s*\*\s*([^\n]+)/,
    "memory-size"       : /pamięć\s*(?:Flash)?\s*\*\s*([^\n]+)\s+(MB|GB)/,
    "operating-system"  : /system\s*operacyjny\s*\*\s*([^\n]+)/,
    "button-count"      : /liczba\s*przycisków\s+\*\s+([^\n]+)\s*szt/,
    "bandwidth"         : /pasmo\s*przenoszenia\s+\*\s+([^\n]+)\s+Hz/,
    "microphone"        : /mikrofon\s+\*\s+(tak|nie)/,
    "speakers-count"    : /ilośc\s*głośników\s*\*\s*([^\n]+)\s*szt/,
    "power"             : /moc[^\n]*\*\s+([^\n]+)\s*W/,
    "matrix"            : /matryca[\w\s()]*\*\s+([^\n]+)\s+MP/,
    "display-size"      : /przekątna\s*LCD\s+\*\s+([^\n]+)\s+cale/,
    "keyboard-type"     : /typ\s*klawiatury\s+\*\s+([^\n]+)/,
    "mouse-type"        : /typ\s*myszy\s+\*\s+([^\n]+)/
};
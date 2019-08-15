import * as wasm from "code-challenge";

const SIZE = 10000000;

const logResults = (str) => {
  const resultsElem = document.getElementById('results');
  resultsElem.innerText = resultsElem.innerText
    + str + '\n\n';
};

const binToBase64 = (bytes) => {
  let index = 0;
  let bit = 0;
  let resultStr = '';
  let char;
  let sextet;

  const getCharForSextet = (sextet) => {
    if (sextet < 26) {
      return String.fromCharCode(65 + sextet); // A-Z
    } else if (sextet < 52){
      return String.fromCharCode(97 + sextet - 26); // a-z
    } else if (sextet < 62){
      return String.fromCharCode(48 + sextet - 52); // 0-9
    } else if (sextet === 62) {
      return '+'
    } else {
      return '/'
    }
  };

  while (index < bytes.byteLength - 1) {
    switch (bit) {
      case 0:
        sextet = bytes[index] >> 2;
        bit = 6;
        break;
      case 2:
        sextet = bytes[index] & 0b00111111;
        bit = 0;
        index++;
        break;
      case 4:
        sextet = ((bytes[index] & 0b00001111) << 2)
          + (bytes[index + 1] >> 6);
        bit = 2;
        index++;
        break;
      case 6:
        sextet = ((bytes[index] & 0b00000011) << 4)
          + (bytes[index + 1] >> 4);
        bit = 4;
        index++;
    }
    char = getCharForSextet(sextet);
    resultStr += char;
  }

  const finalByte = bytes[bytes.byteLength - 1];

  switch (bit) {
    case 0:
      resultStr += getCharForSextet(finalByte >> 2)
      resultStr += getCharForSextet((finalByte & 0b000011)  << 4)
        + "==";
      break;
    case 2:
      resultStr += getCharForSextet(finalByte & 0b00111111);
      break;
    case 4:
      resultStr += getCharForSextet((finalByte & 0b00001111) << 2)
        + "=";
  }
  return resultStr;
};

const getUint8Array = () => {
  const uint8Array = new Uint8Array(SIZE);
  for (let i = 0; i < SIZE; i ++) {
    uint8Array[i] = Math.floor(Math.random() * 256);
  }
  return uint8Array;
};

const fillCanvas = (uint8Array, ctx) => {
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 15; j++) {
      const r = uint8Array[(i * 20) + j];
      const g = uint8Array[(i * 20) + j + 1];
      const b = uint8Array[(i * 20) + j + 2];
      const a = uint8Array[(i * 20) + j + 3];
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a/255})`;
      ctx.fillRect( i * 10, j * 10, 10, 10 );
    }
  }
  const k = SIZE - (4 * 20 * 15);
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 30; j++) {
      const r = uint8Array[k + (i * 20) + j];
      const g = uint8Array[k + (i * 20) + j + 1];
      const b = uint8Array[k + (i * 20) + j + 2];
      const a = uint8Array[k + (i * 20) + j + 3];
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a/255})`;
      ctx.fillRect(i * 10, j * 10 + 20, 10, 10 );
    }
  }
};

const strToUint8Array = (str) => {
  const uint8Array = new Uint8Array(SIZE);
  for (let i = 0; i < str.length; i++) {
    uint8Array[i] = str.charCodeAt(i);
  }
  return uint8Array;
};

const uint8Array = getUint8Array();
const canvas1 = document.getElementById('canvas1');
var ctx1 = canvas1.getContext('2d');
fillCanvas(uint8Array, ctx1);

// Use the built-in btoa() function
let binaryString = '';
for (let i = 0; i < uint8Array.byteLength; i++) {
  binaryString += String.fromCharCode(uint8Array[i]);
}
let start = new Date().getTime();
const base64StrNative = btoa(binaryString);
const durationNative = new Date().getTime() - start;
logResults(`Duration using btoa(): ${durationNative}ms`);

// using RUST:
start = new Date().getTime();
const base64Str = wasm.code_challenge(uint8Array);
const durationRust = new Date().getTime() - start;
let matchingResults = (base64Str === base64StrNative);
logResults(`Duration using RUST WebAssembly: ${durationRust}ms`);
logResults(`Results match: ${matchingResults}`);

// Using Custom JS base64 implementation:
start = new Date().getTime();
const base64StrJS = binToBase64(uint8Array);
const durationCustomJS = new Date().getTime() - start;
logResults(`Time using custom implementation: ${durationCustomJS}ms`);
matchingResults = (base64Str === base64StrJS);
logResults(`Results match: ${matchingResults}`);

const resultUint8Str = atob(base64Str);
const resultUint8Array = strToUint8Array(resultUint8Str);
const canvas2 = document.getElementById('canvas2');
var ctx2 = canvas2.getContext('2d');
fillCanvas(resultUint8Array, ctx2);
var img = document.getElementById('final-image'); 
img.src = canvas2.toDataURL();


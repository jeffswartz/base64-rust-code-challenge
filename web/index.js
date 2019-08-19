import * as wasm from "code-challenge";

const SIZE = 10000000;
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');
const canvas1 = document.getElementById('canvas1');
const ctx1 = canvas1.getContext('2d');

const logResults = (str) => {
  const resultsElem = document.getElementById('results');
  resultsElem.innerText = resultsElem.innerText
    + str + '\n\n';
};

const binToBase64 = (bytes) => {
  const PADDING_CHAR_CODE = 61; // ASCII value for '='
  let index = 0;
  let bit = 0;
  let resultIndex = 0;
  let resultUint8Array = new Uint8Array(4 * Math.ceil(SIZE / 3));
  let charCode;
  let sextet;

  let base64CharCodeMap = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47]

  const getCharCodeForSextet = (sextet) => {
    return base64CharCodeMap[sextet]; // A-Z
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
    charCode = getCharCodeForSextet(sextet);
    resultUint8Array[resultIndex] = charCode;
    resultIndex++;
  }

  const finalByte = bytes[bytes.byteLength - 1];

  switch (bit) {
    case 0:
      charCode = getCharCodeForSextet(finalByte >> 2)
      resultUint8Array[resultIndex] = charCode;
      resultIndex++;
      charCode = getCharCodeForSextet((finalByte & 0b000011)  << 4);
      resultUint8Array[resultIndex] = charCode;
      resultIndex++;
      resultUint8Array[resultIndex] = PADDING_CHAR_CODE;
      resultIndex++;
      resultUint8Array[resultIndex] = PADDING_CHAR_CODE;
      break;
    case 2:
      charCode = getCharCodeForSextet(finalByte & 0b00111111);
      resultUint8Array[resultIndex] = charCode;
      break;
    case 4:
      charCode = getCharCodeForSextet((finalByte & 0b00001111) << 2)
      resultUint8Array[resultIndex] = charCode;
      resultIndex++;
      resultUint8Array[resultIndex] = PADDING_CHAR_CODE;
  }
  const utf8decoder = new TextDecoder();
  return utf8decoder.decode(resultUint8Array);
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
fillCanvas(uint8Array, ctx1);

// Use the built-in btoa() function
let binaryString = '';
for (let i = 0; i < uint8Array.byteLength; i++) {
  binaryString += String.fromCharCode(uint8Array[i]);
}
let start = new Date().getTime();
const base64StrNative = btoa(binaryString);
const durationNative = new Date().getTime() - start;
logResults(`Time to create base64 string using btoa(): ${durationNative}ms`);

// Using Custom JS base64 implementation:
start = new Date().getTime();
const base64StrJS = binToBase64(uint8Array);
const durationCustomJS = new Date().getTime() - start;
logResults(`Time to create base64 string using custom JavaScript implementation: ${durationCustomJS}ms`);
let matchingResults = (base64StrJS === base64StrNative);
logResults(`Results match: ${matchingResults}`);

let resultUint8Str = atob(base64StrJS);
let resultUint8Array = strToUint8Array(resultUint8Str);
fillCanvas(resultUint8Array, ctx2);
var img = document.getElementById('custom-js-image');
img.src = canvas2.toDataURL();

// using RUST:
start = new Date().getTime();
const base64Str = wasm.code_challenge(uint8Array);
const durationRust = new Date().getTime() - start;
matchingResults = (base64Str === base64StrNative);
logResults(`Time to create base64 string using RUST WebAssembly: ${durationRust}ms`);
logResults(`Results match: ${matchingResults}`);

resultUint8Str = atob(base64Str);
resultUint8Array = strToUint8Array(resultUint8Str);
fillCanvas(resultUint8Array, ctx2);
var img = document.getElementById('rust-image');
img.src = canvas2.toDataURL();


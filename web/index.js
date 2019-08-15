import * as wasm from "wasm-game-of-life";

const SIZE = 1000000;
const getUint8Array = () => {
  const uint8Array = new Uint8Array(SIZE);
  for (let i = 0; i < SIZE; i ++) {
    uint8Array[i] = Math.floor(Math.random() * 256);
  }
  return uint8Array;
};

let start = new Date().getTime();
const uint8Array = getUint8Array();
const base64Str = wasm.code_challenge(uint8Array);
const duration = new Date().getTime() - start;
let binaryString = '';
for (let i = 0; i < uint8Array.byteLength; i++) {
  binaryString += String.fromCharCode(uint8Array[i]);
}
start = new Date().getTime();
const base64StrNative = btoa(binaryString);
const durationNative = new Date().getTime() - start;
const matchingResults = (base64Str === base64StrNative);
document.write(`matchingResults: ${matchingResults}<br>`);
document.write(`Duration using RUST webassembly: ${duration}ms<br>`);
document.write(`Duration using btoa(): ${durationNative}ms`);

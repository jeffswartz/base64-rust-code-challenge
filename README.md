# base64-rust-code-challenge
A base64 encoder written in RUST

Based on the RUST wasm Hello World: https://rustwasm.github.io/book/game-of-life/hello-world.html.

## Prerequisites

Install Rust: https://www.rust-lang.org/tools/install.

And wasm-pack: https://rustwasm.github.io/wasm-pack/installer/.

## Building

At the root, run:

```
wasm-pack build
```

Then, cd to the web directory and run:

```
npm install
```

Then run the web app. In the web directory, run:

```
npm run build
npm start
```

Then open the app in the browser: http://localhost:8080/.
// extern crate time;
// extern crate base64;
// extern crate rand;
// use rand::Rng;

mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(name);
}

#[wasm_bindgen]
pub fn code_challenge(vec: Vec<u8>) -> String {
    fn get_char_for_sextet(sextet: u8) -> char {
      if sextet < 26 {
        return (65 + sextet) as char; // A-Z
      } else if sextet < 52 {
        return (97 + sextet - 26) as char; // a-z
      } else if sextet < 62 {
        return (48 + sextet - 52) as char; // 0-9
      } else if sextet == 62 {
        return '+';
      } else {
        return '/';
      }
    }

    fn build_base64_string(v: &Vec<u8>) -> String {
        let mut str = String::new();
        let mut index = 0;
        let mut bit = 0;
        let mut ch: char;
        let mut sextet: u8;
        while index < v.len() - 1  {
          match bit {
            0 => {
              sextet = v[index] >> 2;
              bit = 6;
            }
            2 => {
              sextet = v[index] & 0b00111111;
              bit = 0;
              index += 1;
            }
            4 => {
              sextet = ((v[index] & 0b00001111) << 2) + (v[index + 1] >> 6);
              bit = 2;
              index += 1;
            }
            _ => { // 6 is the only other value
              sextet = ((v[index] & 0b00000011) << 4) + (v[index + 1] >> 4);
              bit = 4;
              index += 1;
            }
          }
          ch = get_char_for_sextet(sextet);
          str.push(ch);
        }

        let final_byte: u8 = v[v.len() - 1];

        match bit {
            0 => {
              ch = get_char_for_sextet(final_byte >> 2);
              str.push(ch);
              ch = get_char_for_sextet((final_byte & 0b000011) << 4);
              str.push(ch);
              str.push('=');
              str.push('=');
            }
            2 => {
              ch = get_char_for_sextet(final_byte & 0b00111111);
              str.push(ch);
            }
            _ => { // 4 is the only other possible value
              ch = get_char_for_sextet((final_byte & 0b00001111) << 2);
              str.push(ch);
              str.push('=');
            }
        }
        return str;
    }

    // let mut timespec = time::get_time();
    // let start: f64 = timespec.sec as f64 + (timespec.nsec as f64 / 1000.0 / 1000.0 / 1000.0);
    // println!("Start timestamp {0}", start);
    let base64str = build_base64_string(&vec);
    return base64str
    // println!("base64str length {0}", base64str.len());
    // println!("base64_str {0}", base64_str.to_string());
    // timespec = time::get_time();
    // let finish: f64 = timespec.sec as f64 + (timespec.nsec as f64 / 1000.0 / 1000.0 / 1000.0);
    // println!("Duration {0} ms", (finish - start) * 1000.0);
    // println!("Stop timestamp {0}", finish);
    //let crate64str = base64::encode(&vec);
    // println!("Strings match? {0}", base64str == crate64str);
}
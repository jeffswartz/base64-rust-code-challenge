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
pub fn code_challenge(vec: Vec<u8>) -> String {
    fn build_base64_string(v: &Vec<u8>) -> String {
        let base64_char_code_map = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47];

        let mut result_vector = Vec::with_capacity(1333336);
        let mut index = 0;
        let mut bit = 0;
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
          result_vector.push(base64_char_code_map[sextet as usize]);
        }

        let final_byte: u8 = v[v.len() - 1];

        match bit {
            0 => {
              result_vector.push(base64_char_code_map[(final_byte >> 2) as usize]);
              result_vector.push(base64_char_code_map[((final_byte & 0b000011) << 4) as usize]);
              result_vector.push(61);
              result_vector.push(61);
            }
            2 => {
              result_vector.push(base64_char_code_map[(final_byte & 0b00111111) as usize]);
            }
            _ => { // 4 is the only other possible value
              result_vector.push(base64_char_code_map[((final_byte & 0b00001111) << 2) as usize]);
              result_vector.push(61);
            }
        }
        return unsafe {
          String::from_utf8_unchecked(result_vector)
        };
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
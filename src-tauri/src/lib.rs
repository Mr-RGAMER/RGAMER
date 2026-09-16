use tauri::command;
use std::net::TcpStream;
use std::io::Write;

#[command]
fn send_to_blender(script: &str) -> String {
    // Ye code Blender ke local port 8080 par python script bhejega
    match TcpStream::connect("127.0.0.1:8080") {
        Ok(mut stream) => {
            let message = format!("{}", script);
            match stream.write(message.as_bytes()) {
                Ok(_) => "Success: Script sent to Blender!".to_string(),
                Err(e) => format!("Error writing to Blender: {}", e),
            }
        }
        Err(e) => {
            format!("Error: Blender is not running or listening on port 8080. ({})", e)
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![send_to_blender])
    .run(tauri::generate_context!())
    .expect("error while running RGAMER application");
}

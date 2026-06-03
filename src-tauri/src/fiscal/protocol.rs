use serialport::SerialPort;
use std::io::{Read, Write};
use std::time::Duration;

const STX: u8 = 0x02;
const ETX: u8 = 0x03;
const ACK: u8 = 0x06;
const NAK: u8 = 0x15;
const MAX_RETRIES: u32 = 3;
const TIMEOUT_MS: u64 = 2000;

pub struct FiscalPort {
    port: Box<dyn SerialPort>,
}

impl FiscalPort {
    pub fn open(port_name: &str, baud: u32) -> Result<Self, String> {
        let port = serialport::new(port_name, baud)
            .data_bits(serialport::DataBits::Eight)
            .flow_control(serialport::FlowControl::None)
            .parity(serialport::Parity::None)
            .stop_bits(serialport::StopBits::One)
            .timeout(Duration::from_millis(TIMEOUT_MS))
            .open()
            .map_err(|e| format!("Failed to open COM port {port_name}: {e}"))?;
        Ok(Self { port })
    }

    pub fn send_command(&mut self, cmd: &str) -> Result<String, String> {
        self.send_command_with_retry(cmd, MAX_RETRIES)
    }

    fn send_command_with_retry(&mut self, cmd: &str, retries: u32) -> Result<String, String> {
        for attempt in 0..=retries {
            if attempt > 0 {
                std::thread::sleep(Duration::from_millis(200));
            }
            match self.send_frame(cmd) {
                Ok(resp) => return Ok(resp),
                Err(e) => {
                    if attempt == retries {
                        return Err(format!(
                            "Fiscal command '{cmd}' failed after {retries} retries: {e}"
                        ));
                    }
                }
            }
        }
        Err("Unreachable".to_string())
    }

    fn send_frame(&mut self, cmd: &str) -> Result<String, String> {
        let cmd_bytes = cmd.as_bytes();
        let bcc = cmd_bytes.iter().fold(0u8, |acc, b| acc ^ b);

        let mut frame = Vec::with_capacity(cmd_bytes.len() + 3);
        frame.push(STX);
        frame.extend_from_slice(cmd_bytes);
        frame.push(ETX);
        frame.push(bcc);

        self.port.flush().ok();
        self.port
            .write_all(&frame)
            .map_err(|e| format!("Write error: {e}"))?;

        let mut reply = [0u8; 1024];
        let n = self
            .port
            .read(&mut reply)
            .map_err(|e| format!("Read error: {e}"))?;
        if n == 0 {
            return Err("Pas de réponse de l'imprimante fiscale".to_string());
        }

        let resp_text = |buf: &[u8], start: usize, end: usize| -> String {
            buf[start..end]
                .iter()
                .map(|&b| b as char)
                .collect::<String>()
                .trim()
                .to_string()
        };

        if n >= 2 && reply[0] == STX {
            let end = (1..n).find(|&i| reply[i] == ETX).unwrap_or(n - 1);
            return Ok(resp_text(&reply, 1, end));
        }

        if reply[0] == ACK {
            return if n > 1 {
                let code = resp_text(&reply, 1, n);
                if code.is_empty() {
                    Ok("OK".to_string())
                } else {
                    Ok(code)
                }
            } else {
                Ok("OK".to_string())
            };
        }

        if reply[0] == NAK {
            let code = if n > 1 {
                resp_text(&reply, 1, n)
            } else {
                "?".to_string()
            };
            return Err(format!("NAK: {code}"));
        }

        let raw: String = reply[..n]
            .iter()
            .map(|&b| {
                if b.is_ascii_graphic() || b == b' ' {
                    b as char
                } else {
                    '.'
                }
            })
            .collect();
        Err(format!("Réponse inattendue: {raw}"))
    }
}

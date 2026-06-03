use super::protocol::FiscalPort;

pub struct FiscalDevice {
    port: FiscalPort,
    pub in_ticket: bool,
}

impl FiscalDevice {
    pub fn open(port_name: &str, baud: u32) -> Result<Self, String> {
        let port = FiscalPort::open(port_name, baud)?;
        Ok(Self {
            port,
            in_ticket: false,
        })
    }

    pub fn cpx(&mut self, operator: &str, customer: &str) -> Result<String, String> {
        let cmd = format!("CPX{operator};{customer}");
        let resp = self.port.send_command(&cmd)?;
        self.in_ticket = true;
        Ok(resp)
    }

    pub fn cpm(&mut self, amount: i64, mode: &str) -> Result<String, String> {
        let tys = match mode {
            "cash" => "0",
            "card" => "1",
            "cheque" => "2",
            "transfer" => "3",
            _ => "0",
        };
        let cmd = format!("CPM{amount};{tys}");
        let resp = self.port.send_command(&cmd)?;
        Ok(resp)
    }

    pub fn cpb(&mut self) -> Result<String, String> {
        let resp = self.port.send_command("CPB")?;
        self.in_ticket = false;
        Ok(resp)
    }

    pub fn rsx(&mut self, report_type: u32) -> Result<String, String> {
        let cmd = format!("RSX{report_type:06}");
        self.port.send_command(&cmd)
    }

    pub fn rsz(&mut self, report_type: u32) -> Result<String, String> {
        let cmd = format!("RSZ{report_type:06}");
        self.port.send_command(&cmd)
    }

    pub fn ruz(&mut self) -> Result<String, String> {
        self.port.send_command("RUz")
    }

    pub fn reset(&mut self) -> Result<String, String> {
        self.in_ticket = false;
        self.port.send_command("ABORT")
    }
}

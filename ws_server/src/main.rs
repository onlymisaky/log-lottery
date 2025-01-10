use log::{error, info,warn};
use log4rs::init_file;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use ws::{CloseCode, Handler, Handshake, Message, Result, Sender, WebSocket};
use clap::Parser;

#[derive(Clone, PartialEq)]
enum ConnectionType {
    User,
    Client,
}
struct Connection {
    conn_type: ConnectionType,
    sender: Sender,
    // 添加存储 headers 的字段
    headers: HashMap<String, String>,
}

struct Server {
    out: Sender,
    connections: Arc<Mutex<HashMap<u32, Connection>>>,
}

impl Handler for Server {
    fn on_open(&mut self, handshake: Handshake) -> Result<()> {
        // 获取并处理 headers
        let headers = handshake.request.headers();
        let mut header_map = HashMap::new();

        // 遍历并存储所有 headers
        for (key, value) in headers.iter() {
            // 使用 from_utf8_lossy 将 Vec<u8> 转换为字符串
            let value_str = String::from_utf8_lossy(value);
            header_map.insert(key.to_string(), value_str.to_string());
        }

        // 获取一些常用的 headers
        let user_agent = header_map
            .get("User-Agent")
            .cloned()
            .unwrap_or("none".to_string());
        let origin = header_map
            .get("Origin")
            .cloned()
            .unwrap_or("none".to_string());
        let host = header_map
            .get("Host")
            .cloned()
            .unwrap_or("none".to_string());

        // 获取连接路径
        let path = handshake.request.resource();
        let conn_type = match path {
            "/user" => ConnectionType::User,
            "/client" => ConnectionType::Client,
            _ => {
                self.out.close(CloseCode::Protocol)?;
                return Ok(());
            }
        };

        // 存储新连接及其 headers
        let connection = Connection {
            conn_type: conn_type.clone(),
            sender: self.out.clone(),
            headers: header_map,
        };

        let mut connections = self.connections.lock().unwrap();
        connections.insert(self.out.connection_id(), connection);
        if conn_type == ConnectionType::User {
            info!(
                "New user connection: {},headers user-agent:{:?},origin:{:?},host:{:?}",
                self.out.connection_id(),
                user_agent,
                origin,
                host
            );
        } else {
            info!("New client connection: {}", self.out.connection_id());
        }
        Ok(())
    }

    fn on_message(&mut self, msg: Message) -> Result<()> {
        let connections = self.connections.lock().unwrap();
        let current_conn = connections.get(&self.out.connection_id()).unwrap();
        info!(
            "Message -- {} -- from connection: {}",
            msg,
            current_conn
                .headers
                .get("User-Agent")
                .unwrap_or(&"none".to_string())
        );

        if current_conn.conn_type == ConnectionType::User {
            for (_, conn) in connections.iter() {
                if conn.conn_type == ConnectionType::Client {
                    conn.sender.send(msg.clone())?;
                }
            }
        }
        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        let mut connections = self.connections.lock().unwrap();
        connections.remove(&self.out.connection_id());
        println!(
            "Connection {} closing due to ({:?}) {}",
            self.out.connection_id(),
            code,
            reason
        );
        warn!("Connection {} closing due to ({:?}) {}", self.out.connection_id(), code, reason)
    }
}

#[derive(Parser)]
#[command(version, author, about, long_about = None)]
struct Cli {
    /// local computer ip
    #[arg(long)]
    ip: String,
}
fn main() {
    init_file("log4rs.yml", Default::default()).expect("Some Error");

    let cli = Cli::parse();
    info!("ip:{}", cli.ip);
    // 拼接cli.ip和端口3012
    let addr = format!("{}:3012", cli.ip);
    let connections = Arc::new(Mutex::new(HashMap::new()));
    info!("Starting WebSocket server...");
    if let Err(error) = WebSocket::new(|out| Server {
        out,
        connections: connections.clone(),
    })
    .unwrap()
    .listen(addr)
    {
        error!("Failed to create WebSocket server: {:?}", error);
    }
}

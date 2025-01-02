const net = require("net");
const Parser = require("redis-parser");
const store = {};

const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const parser = new Parser({
      returnReply: (reply) => {
        const command = reply[0].toLowerCase();
        switch (command) {
          case "set": {
            const key = reply[1];
            const value = reply[2];
            store[key] = value;
            connection.write("+OK\r\n");
            break;
          }
          case "get": {
            const key = reply[1];
            const value = store[key];
            if (!value) {
              connection.write("$-1\r\n");
            } else {
              connection.write(`$${value.length}\r\n${value}\r\n`);
            }
            break;
          }
          default: {
            connection.write("-ERR unknown command\r\n");
          }
        }
      },
      returnError: (error) => {
        console.error("Parser error:", error);
      },
    });

    parser.execute(data);
  });
});
const port = 6379;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

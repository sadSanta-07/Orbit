console.log("Starting socket test...");

const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWExZjViZjE0NjRkMjQzMDMyOTkxNWEiLCJ1c2VybmFtZSI6InNhaGlsIiwiaWF0IjoxNzcyMjIyMTk2LCJleHAiOjE3NzI4MjY5OTZ9.aTLGFHOvOd3x6F80mlspUoTfrrQ6_kGsokTO5TiJ5GM"
  }
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join_room", "AQYRMQ");

  socket.emit("send_message", {
    roomId: "69a1f8c4c8426f0e66126695",
    roomCode: "AQYRMQ",
    content: "@Orbit why is my API returning undefined?"
  });
});

socket.on("connect_error", (err) => {
  console.log("Connection Error:", err.message);
});

socket.on("receive_message", (msg) => {
  console.log("Message received:", msg);
});

socket.on("orbit_typing", (data) => {
  console.log("Orbit typing:", data);
});
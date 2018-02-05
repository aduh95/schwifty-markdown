/**
 * @author aduh95
 * Really simple WebSocket client module
 *
 * Its goal is to reload the page anytime the server send something
 * and to close it once the server closes the connection.
 */

const socket = new WebSocket("ws://" + window.location.host + "/");

const onClose = () => window.close();

// Listen for messages to reload the page
socket.addEventListener("message", () => {
  socket.removeEventListener("close", onClose);
  window.requestAnimationFrame(() => window.location.assign("/"));
});

window.addEventListener("beforeunload", () =>
  socket.removeEventListener("close", onClose)
);

// When server closes the connection, let's close the tab
socket.addEventListener("close", onClose);

export default socket;

/**
 * @author aduh95
 * Really simple WebSocket client module
 * 
 * Its goal is to reload the page anytime the server send something
 * and to close it once the server closes the connection.
 */

const socket = new WebSocket("ws://" + window.location.host + "/");

// Listen for messages to reload the page
socket.addEventListener("message", () => window.location.reload());

// When server closes the connection, let's close the tab
socket.addEventListener("close", () => window.close());

export default socket;

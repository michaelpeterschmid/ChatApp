const joinRoomButton = document.getElementById("room-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");


const socket = io("http://socket-demo-chatapp.onrender.com");
// listening to event coming down from the server
socket.on("connect", () => {
    displayMessage(`You connected with id: ${socket.id}`)
})

socket.on("receive-message", message => {
    displayMessage(message, "receive");
})



form.addEventListener("submit", event => {
    /*The preventDefault() method cancels the event if it is cancelable, meaning that the default action that belongs to the event will not occur.

    For example, this can be useful when:

    Clicking on a "Submit" button, prevent it from submitting a form
    Clicking on a link, prevent the link from following the UR */
    event.preventDefault()

    const message = messageInput.value;
    const room = roomInput.value;
    console.log(room);
    if(message === "" ) {
        return;
    }else{
        displayMessage(message, "send");

        socket.emit("send-message", message, room);
        messageInput.value = ""; //clear out the input
    }

})


joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value;

    //say to the server that we want to join to a specific room
    socket.emit("join-room", room, /*callback function at last to inform user about success*/ message => {
        displayMessage(message, "send");
    })
})



function displayMessage(message, verb){
    const div = document.createElement("div");
    if(verb==="receive"){
        div.classList.add("receiver");
    }else{
        div.classList.add("sender")
    }
    const br = document.createElement("br");
    div.textContent = message;
    document.getElementById("message-container").append(div, br);
}
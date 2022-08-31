import { getMyConversations, getConversationsWithUSer } from "./services.js";
const clientinputid = document.querySelector("#sendMessageForm #clientid");

const socket = io();
// socket.on("connect", () => socket.emit("userConnected", user.id));
socket.on("message", (message) => {
  console.log(message);
  if (typeof message !== "object" && !message.error) return false;
  if (message.from.id == parseInt(clientinputid.value.trim())) {
    passConversationsToDOM([message]);
  } else {
  }
});

window.addEventListener("load", function () {
  getMyConversations().then(renderAllConversions).then(onUserClick);
  sendMessageForm.addEventListener("submit", sendMessage);
});

function renderAllConversions(conversations) {
  let html = "";
  for (let i = 0; i < conversations.length; i++) {
    const { clientid, from, to, message } = conversations[i];
    html += `
        <li class="px-3">
        <a href="#" class="text-light text-decoration-none d-flex align-items-center chat-person" clientid="${
          clientid == user.id ? from.id : to.id
        }" client_username="${
      clientid == user.id ? from.username : to.username
    }">
            <i class="fa-solid fa-circle-user "></i>
            <span class="ms-3 fs-6 message-box text-capitalize py-2 ">
                <div class="d-flex justify-content-between align-items-center ">
                    <span>${
                      clientid == user.id ? from.username : to.username
                    }</span>
                    <small class="text-secondary lh-sm small ">10:17 AM</small>
                </div>
                  <small class="text-secondary lh-sm">${message.substr(
                    0,
                    20
                  )}...
                  </small>
                  
            </span>
        </a>
    </li>
        `;
  }

  chatconversations.innerHTML = html;
}

function onUserClick() {
  const chatpersons = document.querySelectorAll(".chat-person");
  chatpersons.forEach((chatperson) => {
    chatperson.addEventListener("click", function () {
      client_username.innerText = this.getAttribute("client_username");
      document.querySelector("#sendMessageForm #clientid").value =
        this.getAttribute("clientid");
      getConversationsWithUSer(this).then(renderUserConversations);
    });
  });
}

async function renderUserConversations(conversations) {
  const messages = document.querySelector(".messages");
  messages.innerHTML = "";
  passConversationsToDOM(conversations);
}

function sendMessage(e) {
  e.preventDefault();
  const message = this.elements["messageInput"].value;
  const clientid = this.elements["clientid"].value;
  socket.emit("newMessage", { message, clientid });
  passConversationsToDOM([{ message, clientid, from: user.id, to: clientid }]);
  this.elements["messageInput"].value = "";
  this.elements["messageInput"].focus();
}

function passConversationsToDOM(conversations) {
  const message_content = document.querySelectorAll(".content")[1];
  const messages = document.querySelector(".messages");
  conversations.forEach((conversation, index) => {
    const { clientid, message } = conversation;
    if (clientid == user.id) {
      if (index > 0 && clientid === conversations[index - 1].clientid) {
        //append to last message recieved
        const recieveContainer = Array.from(
          document.querySelectorAll(".recieve-container")
        ).reverse()[0];
        const html = `<div class="recieve message px-3 py-2">
                                      <span class="pe-5">${message}</span>
                                      <small
                                          class="small text-secondary ms-2 d-flex justify-content-end align-items-center lh-sm">
                                          2:15 PM
                                          <i class="fa-solid fa-check-double ms-1 d-inline-block"></i>
                                      </small>
                                  </div>`;
        recieveContainer.insertAdjacentHTML("beforeend", html);
      } else {
        //create a new recieve container with messsage inside
        const html = `<div class="recieve-container d-flex align-items-start flex-column w-100">
                                    <div class="recieve message px-3 py-2">
                                        <span class="pe-5">${message}</span>
                                        <small
                                            class="small text-secondary ms-2 d-flex justify-content-end align-items-center lh-sm">
                                            2:15 PM
                                            <i class="fa-solid fa-check-double ms-1 d-inline-block"></i>
                                        </small>
                                    </div>
                              </div>`;
        messages.insertAdjacentHTML("beforeend", html);
      }
    } else {
      if (index > 0 && clientid === conversations[index - 1].clientid) {
        //append to last message sent
        const sentContainer = Array.from(
          document.querySelectorAll(".sent-container")
        ).reverse()[0];
        const html = `<div class="sent message px-3 py-2">
                                <span class="pe-5">${message}</span>
                                <small
                                    class="small text-secondary ms-2 d-flex justify-content-end align-items-center lh-sm">
                                    2:15 PM
                                    <i class="fa-solid fa-check-double ms-1 d-inline-block"></i>
                                </small>
                            </div>`;
        sentContainer.insertAdjacentHTML("beforeend", html);
      } else {
        //create a new sent container with messsage inside
        const html = `<div class="sent-container d-flex align-items-end flex-column w-100">
                                <div class="sent message px-3 py-2">
                                    <span class="pe-5">${message}</span>
                                    <small
                                        class="small text-secondary ms-2 d-flex justify-content-end align-items-center lh-sm">
                                        2:15 PM
                                        <i class="fa-solid fa-check-double ms-1 d-inline-block"></i>
                                    </small>
                                </div>
                          </div>`;
        messages.insertAdjacentHTML("beforeend", html);
      }
    }
  });
  //scroll to bottom
  message_content.scrollTo({ top: message_content.clientHeight });
}

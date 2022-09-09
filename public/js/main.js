import {
  getMyConversations,
  getConversationsWithUSer,
  getAllFriends,
  getNewFriends,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getUserStatus,
  setOnlineStatus,
} from "./services.js";
const clientinputid = document.querySelector("#sendMessageForm #clientid");
const btnAllFriends = document.querySelector(".btn-allfriends");
const friendsPanel = document.querySelector(".friends");
const hidefriendsPanel = document.querySelector(".btn-hideallfriends");
const newfriendsOrGroupPanel = document.querySelector(".newFriendOrGroupPanel");

const notificationsPanel = document.querySelector(".notification-panel");
const btnShowNotificationsPanel = document.querySelector(
  ".btn-show-notification"
);
const btnHideNotificationsPanel = document.querySelector(
  ".btn-hide-notification"
);
const notifications = document.querySelector("#notifications");

const hideriendsOrGroupPanel = Array.from(
  document.querySelectorAll(".btn-hide-newfriendOrGroupPanel")
);
const showfiendsOrGroupPanel = Array.from(
  document.querySelectorAll(".btn-show-newfriendOrGroupPanel")
);

const socket = io();
// socket.on("connect", () => socket.emit("userConnected", user.id));

socket.on("onlineStatus", setOnlineStatus);

socket.on("message", (message) => {
  console.log(message);
  if (typeof message !== "object" && !message.error) return false;
  if (message.sender.id == clientinputid.value.trim()) {
    passConversationsToDOM([message]);
  } else {
  }
});

socket.on("istyping", function (val) {
  typing.innerText = val;
});

window.addEventListener("load", function () {
  getMyConversations().then(renderAllConversions).then(onUserClick);
  messageInput.addEventListener("focus", function () {
    const clientid = messageInput.nextElementSibling.value;
    socket.emit("typing", { val: "Typing...", clientid });
  });
  messageInput.addEventListener("blur", function () {
    const clientid = messageInput.nextElementSibling.value;
    socket.emit("typing", { val: "", clientid });
  });
  sendMessageForm.addEventListener("submit", sendMessage);

  btnAllFriends.addEventListener("click", function () {
    if (friendsPanel.classList.contains("slide-out-left"))
      friendsPanel.classList.replace("slide-out-left", "slide-in-left");
    else friendsPanel.classList.add("slide-in-left");
    getAllFriends().then(renderAllFriends).then(onUserClick);
    sendMessageForm.addEventListener("submit", sendMessage);
  });

  hidefriendsPanel.addEventListener("click", function () {
    friendsPanel.classList.replace("slide-in-left", "slide-out-left");
    getMyConversations().then(renderAllConversions).then(onUserClick);
    sendMessageForm.addEventListener("submit", sendMessage);
  });

  showfiendsOrGroupPanel.forEach((btn, index) => {
    btn.onclick = () => {
      getNewFriends()
        .then(renderNewFriends)
        .then(() => {
          newfriendsOrGroupPanel.classList.contains("slide-out-left")
            ? newfriendsOrGroupPanel.classList.replace(
                "slide-out-left",
                "slide-in-left"
              )
            : newfriendsOrGroupPanel.classList.add("slide-in-left");
        })
        .then(onRequestClick);
    };

    hideriendsOrGroupPanel[index].onclick = () =>
      newfriendsOrGroupPanel.classList.replace(
        "slide-in-left",
        "slide-out-left"
      );
  });

  btnShowNotificationsPanel.addEventListener("click", function () {
    getFriendRequests()
      .then(renderfriendRequests)
      .then(() => {
        notificationsPanel.classList.contains("slide-out-left")
          ? notificationsPanel.classList.replace(
              "slide-out-left",
              "slide-in-left"
            )
          : notificationsPanel.classList.add("slide-in-left");
      })
      .then(onAcceptClick);
  });

  btnHideNotificationsPanel.addEventListener("click", function () {
    notificationsPanel.classList.add("slide-out-left");
  });
});

function renderAllConversions(conversations) {
  let html = "";
  for (let i = 0; i < conversations.length; i++) {
    const { clientid, sender, reciever, message } = conversations[i];
    html += `
        <li class="px-3">
        <a href="#" class="text-light text-decoration-none d-flex align-items-center chat-person" clientid="${
          clientid == user._id ? sender.id : reciever.id
        }" client_username="${
      clientid == user._id ? sender.username : reciever.username
    }">
            <i class="fa-solid fa-circle-user "></i>
            <span class="ms-3 fs-6 message-box text-capitalize py-2 ">
                <div class="d-flex justify-content-between align-items-center ">
                    <span>${
                      clientid == user._id ? sender.username : reciever.username
                    }</span>
                    <small class="text-secondary lh-sm small ">10:17 AM</small>
                </div>
                  <small class="text-secondary lh-sm">${
                    message.length > 20
                      ? message.substr(0, 20) + "..."
                      : message
                  }
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
      getConversationsWithUSer(this)
        .then(renderUserConversations)
        .then(getUserStatus);
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
  passConversationsToDOM([{ message, clientid }]);
  this.elements["messageInput"].value = "";
  this.elements["messageInput"].focus();
}

function passConversationsToDOM(conversations) {
  const message_content = document.querySelectorAll(".content")[2];
  const messages = document.querySelector(".messages");
  conversations.forEach((conversation, index) => {
    const { clientid, message } = conversation;
    if (clientid == user._id) {
      if (
        (index > 0 && clientid == conversations[index - 1].clientid) ||
        (message_content.firstElementChild.lastElementChild &&
          message_content.firstElementChild.lastElementChild.classList.contains(
            "recieve-container"
          ))
      ) {
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
      if (
        (index > 0 && clientid === conversations[index - 1].clientid) ||
        (message_content.firstElementChild.lastElementChild &&
          message_content.firstElementChild.lastElementChild.classList.contains(
            "sent-container"
          ))
      ) {
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
  message_content.scrollTo({ top: message_content.scrollHeight });
}

function renderAllFriends(friends) {
  let html = "";
  for (let i = 0; i < friends.length; i++) {
    const { username, id: clientid } = friends[i];
    html += `
        <li class="px-3">
        <a href="#" class="text-light text-decoration-none d-flex align-items-center chat-person" clientid="${clientid}" client_username="${username}">
            <i class="fa-solid fa-circle-user "></i>
            <span class="ms-3 fs-6 message-box text-capitalize py-2 ">
                <div class="d-flex justify-content-between align-items-center ">
                    <span>${username}</span>
                    <small class="text-secondary lh-sm small ">10:17 AM</small>
                </div>
                  <small class="text-secondary lh-sm">Hey there! I use MC</small>
                  
            </span>
        </a>
    </li>
        `;
  }

  newchatconversations.innerHTML = html;
}

async function renderNewFriends(newfriends) {
  let html = "";
  for (let i = 0; i < newfriends.length; i++) {
    const { username, _id: clientid, friends } = newfriends[i];
    html += `
        <li class="px-3">
        <a href="#" class="text-light text-decoration-none d-flex align-items-center">
            <i class="fa-solid fa-circle-user "></i>
            <span class="ms-3 fs-6 message-box text-capitalize py-2 ">
                <span class="d-block">${username}</span>  
                <div class="d-flex justify-content-between align-items-center ">
                  <small class="text-secondary lh-sm">${friends.length} friends</small>
                  <button class="btn btn-sm btn-success btn-request" clientid=${clientid}>Send request</button>
                </div>
            </span>
        </a>
    </li>
        `;
  }

  newFriendOrGroup.innerHTML = html;
}
async function renderfriendRequests(requesters) {
  let html = "";
  for (let i = 0; i < requesters.length; i++) {
    const { username, id: clientid } = requesters[i];
    html += `
        <li class="px-3">
        <a href="#" class="text-light text-decoration-none d-flex align-items-center">
            <i class="fa-solid fa-circle-user "></i>
            <span class="ms-3 fs-6 message-box text-capitalize py-2 ">
                <span class="d-block">${username}</span>  
                <div class="d-flex justify-content-between align-items-center ">
                  <small class="text-secondary lh-sm">20 friends</small>
                  <div>
                    <button class="btn btn-sm btn-success btn-accept-request" clientid=${clientid}>Accept</button>
                    <button class="btn btn-sm btn-danger btn-reject-request" clientid=${clientid}>reject</button>
                  </div>
                </div>
            </span>
        </a>
    </li>
        `;
  }

  notifications.innerHTML = html;
}

function onRequestClick() {
  const requestbtns = Array.from(document.querySelectorAll(".btn-request"));
  requestbtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.classList.contains("btn-reject")
        ? cancelFriendRequest(btn.getAttribute("clientid")).then((res) => {
            if (res._id) {
              btn.classList = "btn btn-sm btn-success btn-request";
              btn.innerText = "Send Request";
            }
          })
        : sendFriendRequest(btn.getAttribute("clientid")).then((res) => {
            if (res._id) {
              btn.classList = "btn btn-sm btn-danger btn-request btn-reject";
              btn.innerText = "Cancel Request";
            }
          });
    });
  });
}
function onAcceptClick() {
  const accepttbtns = Array.from(
    document.querySelectorAll(".btn-accept-request")
  );
  accepttbtns.forEach((btn) => {
    btn.addEventListener("click", async () =>
      acceptFriendRequest(btn.getAttribute("clientid")).then((res) => {
        if (res._id) {
          const li = btn.parentNode.parentNode.parentNode.parentNode;
          li.parentNode.removeChild(li);
        }
      })
    );
  });
}

function getUser(userid, users) {
  return users.find((user) => user.id == userid);
}

function getConversationsWithUSer(userid, recipientid, chats) {
  return chats.filter(
    (chat) =>
      (chat.from.id == userid && chat.to.id == recipientid) ||
      (chat.from.id == recipientid && chat.to.id == userid)
  );
}

function getLastMessages(userid, chats) {
  //final result array
  const x = [];

  //filter out my conversations from chats table
  //(The table where all messages in the app are going).
  // const mychats = chats.filter(
  //   (chat) => chat.from.id == userid || chat.to.id == userid
  // );

  //Get most recent chats grouped by reciever id
  chats.map((chat) => {
    const xindex = x.findIndex(
      (y) => y.clientid == chat.clientid || y.clientid == chat.from.id
    );
    if (xindex > -1) x[xindex] = chat;
    else x.push(chat);
  });

  return x;
}

module.exports = {
  getUser,
  getConversationsWithUSer,
  getLastMessages,
};

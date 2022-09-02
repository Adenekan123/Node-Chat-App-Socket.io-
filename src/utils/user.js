function getUser(userid, users) {
  return users.find((user) => user._id == userid);
}

function getConversationsWithUSer(userid, recipientid, messages) {
  return messages.filter(
    (message) =>
      (message.sender.id == userid && message.reciever.id == recipientid) ||
      (message.sender.id == recipientid && message.reciever.id == userid)
  );
}

function getLastMessages(userid, messages) {
  //final result array
  const x = [];

  //filter out my conversations from chats table
  //(The table where all messages in the app are going).
  // const mychats = chats.filter(
  //   (chat) => chat.from.id == userid || chat.to.id == userid
  // );

  //Get most recent chats grouped by reciever id
  messages.map((message) => {
    const xindex = x.findIndex(
      (y) =>
        y.clientid.toString() == message.clientid.toString() ||
        y.clientid.toString() == message.sender.id.toString()
    );
    if (xindex > -1) x[xindex] = message;
    else x.push(message);
  });

  return x;
}

module.exports = {
  getUser,
  getConversationsWithUSer,
  getLastMessages,
};

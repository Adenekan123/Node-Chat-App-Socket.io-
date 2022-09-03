const API_URL = "http://localhost:8000";

export async function authRegister(e) {
  e.preventDefault();
  const { username, email, password } = this.elements;
  try {
    const response = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    });
    const res = await response.json();
    if (res.error) return alert(res.message);
    if (res.user) localStorage.setItem("mcu", JSON.stringify(res.user));
    confirm(res.message) ? (location.href = res.redirecturl) : "";
  } catch (e) {
    console.log(e);
  }
}
export async function authLogin(e) {
  e.preventDefault();
  const { username, password } = this.elements;
  try {
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });
    const res = await response.json();
    if (res.error) return alert(res.message);
    if (res.user) localStorage.setItem("mcu", JSON.stringify(res.user));
    confirm(res.message) ? (location.href = res.redirecturl) : "";
  } catch (e) {
    console.log(e);
  }
}

export async function getMyConversations() {
  try {
    const response = await fetch(`${API_URL}/user/messages`);
    return await response.json();
  } catch (e) {
    console.log(e);
  }
}
export async function getConversationsWithUSer(e) {
  try {
    const response = await fetch(
      `${API_URL}/user/messages/${e.getAttribute("clientid")}`
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
}

export async function getAllFriends() {
  try {
    const response = await fetch(`${API_URL}/user/friends`);
    return await response.json();
  } catch (err) {
    console.log(err);
  }
}
export async function getNewFriends() {
  try {
    const response = await fetch(`${API_URL}/user/newfriends`);
    return await response.json();
  } catch (err) {
    console.log(err);
  }
}

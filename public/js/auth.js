const user = JSON.parse(localStorage.getItem("mcu"));
if (!user) location.href = "index.html";

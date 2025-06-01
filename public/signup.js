document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        alert(data.msg);

        if (response.ok) {
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error signing up. Please try again.");
    }
});
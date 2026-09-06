import { app } from "./firebase.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const auth = getAuth(app);

const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light-mode");
}

if (themeToggle) {
    themeToggle.textContent =
        document.body.classList.contains("light-mode")
            ? "🌙"
            : "☀️";

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        const isLightMode =
            document.body.classList.contains("light-mode");

        localStorage.setItem(
            "theme",
            isLightMode ? "light" : "dark"
        );

        themeToggle.textContent =
            isLightMode ? "🌙" : "☀️";
    });
}

const authForm = document.getElementById("auth-form");
const authMessage = document.getElementById("auth-message");
const signupButton = document.getElementById("signup-btn");

if (authForm) {
    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href = "index.html";
        } catch (error) {
            authMessage.textContent = error.message;
        }
    });
}

if (signupButton) {
    signupButton.addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            authMessage.textContent =
                "Account created successfully!";
        } catch (error) {
            authMessage.textContent = error.message;
        }
    });
}

onAuthStateChanged(auth, (user) => {
    const authLink = document.getElementById("auth-link");
    const userEmail = document.getElementById("user-email");

    if (!authLink) {
        return;
    }

    if (user) {
        if (userEmail) {
            userEmail.textContent = `Hello, ${user.email}`;
        }

        authLink.textContent = "Logout";
        authLink.href = "#";

        authLink.onclick = async (event) => {
            event.preventDefault();

            await signOut(auth);

            window.location.href = "login.html";
        };

    } else {
        if (userEmail) {
            userEmail.textContent = "";
        }

        authLink.textContent = "Login";
        authLink.href = "login.html";
        authLink.onclick = null;
    }
});
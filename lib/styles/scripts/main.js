function locomotiveAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    const locoScroll = new LocomotiveScroll({
        el: document.querySelector("#main"),
        smooth: true,
    });
    function login() {
        let role = document.getElementById("role").value;
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
    
        console.log("Role:", role);
        console.log("Username:", username);
        console.log("Password:", password);
    
        if (username === validUsers[role].username && password === validUsers[role].password) {
            localStorage.setItem("role", role);
            showLibrary(role);
        } else {
            alert("Invalid credentials!");
        }
    }

    locoScroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy("#main", {
        scrollTop(value) {
            return arguments.length
                ? locoScroll.scrollTo(value, 0, 0)
                : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
        pinType: document.querySelector("#main").style.transform
            ? "transform"
            : "fixed",
    });

    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();
}
locomotiveAnimation();

function navbarAnimation() {
    gsap.to("#nav-part1 h1", {
        transform: "translateY(-100%)",
        scrollTrigger: {
            trigger: "#page1",
            scroller: "#main",
            start: "top 0",
            end: "top -5%",
            scrub: true,
        },
    });
    gsap.to("#nav-part2 #links", {
        transform: "translateY(-100%)",
        opacity: 0,
        scrollTrigger: {
            trigger: "#page1",
            scroller: "#main",
            start: "top 0",
            end: "top -5%",
            scrub: true,
        },
    });
}
navbarAnimation();

function videoconAnimation() {
    var videocon = document.querySelector("#video-container");
    var playbtn = document.querySelector("#play");
    videocon.addEventListener("mouseenter", function () {
        gsap.to(playbtn, {
            scale: 1,
            opacity: 1,
        });
    });
    videocon.addEventListener("mouseleave", function () {
        gsap.to(playbtn, {
            scale: 0,
            opacity: 0,
        });
    });
    document.addEventListener("mousemove", function (dets) {
        gsap.to(playbtn, {
            left: dets.x - 70,
            top: dets.y - 80,
        });
    });
}
videoconAnimation();

function loadinganimation() {
    gsap.from("#page1 h1", {
        y: 100,
        opacity: 0,
        delay: 0.5,
        duration: 0.9,
        stagger: 0.3,
    });
    gsap.from("#page1 #video-container", {
        scale: 0.9,
        opacity: 0,
        delay: 1.3,
        duration: 0.5,
    });
}
loadinganimation();

function cursorAnimation() {
    document.addEventListener("mousemove", function (dets) {
        gsap.to("#cursor", {
            left: dets.x,
            top: dets.y,
        });
    });

    document.querySelectorAll(".child").forEach(function (elem) {
        elem.addEventListener("mouseenter", function () {
            gsap.to("#cursor", {
                transform: "translate(-50%,-50%) scale(1)",
            });
        });
        elem.addEventListener("mouseleave", function () {
            gsap.to("#cursor", {
                transform: "translate(-50%,-50%) scale(0)",
            });
        });
    });
}
cursorAnimation();



document.addEventListener("DOMContentLoaded", function () {
    const menuIcon = document.getElementById("icons");
    const navLinks = document.getElementById("links");

    if (menuIcon) {
        menuIcon.addEventListener("click", function () {
            navLinks.classList.toggle("show");
        });
    }

    // Close menu when clicking a link (Mobile)
    document.querySelectorAll("#links a").forEach(link => {
        link.addEventListener("click", function () {
            navLinks.classList.remove("show");
        });
    });

    // Highlight active link based on the current page
    const currentLocation = window.location.pathname.split("/").pop();
    document.querySelectorAll("#links a").forEach(link => {
        if (link.getAttribute("href") === currentLocation) {
            link.classList.add("active");
        }
    });
});







document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (name === "" || email === "" || message === "") {
        document.getElementById("formMessage").textContent = "Please fill in all fields!";
        document.getElementById("formMessage").style.color = "red";
        return;
    }

    document.getElementById("formMessage").textContent = "Message sent successfully!";
    document.getElementById("formMessage").style.color = "green";

    // Reset form after submission
    document.getElementById("contactForm").reset();
});








// // Top picks for users
// const topPicks = [
//     "To Kill a Mockingbird", "1984", "Pride and Prejudice", "The Great Gatsby",
//     "Moby-Dick", "War and Peace", "The Catcher in the Rye", "The Hobbit",
//     "Harry Potter and the Sorcerer's Stone", "Crime and Punishment"
// ];

// // Book Constructor
// function Book(name, author) {
//     this.id = Date.now();
//     this.name = name;
//     this.author = author;
// }

// // Logout Function (Redirect to Home Page)
// function logout() {
//     localStorage.removeItem("userSession");
//     location.href = "login.html";
// }

// // Display Books for Users
// function displayBooks() {
//     let books = JSON.parse(localStorage.getItem("books")) || [];
//     let tableBody = document.getElementById('tableBody');
//     if (tableBody) {
//         tableBody.innerHTML = books.map(book => 
//             `<tr><td>${book.name}</td><td>${book.author}</td><td>Available</td></tr>`
//         ).join('');
//     }
// }

// // Display Top Picks for Users
// function displayTopPicks() {
//     let list = document.getElementById("topPicks");
//     if (list) {
//         list.innerHTML = topPicks.map(book => 
//             `<li class='list-group-item text-dark'>${book}</li>`
//         ).join('');
//     }
// }

// // Display Books for Admins
// function displayAdminBooks() {
//     let books = JSON.parse(localStorage.getItem("books")) || [];
//     let tableBody = document.getElementById('adminTableBody');
//     if (tableBody) {
//         tableBody.innerHTML = books.map(book => 
//             `<tr><td>${book.name}</td><td>${book.author}</td>
//             <td><button class='btn btn-danger btn-sm' onclick="removeBook(${book.id})">Remove</button></td></tr>`
//         ).join('');
//     }
// }

// // Add New Book (Admin)
// document.addEventListener("DOMContentLoaded", function() {
//     let libraryForm = document.getElementById('libraryForm');
//     if (libraryForm) {
//         libraryForm.addEventListener('submit', function (e) {
//             e.preventDefault();
//             let name = document.getElementById('bookName').value;
//             let author = document.getElementById('author').value;
//             if (!name || !author) return alert("Book name and author are required!");
//             let books = JSON.parse(localStorage.getItem("books")) || [];
//             books.push(new Book(name, author));
//             localStorage.setItem("books", JSON.stringify(books));
//             displayAdminBooks();
//         });
//     }
// });

// // Remove Book (Admin)
// function removeBook(id) {
//     let books = JSON.parse(localStorage.getItem("books")) || [];
//     books = books.filter(book => book.id !== id);
//     localStorage.setItem("books", JSON.stringify(books));
//     displayAdminBooks();
// }

// // Initialize User or Admin Dashboard
// document.addEventListener("DOMContentLoaded", function() {
//     displayBooks();
//     displayTopPicks();
//     displayAdminBooks();
// });

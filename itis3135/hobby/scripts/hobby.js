const sections = document.querySelectorAll("main > section");
const navLinks = document.querySelectorAll("nav a");

function showSection() {
    let selectedSection = sections[0];

    sections.forEach((section) => {
        if ("#" + section.id === window.location.hash) {
            selectedSection = section;
        }
    });

    sections.forEach((section) => {
        section.hidden = section !== selectedSection;
    });

    navLinks.forEach((link) => {
        if (link.getAttribute("href") === "#" + selectedSection.id) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

window.addEventListener("hashchange", showSection);
showSection();

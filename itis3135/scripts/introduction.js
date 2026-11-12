"use strict";

const form = document.getElementById("introduction-form");
const fields = document.getElementById("form-fields");
const original = document.getElementById("original-introduction").content;
const originalItems = [...original.querySelector("ul").children];
const backgroundLabels = originalItems
    .slice(0, 8)
    .map((item) => item.querySelector("strong").textContent.replace(/:$/, ""));
const itemText = (item) => item.textContent.slice(item.querySelector("strong").textContent.length).trim();
const defaults = {
    firstName: "Binit",
    middleName: "",
    nickname: "B",
    lastName: "Pokharel",
    acknowledgment:
        "I, Binit Pokharel, agree to follow the expectations and responsibilities of the course contract for Fall 2026 ITIS 3135, Front-End Web App Development, with my instructor, Professor D.I. von Briesen.",
    acknowledgmentDate: "2026-09-10",
    prettyNameDivider: "|",
    adjectives: "Bold",
    animal: "Panther",
    img: original.querySelector("img").getAttribute("src"),
    pictureAlt: original.querySelector("img").alt,
    caption: original.querySelector("figcaption").textContent,
    personalInfo: "",
    backgrounds: originalItems.slice(0, 8).map(itemText),
    courses: [...original.querySelectorAll("ol > li")].map((item) => {
        const heading = item.querySelector("strong").textContent;
        const match = heading.match(/^(\S+) (\S+) – (.*):$/);
        return { department: match[1], number: match[2], name: match[3], reason: itemText(item) };
    }),
    quote: original.querySelector("blockquote p").textContent,
    quoteAuthor: original.querySelector("blockquote p:last-child").textContent.replace(/^- /, ""),
    funnyItem: itemText(originalItems[9]),
    somethingToShare: itemText(originalItems[10]),
    footerLinks: [
        { name: "CLT Web", href: "https://webpages.charlotte.edu/bpokhar3/" },
        { name: "GitHub.io", href: "https://binitpoks-code.github.io/" },
        { name: "GitHub", href: "https://github.com/binitpoks-code" },
        { name: "freeCodeCamp", href: "https://www.freecodecamp.org/binitpoks-code" },
        { name: "Codecademy", href: "https://www.codecademy.com/profiles/BinitPokharel" },
        { name: "LinkedIn", href: "https://www.linkedin.com/in/binit-pokharel-b342a7251" },
        { name: "ITIS3135.io", href: "https://binitpoks-code.github.io/itis3135/" }
    ]
};
let uploadedImage = "";
let courseId = 4;
const initialFields = fields.cloneNode(true);

function element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
}

function field(parent, key, label, value, options = {}) {
    const wrapper = element("div");
    if (options.long) wrapper.className = "full-width";
    const input = element(options.long ? "textarea" : "input");
    input.id = key;
    input.name = key;
    if (!options.long) input.type = options.type || "text";
    else input.rows = 2;
    input.value = value;
    input.required = !options.optional;
    input.placeholder = options.placeholder || `Enter ${label.toLowerCase().replace(" (optional)", "")}`;
    const caption = element("label", label);
    caption.htmlFor = key;
    wrapper.append(caption, input);
    parent.append(wrapper);
    return input;
}

function addCourse(course = { department: "", number: "", name: "", reason: "" }) {
    const section = element("fieldset");
    section.dataset.course = "";
    section.append(element("legend", "Course"));
    const grid = element("div");
    grid.className = "form-layout";
    const id = ++courseId;
    [
        ["department", "Department"],
        ["number", "Number"],
        ["name", "Course Name"],
        ["reason", "Reason"]
    ].forEach(([key, label]) => {
        const input = field(grid, `course-${id}-${key}`, label, course[key], { long: key === "reason" });
        input.dataset.key = key;
    });
    const remove = element("button", "Remove Course");
    remove.type = "button";
    remove.addEventListener("click", () => section.remove());
    section.append(grid, remove);
    document.getElementById("courses").append(section);
}

function releaseImage() {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    uploadedImage = "";
}

function validateAcknowledgmentDate() {
    const input = document.getElementById("acknowledgmentDate");
    const match = input.value.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
    let valid = false;
    if (match) {
        const month = Number(match[1]);
        const day = Number(match[2]);
        const year = Number(match[3]);
        const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        valid = year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
    }
    input.setCustomValidity(
        input.value && !valid ? "Enter a valid date in MM/DD/YYYY format." : ""
    );
}

function bindForm() {
    const dateInput = document.getElementById("acknowledgmentDate");
    dateInput.addEventListener("input", validateAcknowledgmentDate);
    dateInput.addEventListener("change", validateAcknowledgmentDate);
    validateAcknowledgmentDate();
    const upload = document.getElementById("picture");
    const image = document.getElementById("picture-preview");
    upload.addEventListener("change", () => {
        releaseImage();
        upload.setCustomValidity("");
        const file = upload.files[0];
        if (file && !file.type.startsWith("image/")) {
            upload.setCustomValidity("Please select an image file.");
            upload.reportValidity();
        } else if (file) uploadedImage = URL.createObjectURL(file);
        image.src = uploadedImage || defaults.img;
    });
    document.getElementById("pictureAlt").addEventListener("input", (event) => {
        image.alt = event.target.value;
    });
    document.getElementById("add-course").addEventListener("click", () => {
        addCourse();
        document.getElementById("courses").lastElementChild.querySelector("input").focus();
    });
    fields.querySelectorAll("[data-remove-course]").forEach((button) => {
        button.addEventListener("click", () => button.closest("fieldset").remove());
    });
}

function buildForm() {
    releaseImage();
    fields.replaceChildren(...initialFields.cloneNode(true).childNodes);
    courseId = 4;
    bindForm();
}

function readData() {
    const data = {};
    Object.keys(defaults)
        .filter((key) => !["img", "backgrounds", "courses", "footerLinks"].includes(key))
        .forEach((key) => {
            data[key] = form.elements.namedItem(key).value.trim();
        });
    const dateParts = data.acknowledgmentDate.split("/");
    data.acknowledgmentDate = [dateParts[2], dateParts[0], dateParts[1]].join("-");
    data.img = uploadedImage || defaults.img;
    data.backgrounds = backgroundLabels.map((label, index) => ({
        label,
        value: form.elements.namedItem(`background-${index}`).value.trim()
    }));
    data.courses = [...document.querySelectorAll("[data-course]")].map((section) =>
        Object.fromEntries(
            [...section.querySelectorAll("[data-key]")].map((input) => [
                input.dataset.key,
                input.value.trim()
            ])
        )
    );
    data.footerLinks = defaults.footerLinks.map((link, index) => ({
        name: form.elements.namedItem(`link-name-${index}`).value.trim(),
        href: form.elements.namedItem(`link-href-${index}`).value.trim()
    }));
    return data;
}

function render(data) {
    const result = element("div");
    const name = [data.firstName, data.middleName, data.nickname ? `'${data.nickname}'` : "", data.lastName]
        .filter(Boolean)
        .join(" ");
    result.append(element("h6", `${name} ${data.prettyNameDivider} ${data.adjectives} ${data.animal}`));
    const figure = element("figure");
    const image = element("img");
    image.src = data.img;
    image.alt = data.pictureAlt;
    figure.append(image, element("figcaption", data.caption));
    result.append(figure);
    if (data.personalInfo) result.append(element("p", data.personalInfo));
    const list = element("ul");
    function item(label, value) {
        const li = element("li");
        li.append(element("strong", `${label}:`), document.createTextNode(` ${value}`));
        list.append(li);
        return li;
    }
    data.backgrounds.forEach((background) => item(background.label, background.value));
    const courseList = element("ol");
    data.courses.forEach((course) => {
        const li = element("li");
        li.append(
            element("strong", `${course.department} ${course.number} – ${course.name}:`),
            document.createTextNode(` ${course.reason}`)
        );
        courseList.append(li);
    });
    item("Courses I'm Taking & Why", "").append(courseList);
    if (data.funnyItem) item("Funny/Interesting Item to Remember Me By", data.funnyItem);
    if (data.somethingToShare) item("I'd Also Like to Share", data.somethingToShare);
    result.append(list);
    const quote = element("blockquote");
    quote.append(element("p", data.quote), element("p", `- ${data.quoteAuthor}`));
    result.append(quote);
    const changedLinks = data.footerLinks.filter(
        (link, index) =>
            link.name !== defaults.footerLinks[index].name || link.href !== defaults.footerLinks[index].href
    );
    if (changedLinks.length) {
        const profileParagraph = element("p");
        data.footerLinks.forEach((link, index) => {
            if (index) profileParagraph.append(document.createTextNode(" | "));
            const anchor = element("a", link.name);
            const href = link.href.toLowerCase();
            if (href.startsWith("https://") || href.startsWith("http://")) anchor.href = link.href;
            profileParagraph.append(anchor);
        });
        result.append(profileParagraph);
    }
    return result;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    document.getElementById("introduction-result").replaceChildren(...render(readData()).childNodes);
    document.getElementById("form-interface").hidden = true;
    document.getElementById("result-interface").hidden = false;
    document.querySelector("main h2").scrollIntoView();
});
form.addEventListener("reset", (event) => {
    event.preventDefault();
    buildForm();
    document.getElementById("generated-output").value = "";
    document.getElementById("output-status").textContent = "Original information restored.";
});
document.getElementById("clear-form").addEventListener("click", () => {
    releaseImage();
    fields.querySelectorAll("input, textarea").forEach((input) => {
        input.value = "";
        input.setCustomValidity("");
    });
    document.getElementById("picture-preview").src = defaults.img;
    document.getElementById("picture-preview").alt = defaults.pictureAlt;
    document.getElementById("generated-output").value = "";
    document.getElementById("output-status").textContent = "Editable fields cleared.";
});
document.getElementById("return-form").addEventListener("click", () => {
    document.getElementById("result-interface").hidden = true;
    document.getElementById("form-interface").hidden = false;
    document.getElementById("firstName").focus();
});
function xmlNode(name, value, doc) {
    const node = doc.createElement(name);
    if (Array.isArray(value)) value.forEach((entry) => node.append(xmlNode("item", entry, doc)));
    else if (value && typeof value === "object")
        Object.entries(value).forEach(([key, entry]) => node.append(xmlNode(key, entry, doc)));
    else node.textContent = value;
    return node;
}
document.querySelectorAll("[data-format]").forEach((button) =>
    button.addEventListener("click", () => {
        if (!form.reportValidity()) return;
        const data = readData();
        let output;
        if (button.dataset.format === "json") output = JSON.stringify(data, null, 4);
        else if (button.dataset.format === "xml") {
            const doc = document.implementation.createDocument(null, "introduction");
            Object.entries(data).forEach(([key, value]) =>
                doc.documentElement.append(xmlNode(key, value, doc))
            );
            output = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(doc);
        } else {
            const doc = document.implementation.createHTMLDocument(document.title);
            doc.documentElement.lang = "en";
            const charset = doc.createElement("meta");
            charset.setAttribute("charset", "UTF-8");
            doc.head.prepend(charset);
            const main = doc.createElement("main");
            main.append(element("h2", "Introduction Form"), ...render(data).childNodes);
            doc.body.append(main);
            output = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
        }
        document.getElementById("generated-output").value = output;
        document.getElementById("output-status").textContent =
            `${button.dataset.format.toUpperCase()} generated. Uploaded images use a temporary browser URL.`;
    })
);
window.addEventListener("pagehide", (event) => {
    if (!event.persisted) releaseImage();
});
bindForm();

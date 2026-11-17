"use strict";

async function includeComponent(placeholder) {
    const componentPath = placeholder.getAttribute("data-include");
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error("Component unavailable: " + componentPath);
        placeholder.outerHTML = await response.text();
    } catch (error) {
        const notice = document.createElement("p");
        notice.setAttribute("role", "alert");
        notice.textContent = "Site navigation could not load. Please refresh this page using the local or hosted web server.";
        placeholder.replaceWith(notice);
        console.error(error);
    }
}

function initializeNavigation() {
    const navigation = document.getElementById("primary-navigation");
    const toggle = document.querySelector(".menu-toggle");
    if (!navigation || !toggle) return;
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    navigation.querySelectorAll("a").forEach((link) => {
        if (link.getAttribute("href") === currentPage) link.setAttribute("aria-current", "page");
    });
    const narrow = window.matchMedia("(max-width: 760px)");
    function setMenu(open) {
        navigation.hidden = narrow.matches && !open;
        toggle.setAttribute("aria-expanded", String(narrow.matches && open));
        toggle.textContent = open && narrow.matches ? "Close Menu" : "Menu";
    }
    function resizeMenu() {
        toggle.hidden = !narrow.matches;
        setMenu(false);
    }
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    navigation.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && narrow.matches) {
            setMenu(false);
            toggle.focus();
        }
    });
    toggle.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && narrow.matches) setMenu(false);
    });
    narrow.addEventListener("change", resizeMenu);
    resizeMenu();
}

function initializeFilters() {
    const controls = document.querySelector(".filters");
    if (!controls) return;
    const buttons = [...controls.querySelectorAll("[data-filter]")];
    const products = [...document.querySelectorAll("[data-category]")];
    const status = document.getElementById("catalog-status");
    function filterProducts(category, updateAddress = false) {
        const active = buttons.find((button) => button.dataset.filter === category) || buttons[0];
        buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === active)));
        let count = 0;
        products.forEach((product) => {
            product.hidden = active.dataset.filter !== "all" && product.dataset.category !== active.dataset.filter;
            if (!product.hidden) count++;
        });
        status.textContent = "Showing " + count + " of " + products.length + " pieces. Collection: " + active.textContent + ".";
        if (updateAddress) {
            const address = new URL(window.location.href);
            if (active.dataset.filter === "all") address.searchParams.delete("category");
            else address.searchParams.set("category", active.dataset.filter);
            window.history.replaceState(null, "", address);
        }
    }
    buttons.forEach((button) => button.addEventListener("click", () => filterProducts(button.dataset.filter, true)));
    controls.hidden = false;
    filterProducts(new URLSearchParams(window.location.search).get("category") || "all");
}

function initializeFitGuide() {
    const garment = document.getElementById("garment-type");
    const preference = document.getElementById("fit-preference");
    const result = document.getElementById("fit-result");
    if (!garment || !preference || !result) return;
    const shapes = {
        tops: "For jerseys and tees, compare chest width, shoulder room, and length with a top you already enjoy wearing.",
        layers: "For a tracksuit, check the jacket over your intended base layer, then check the pants at the waist, seat, and leg.",
        bottoms: "For shorts, start with a comfortable waist, then check room at the seat and thigh. A drawcord adjusts the waist, not the whole garment."
    };
    const fits = {
        regular: "Regular follows your shape without aiming for compression. Begin with your usual size label and compare finished measurements.",
        relaxed: "Relaxed leaves extra ease for comfortable movement. Look for the product's relaxed cut before choosing a larger label size.",
        oversized: "Oversized creates a deliberately roomy silhouette. Check shoulder drop and length as well as width; sizing up alone can change proportions."
    };
    function updateFit() {
        const accessories = garment.value === "accessories";
        preference.disabled = accessories;
        result.textContent = accessories
            ? "The Off Hours Cap has an adjustable strap; the Weekender Duffel is a carry item. Regular, relaxed, and oversized apparel fits do not apply. Check the final cap adjustment range or bag dimensions before a real purchase."
            : shapes[garment.value] + " " + fits[preference.value] + " Concept apparel range: XS to 4XL. This is fit guidance, not a guaranteed size recommendation.";
    }
    document.querySelector(".fit-controls").hidden = false;
    garment.addEventListener("change", updateFit);
    preference.addEventListener("change", updateFit);
    updateFit();
}

async function initializeSite() {
    await Promise.all([...document.querySelectorAll("[data-include]")].map(includeComponent));
    initializeNavigation();
    initializeFilters();
    initializeFitGuide();
}

initializeSite();

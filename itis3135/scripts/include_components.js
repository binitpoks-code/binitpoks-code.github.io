async function includeComponent(placeholder) {
    const path = placeholder.getAttribute("data-include");
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error("Could not load " + path + ": " + response.status);
        }
        placeholder.outerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
}

document.querySelectorAll("[data-include]").forEach(includeComponent);

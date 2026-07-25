"use client";

import { useEffect } from "react";

const quotes = [
    [
        "Perfection [in design] is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
        "Antoine de Saint-Exupery",
    ],
    [
        "Styles come and go. Good design is a language, not a style.",
        "Massimo Vignelli",
    ],
    [
        "Great things are done by a series of small things brought together.",
        "Vincent Van Gogh",
    ],
    ["Simplicity carried to an extreme becomes elegance.", "John Franklin"],
    ["Simplicity is the soul of efficiency.", "Austin Freeman"],
    ["Creativity takes courage.", "Henri Matisse"],
    [
        "The secret to creativity is knowing how to hide your sources",
        "Albert Einstein",
    ],
    ["Good design is obvious. Great design is transparent.", "Joe Sparano"],
    [
        "Design is not just what it looks like and feels like. Design is how it works",
        "Steve Jobs",
    ],
    ["The function of design is letting design function.", "Micha Commeren"],
    ["The details are not the details. They make the design", "Charles Eames"],
    [
        "Good design encourages a viewer to want to learn more.",
        "Alexander Isley",
    ],
];

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

function setParticles(particleColor, lineColor) {
    if (!window.particlesJS) return;

    window.particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: particleColor },
            shape: {
                type: "circle",
                stroke: { width: 0, color: "#000000" },
                polygon: { nb_sides: 5 },
                image: { src: "img/github.svg", width: 100, height: 100 },
            },
            opacity: {
                value: 0.5,
                random: false,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false,
                },
            },
            size: {
                value: 5,
                random: true,
                anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: lineColor,
                opacity: 0.4,
                width: 1,
            },
            move: {
                enable: true,
                speed: 5,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                attract: { enable: false, rotateX: 600, rotateY: 1200 },
            },
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: false, mode: "push" },
                resize: true,
            },
            modes: {
                grab: { distance: 400, line_linked: { opacity: 1 } },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3,
                },
                repulse: { distance: 200 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 },
            },
        },
        retina_detect: true,
    });
}

class TextRotate {
    constructor(element, toRotate, period) {
        this.toRotate = toRotate;
        this.element = element;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.text = "";
        this.isDeleting = false;
        this.tick();
    }

    tick() {
        const itemIndex = this.loopNum % this.toRotate.length;
        const fullText = this.toRotate[itemIndex];
        this.text = this.isDeleting
            ? fullText.substring(0, this.text.length - 1)
            : fullText.substring(0, this.text.length + 1);

        this.element.innerHTML = `<span class="wrap">${this.text}</span>`;
        let delta = 100 - 100 * Math.random();

        if (this.isDeleting) delta /= 2;

        if (!this.isDeleting && this.text === fullText) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.text === "") {
            this.isDeleting = false;
            this.loopNum += 1;
            delta = 500;
        }

        this.timeout = window.setTimeout(() => this.tick(), delta);
    }

    stop() {
        window.clearTimeout(this.timeout);
    }
}

export default function PortfolioEffects() {
    useEffect(() => {
        let rotation;
        let quoteHandler;
        let mounted = true;

        const randomQuote = () => {
            const quoteContent = document.getElementById("quote-content");
            const quoteAuthor = document.getElementById("quote-author");
            if (!quoteContent || !quoteAuthor) return;

            const [content, author] =
                quotes[Math.floor(Math.random() * quotes.length)];
            quoteContent.innerText = content;
            quoteAuthor.innerText = `~ ${author}`;
        };

        async function init() {
            await loadScript("/js/particles.js");
            await loadScript("/js/TagCloud.min.js");
            if (!mounted) return;

            setParticles("#ffffff", "#ffffff");
            window.setParticles = setParticles;
            window.setLightMode = () => {
                document.documentElement.classList.add("light-mode");
                const color = getComputedStyle(document.querySelector(":root"))
                    .getPropertyValue("--tertiary-color")
                    .trim();
                window.localStorage.setItem("alanvarghese-theme", "light");
                setParticles(color, color);
            };
            window.setDarkMode = () => {
                document.documentElement.classList.remove("light-mode");
                window.localStorage.setItem("alanvarghese-theme", "dark");
                setParticles("#ffffff", "#ffffff");
            };

            if (window.localStorage.getItem("alanvarghese-theme") === "light") {
                window.setLightMode();
            }

            const quoteContent = document.getElementById("quote-content");
            quoteHandler = randomQuote;
            quoteContent?.addEventListener("click", quoteHandler);
            randomQuote();

            if (window.TagCloud && document.querySelector(".tagcloud")) {
                window.TagCloud(
                    ".tagcloud",
                    [
                        "Python",
                        "JavaScript",
                        "React",
                        "C++",
                        "Django",
                        "Git",
                        "REST",
                        "Redis",
                        "MySQL",
                        "PostgreSQL",
                        "Tailwind",
                        "Redux",
                        "HTML",
                        "CSS",
                        "SASS",
                        "Docker",
                        "Next",
                        "FastApi",
                    ],
                    {
                        radius: window.outerWidth > 975 ? 250 : 160,
                        maxSpeed: "normal",
                    },
                );
            }

            const rotateText = document.getElementById("rotateText");
            if (rotateText?.dataset.rotate) {
                rotation = new TextRotate(
                    rotateText,
                    JSON.parse(rotateText.dataset.rotate),
                    rotateText.dataset.period,
                );
            }

            const style = document.createElement("style");
            style.id = "txt-rotate-style";
            style.innerHTML =
                ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
            document.body.appendChild(style);
        }

        init();

        return () => {
            mounted = false;
            rotation?.stop();
            document
                .getElementById("quote-content")
                ?.removeEventListener("click", quoteHandler);
            document.getElementById("txt-rotate-style")?.remove();
            window.pJSDom?.forEach((item) =>
                item.pJS?.fn?.vendors?.destroypJS?.(),
            );
            window.pJSDom = [];
        };
    }, []);

    return null;
}

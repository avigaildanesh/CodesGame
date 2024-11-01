import { CSSProperties } from "react";

function convertToCSS(css: CSSProperties): string {
    let cssString = "";
    Object.keys(css).forEach((key: string) => {
        cssString += key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`) + ": " + css[key as keyof CSSProperties] + ";\n";
    })
    return cssString;
}

export function createStyleSheet<T extends { [x: string]: CSSProperties }>(prefix: string, styles: T): { [key in keyof T]: string } {
    prefix += "-" + Date.now().toFixed() + "-"
    const style = document.createElement("style");
    const classes: { [key in keyof T]: string } = {} as { [key in keyof T]: string };
    let tagContent: string = "";
    Object.keys(styles).forEach((x: keyof T) => {
        classes[x] = prefix + x.toString();
        tagContent += `.${prefix + x.toString()} {\n${convertToCSS(styles[x])}\n}`
    });
    style.innerHTML = tagContent;
    document.head.appendChild(style);
    return classes;
}

export const mainColor = "#2e9372"
export const mainColorLight = "#5cc1a0"
export const secondaryColor = "rgba(100,112,255,1)"
export const secondaryColorLight = "rgba(150,112,255,1)"
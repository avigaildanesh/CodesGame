export function isNullOrWhiteSpace(str: string): boolean {
    return str === null || str.match(/^ *$/) !== null;
}
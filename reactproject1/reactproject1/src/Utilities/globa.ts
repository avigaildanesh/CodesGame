import { start } from "./Renderer";

function createOnceFunction(f: () => void) {
    let hasBeenCalled = false;

    return [function () {
        if (!hasBeenCalled && window.replayData && document.getElementById("myCanvas")) {
            f();
            hasBeenCalled = true;
            window.cancelReplay = false;
        } else {
            console.log('Function can only be called once.');
        }
    }, function () { hasBeenCalled = false; window.cancelReplay = true }];
}
export const [callOnce, release] = createOnceFunction(start);
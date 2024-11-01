
interface Window {
    cancelReplay: boolean,
    paused: boolean,
    duration: number,
    replayData: import("./Renderer").ReplayData,
    currentFrame: number,
    playing: boolean
}
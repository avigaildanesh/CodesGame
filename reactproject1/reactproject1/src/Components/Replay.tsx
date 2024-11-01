import { Component } from 'react'
// import { ReplayData } from '../Utilities/Renderer';
import { createStyleSheet } from '../Utilities/Style';
import { tryGetGame } from '../Utilities/Database';
import { GameResult } from '../Utilities/DataTypes';

const styles = createStyleSheet("ReplayComponent", {
    messagesContainer: {
        display: "flex",
        backgroundColor: "white",
        fontFamily: "Arial"
    },
    gameContainer: {
        display: "flex",
        flexDirection: "column"
    },
    controls: {
        display: "flex",
        justifyContent: "center",
        justifySelf: "center"
    },
    bot1Score: {
        fontSize: "larger",
        color: "black"
    },
    bot2Score: {
        fontSize: "larger",
        color: "black"
    },
    bot1Messages: {
        color: "blue"
    },
    bot2Messages: {
        color: "red"
    },
    canvas: {
        width: "100%",
        border: "1px solid black",
        backgroundColor: "black",
        maxHeight: "89vh"
    },


})

interface ReplayProps {
    // replayData: ReplayData | null
    callOnce(): void
    release(): void
}


export class ReplayComponent extends Component<ReplayProps> {

    constructor(props: ReplayProps) {
        super(props);
        window.playing = false;

        // make request
        const urlParams = new URLSearchParams(window.location.search);
        const id = Number(urlParams.get('id'));
        if (!Number.isNaN(id)) {
            tryGetGame(id).then((replayData: GameResult) => {
                window.replayData = JSON.parse(replayData.replayData);
                window.currentFrame = 0;
                this.props.callOnce();
            });
        }
    }
    public componentDidMount(): void {
        // if (window.replayData) {
        //     this.props.callOnce();
        // }

    }
    public componentWillUnmount(): void {
        this.props.release();
    }

    private pause() {
        window.paused = !window.paused;
    }

    private increaseSpeed() {
        window.duration /= 2;
    }

    private decreaseSpeed() {
        window.duration *= 2;
    }

    private setTurn(turn: number) {
        window.currentFrame = turn;
    }

    private lastTurn() {
        this.setTurn(window.replayData.States.length - 1);
    }

    private previousTurn() {
        if (window.currentFrame > 0)
            window.currentFrame -= 1;
    }

    private nextTurn() {
        if (window.currentFrame < window.replayData.States.length - 1)
            window.currentFrame += 1;
    }

    render() {
        return (
            <div className={styles.messagesContainer}>
                <div>
                </div>
                <div className={styles.gameContainer}>
                    <canvas id="myCanvas" className={styles.canvas}>Please enable canvas</canvas>
                    <div className={styles.controls}>
                        <div id="turnNumber"></div>
                        <button onClick={() => this.setTurn(0)}>&lt;|</button>
                        <button onClick={() => this.decreaseSpeed()}>&lt;&lt;</button>
                        <button onClick={() => this.previousTurn()}>&lt;</button>
                        <button onClick={() => this.pause()}>Pause/continue</button>
                        <button onClick={() => this.nextTurn()}>&gt;</button>
                        <button onClick={() => this.increaseSpeed()}>&gt;&gt;</button>
                        <button onClick={() => this.lastTurn()}>|&gt;</button>

                    </div>
                </div>
                <div>
                    <div id="bot2Score" className={styles.bot2Score}></div>
                    <div id="bot2Messages" className={styles.bot2Messages}></div>
                    <hr />
                    <div className={styles.bot1Score} id="bot1Score"></div>
                    <div className={styles.bot1Messages} id="bot1Messages"></div>
                </div>
            </div>
        )
    }
}

export const Replay = ReplayComponent
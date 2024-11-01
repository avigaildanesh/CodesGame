import { Component } from 'react'
import { GameResult, IUser } from '../Utilities/DataTypes'
import { ColumnDefinition, Table } from './TableComponent'
import { createStyleSheet, mainColor, mainColorLight, secondaryColor, secondaryColorLight } from '../Utilities/Style'
import { Dialog } from './Dialog'
import React from 'react'
import { isNullOrWhiteSpace } from '../Utilities/StringFunctions'
import { IRouterProps, withRouter } from '../Utilities/withRouter'
import { tryGetGameHistory, tryReportGame } from '../Utilities/Database'

const styles = createStyleSheet("HistoryComponent", {
    container: {
        transition: "1s",
    },
    header: {
        fontSize: "1.2rem",
        textAlign: "center",
        width: "100%"
    },
    addNewHistoryButton: {
        width: "10em",
        transition: "0.5s",
        height: "2.5em",
        borderRadius: "1em",
        cursor: "pointer",
        backgroundColor: mainColorLight,
        color: "black",
        border: "1px solid grey",
        boxShadow: "0 0 10px whitesmoke",
        marginLeft: "auto",
        fontSize: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
    },
    "addNewHistoryButton:hover": {
        transition: "1s",
        backgroundColor: mainColor,
        color: "white",
        border: "3px solid black",
        boxShadow: "0 0 20px whitesmoke",
        width: "12.5em",
        height: "3.125em",
    },
    noButton: {
        width: "10em",
        transition: "0.5s",
        height: "2.5em",
        borderRadius: "1em",
        cursor: "pointer",
        backgroundColor: secondaryColorLight,
        color: "black",
        border: "1px solid grey",
        boxShadow: "0 0 10px whitesmoke",
        marginLeft: "auto",
        fontSize: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
    },
    "noButton:hover": {
        transition: "1s",
        backgroundColor: secondaryColor,
        color: "white",
        border: "3px solid black",
        boxShadow: "0 0 20px whitesmoke",
        width: "12.5em",
        height: "3.125em",
    },
    dialogWrapper: {
        width: "100%",
    },
    divider: {
        height: "1px",
        width: "100%",
        margin: "0.3em"
    },
    dialogTitle: {
        fontSize: "1.2rem",
    },
    inputDiv: {
        display: "flex",
        margin: "0.5em",
        alignItems: "center",
        rowGap: "0.5em",
        color: "#fff5d6",
    },
    input: {
        fontSize: "1.2rem",
        height: "2em",
        flex: "auto",
        width: "100%",
    },
    errorInput: {
        fontSize: "1.2rem",
        height: "2em",
        border: "2px solid red",
        flex: "auto",
        width: "100%",
    },
    "errorInput::placeholder": {
        color: "red",
        opacity: 0.7
    },
    actionButton: {
        cursor: "pointer",
        color: mainColor,
        textDecoration: `underline`
    },
    rejectButton: {
        cursor: "pointer",
        color: secondaryColor,
        textDecoration: "underline"
    }
})


interface HistoryComponentProps {
    user: IUser
}

type HistoryProps = HistoryComponentProps & IRouterProps

interface HistoryComponentState {
    dialogOpen: boolean
    dialogTitle: string
    dialogContent(): React.JSX.Element
    reportValue: string,
    history: GameResult[] | null
}


class HistoryComponent extends Component<HistoryProps, HistoryComponentState> {


    private columnDefinitions: ColumnDefinition<GameResult>[] = [
        {
            fieldName: "id",
            label: "Title",
            displayFunction: (item) => `${item.user1.displayName} vs ${item.user2.displayName}`,
        },
        {
            fieldName: "winner",
            label: "Winner"
        },
        {
            fieldName: "user1Score",
            label: "Score of user1"
        },
        {
            fieldName: "user2Score",
            label: "Score of user2"
        },
        {
            fieldName: "winner",
            label: "Winner"
        },
        {
            fieldName: "id",
            label: "Actions",
            displayFunction: (item) => (<div>
                <div className={styles.actionButton} onClick={() => this.watchGame(item)}>Watch</div>
                <div className={styles.actionButton} onClick={() => this.openReportDialog(item)}>Report</div>
            </div>)
        }
    ]

    private watchGame(item: GameResult) {
        this.props.changePage(`/replay?id=${item.id}`)
    }

    private async report(item: GameResult) {
        if (await tryReportGame(item, this.state.reportValue)) {
            alert("Report sent")
        }
        else {
            alert("Failed to send report")
        }
        this.setState({ dialogOpen: false, reportValue: "" })
    }

    private openReportDialog(item: GameResult) {
        this.setState({
            dialogOpen: true, dialogTitle: `Report a game`,
            dialogContent: () => (
                <div>
                    <div className={styles.inputDiv}>
                        <textarea style={{ width: "100%", height: "12em" }} value={this.state.reportValue} onChange={(e) => this.setState({ reportValue: e.target.value })} />
                    </div>
                    <div
                        className={styles.addNewHistoryButton}
                        onClick={() => !isNullOrWhiteSpace(this.state.reportValue) && this.report(item)}>Submit</div>
                </div>
            )
        })
    }

    public async componentDidMount() {
        const result = await tryGetGameHistory();
        this.setState({ history: result });
    }


    constructor(props: HistoryProps) {
        super(props);
        this.state = {
            dialogContent: () => <div></div>,
            dialogOpen: false,
            dialogTitle: "",
            reportValue: "",
            history: null
        }
    }

    render() {
        return (
            <>
                <Dialog onBackdropClick={() => this.setState({ dialogOpen: false })} isOpen={this.state.dialogOpen} >
                    <div className={styles.dialogWrapper}>
                        <div className={styles.dialogTitle}>{this.state.dialogTitle}</div>
                        <div className={styles.divider} />
                        <div>
                            {this.state.dialogContent()}
                        </div>
                    </div>
                </Dialog>
                <div className={styles.container}>
                    <div className={styles.header}>View History</div>
                    <hr />
                    {
                        this.state.history && this.state.history.length > 0 ?
                            <Table columnDefintions={this.columnDefinitions} data={this.state.history} itemsPerPage={10} />
                            :
                            <div>You don't have any game history</div>
                    }

                </div>
            </>
        )
    }
}

export const History = withRouter(HistoryComponent)
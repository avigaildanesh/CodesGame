import { Component } from 'react'
import { GameReport, IUser } from '../Utilities/DataTypes'
import { ColumnDefinition, Table } from './TableComponent'
import { createStyleSheet, mainColor, mainColorLight, secondaryColor, secondaryColorLight } from '../Utilities/Style'
import { Dialog } from './Dialog'
import React from 'react'
import { tryBanUser, tryDeleteReport, tryGetAllReports } from '../Utilities/Database'

const styles = createStyleSheet("ReportComponent", {
    container: {
        transition: "1s",
    },
    header: {
        fontSize: "1.2rem",
        textAlign: "center",
        width: "100%"
    },
    addNewReportButton: {
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
    "addNewReportButton:hover": {
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


interface ReportComponentProps {
    user: IUser
}

type ReportProps = ReportComponentProps

interface ReportComponentState {
    dialogOpen: boolean
    dialogTitle: string
    dialogContent(): React.JSX.Element
    reports: GameReport[] | null
}


class ReportComponent extends Component<ReportProps, ReportComponentState> {


    private columnDefinitions: ColumnDefinition<GameReport>[] = [
        {
            fieldName: "id",
            label: "Id",
        },
        {
            fieldName: "gameResultId",
            label: "Game Id"
        },
        {
            fieldName: "reporterId",
            label: "Reporter"
        },
        {
            fieldName: "reportContent",
            label: "Message"
        },
        {
            fieldName: "id",
            label: "Actions",
            displayFunction: (item) => (<div>
                <div className={styles.actionButton} onClick={() => this.openBanUserDialog(item)}>Ban</div>
                <div className={styles.actionButton} onClick={() => this.openDeleteDialog(item)}>Delete</div>
            </div>)
        }
    ]


    private openBanUserDialog(item: GameReport): void {
        const otherUser = item.reporterId == item.gameResult.user1Id ? item.gameResult.user2 : item.gameResult.user1;
        this.setState({
            dialogOpen: true, dialogTitle: `Are you sure you want to ban ${otherUser.username}?`,
            dialogContent: () => (<div style={{ display: "flex" }}>
                <div className={styles.addNewReportButton} onClick={() => this.banUser(item, otherUser)}>Yes</div>
                <div className={styles.noButton} onClick={() => this.setState({ dialogOpen: false })}>Cancel</div>
            </div>)
        })
    }

    private openDeleteDialog(item: GameReport): void {
        this.setState({
            dialogOpen: true, dialogTitle: `Are you sure you want to delete this report?`,
            dialogContent: () => (<div style={{ display: "flex" }}>
                <div className={styles.addNewReportButton} onClick={() => this.deleteReport(item)}>Yes, delete it</div>
                <div className={styles.noButton} onClick={() => this.setState({ dialogOpen: false })}>Cancel</div>
            </div>)
        })
    }

    private async deleteReport(item: GameReport) {
        const reports = await tryDeleteReport(item.id);
        if (reports) {
            alert("Deleted report sucessfully");
            this.setState({ reports: reports, dialogOpen: false });
        }
        else {
            alert("Failed to delete result")
        }
    }

    private async banUser(item: GameReport, otherUser: IUser) {
        const reports = await tryBanUser(otherUser.id, item.id);
        if (reports) {
            alert("Banned user sucessfully");
            this.setState({ reports: reports, dialogOpen: false });
        }
        else {
            alert("Failed to ban user")
        }
    }

    public async componentDidMount() {
        const result = await tryGetAllReports();
        this.setState({ reports: result });
    }


    constructor(props: ReportProps) {
        super(props);
        this.state = {
            dialogContent: () => <div></div>,
            dialogOpen: false,
            dialogTitle: "",
            reports: null
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
                    <div className={styles.header}>View Report</div>
                    <hr />
                    {
                        this.state.reports && this.state.reports.length > 0 ?
                            <Table columnDefintions={this.columnDefinitions} data={this.state.reports} itemsPerPage={10} />
                            :
                            <div>There aren't any game reports</div>
                    }

                </div>
            </>
        )
    }
}

export const Report = ReportComponent
import { Component } from 'react'
import { IUser, UserCode } from '../Utilities/DataTypes'
import { ColumnDefinition, Table } from './TableComponent'
import { createStyleSheet, mainColor, mainColorLight, secondaryColor, secondaryColorLight } from '../Utilities/Style'
import { Dialog } from './Dialog'
import React from 'react'
import { tryCreateCode, tryDeleteCode, tryEditCode, trySelectCode } from '../Utilities/Database'
import { isNullOrWhiteSpace } from '../Utilities/StringFunctions'

const styles = createStyleSheet("CodesComponent", {
    container: {
        transition: "1s",
    },
    header: {
        fontSize: "1.2rem",
        textAlign: "center",
        width: "100%"
    },
    addNewCodeButton: {
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
    "addNewCodeButton:hover": {
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


interface CodesComponentProps {
    user: IUser
    onCodesChange(codes: UserCode[]): void
}

interface CodesComponentState {
    dialogOpen: boolean
    dialogTitle: string
    dialogContent(): React.JSX.Element
    codeTitle: string
    codeTitleEmpty: boolean
    selectedFile?: File | null
}


class CodesComponent extends Component<CodesComponentProps, CodesComponentState> {


    private columnDefinitions: ColumnDefinition<UserCode>[] = [
        {
            fieldName: "title",
            label: "Title"
        },
        {
            fieldName: "createdDate",
            label: "Created At"
        },
        {
            fieldName: "id",
            label: "Actions",
            displayFunction: (item) => (<div>
                <div className={styles.actionButton} onClick={() => this.downloadCode(item)}>Download</div>
                {
                    this.props.user.selectedCode?.id != item.id &&
                    <>
                        <div className={styles.actionButton} onClick={() => this.selectCode(item)}>Select</div>
                        <div className={styles.rejectButton} onClick={() => this.showDeleteCodeDialog(item)}>Delete</div>
                    </>
                }
                <div className={styles.actionButton} onClick={() => this.openEditCode(item)}>Edit</div>
            </div>)
        }
    ]

    private async selectCode(item: UserCode) {
        const newCodes = await trySelectCode(item.id);
        if (newCodes != false) {
            this.setState({ dialogOpen: false });
            this.props.onCodesChange(newCodes);
        }
        else {
            alert("Failed to select code");
        }
    }

    private async deleteCode(item: UserCode) {
        const newCodes = await tryDeleteCode(item.id);
        if (newCodes != false) {
            this.setState({ dialogOpen: false });
            this.props.onCodesChange(newCodes);
        }
        else {
            alert("Failed to delete code");
        }
    }

    private showDeleteCodeDialog(item: UserCode): void {
        this.setState({
            dialogOpen: true, dialogTitle: `Are you sure you want to delete ${item.title}?`,
            dialogContent: () => (<div style={{ display: "flex" }}>
                <div className={styles.addNewCodeButton} onClick={() => this.deleteCode(item)}>Yes, delete it</div>
                <div className={styles.noButton} onClick={() => this.setState({ dialogOpen: false })}>Cancel</div>
            </div>)
        })
    }

    private async addNewCode() {
        const content = await this.state.selectedFile?.text();
        const codes = await tryCreateCode(this.state.codeTitle, content!);
        if (codes) {
            this.props.onCodesChange(codes);
            this.setState({ dialogOpen: false });
            alert("Code Added successfully!");
        }
        else {
            alert("Failed to change code!");
        }

    }

    private openNewCodeDialog() {
        this.setState({
            dialogOpen: true, dialogTitle: `Add new code`,
            dialogContent: () => (
                <div>
                    <div className={styles.inputDiv}>
                        <input className={this.state.codeTitleEmpty ? styles.errorInput : styles.input}
                            {...(this.state.codeTitleEmpty ? { placeholder: "TITLE CAN'T BE EMPTYYYYYY!!!!" } : { placeholder: "Title" })}
                            value={this.state.codeTitle}
                            onChange={(ev) => this.setState({ codeTitle: ev.target.value, codeTitleEmpty: isNullOrWhiteSpace(ev.target.value) })}
                            type="text" />
                    </div>
                    <input type="file" onChange={(e) => this.setState({ selectedFile: e.target.files?.item(0) })} />
                    <div
                        className={styles.addNewCodeButton}
                        onClick={() => isNullOrWhiteSpace(this.state.codeTitle) ? this.setState({ codeTitleEmpty: true }) : this.addNewCode()}>Add</div>
                </div>
            )
        })
    }

    private async editCode(id: number) {
        const codes = await tryEditCode(id, this.state.codeTitle, await this.state.selectedFile!.text());
        if (codes != false) {
            this.props.onCodesChange(codes);
            this.setState({ dialogOpen: false });
            alert("Code edited successfully");
        }
        else {
            alert("Failed to edit code");
        }
    }

    private openEditCode(item: UserCode): void {
        this.setState({
            dialogOpen: true,
            dialogTitle: `Edit code`,
            codeTitle: item.title,
            dialogContent: () => (
                <div>
                    <div className={styles.inputDiv}>
                        <input className={this.state.codeTitleEmpty ? styles.errorInput : styles.input}
                            {...(this.state.codeTitleEmpty ? { placeholder: "TITLE CAN'T BE EMPTYYYYYY!!!!" } : { placeholder: "Title" })}
                            value={this.state.codeTitle}
                            onChange={(ev) => this.setState({ codeTitle: ev.target.value, codeTitleEmpty: isNullOrWhiteSpace(ev.target.value) })}
                            type="text" />
                    </div>
                    <input type="file" onChange={(e) => this.setState({ selectedFile: e.target.files?.item(0) })} />
                    <div
                        className={styles.addNewCodeButton}
                        onClick={() => isNullOrWhiteSpace(this.state.codeTitle) ? this.setState({ codeTitleEmpty: true }) : this.editCode(item.id)}>Save</div>
                </div>
            )
        })
    }

    private downloadCode(item: UserCode): void {
        const a = document.createElement('a');
        a.href = `data:text/plain,${item.code}`;
        a.download = `${item.title}.cs`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
    }

    constructor(props: CodesComponentProps) {
        super(props);
        this.state = {
            dialogContent: () => <div></div>,
            dialogOpen: false,
            dialogTitle: "",
            codeTitle: "",
            codeTitleEmpty: false,
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
                    <div className={styles.header}>Manage Codes</div>
                    <div className={styles.addNewCodeButton} onClick={() => this.openNewCodeDialog()}>New code</div>
                    <hr />
                    {
                        this.props.user.userCodes && this.props.user.userCodes.length > 0 ?
                            <Table columnDefintions={this.columnDefinitions} data={this.props.user.userCodes} itemsPerPage={10} />
                            :
                            <div>You didn't upload any code</div>
                    }

                </div>
            </>
        )
    }
}

export const Codes = CodesComponent
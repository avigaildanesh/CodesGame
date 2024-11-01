import { ChangeEvent, Component } from "react"
import { IUser, Role } from "../Utilities/DataTypes";
import { createStyleSheet } from "../Utilities/Style";
import { getUserProfile, tryChange } from "../Utilities/Database";

const styles = createStyleSheet("ProfileComponent", {
    input: {
        fontSize: "1.2rem",
        height: "2em",
        flex: "auto",
        boxSizing: "border-box",
        display: "flex",
        margin: "0.5em 0",
        alignItems: "center",
        rowGap: "0.5em",
    },
    errorInput: {
        fontSize: "1.2rem",
        height: "2em",
        border: "2px solid red",
        boxSizing: "border-box",
        flex: "auto",
        display: "flex",
        margin: "0.5em 0",
        alignItems: "center",
        rowGap: "0.5em",
    },
    "errorInput::placeholder": {
        color: "red",
        opacity: 0.7
    },
    EditButton: {
        transition: "0.5s",
        backgroundColor: "#5cc1a0",
        color: "white",
        border: "1px solid black",
        lineHeight: "2em",
        cursor: "pointer",
        margin: "0.5em"
    },
    "EditButton:hover": {
        transition: "0.5s",
        backgroundColor: "#2e9372",
        boxShadow: "1px 0px 5px"
    },
    link: {
        color: "blue",
        cursor: "pointer"
    },
    errorSpan: {
        color: "red",
        fontSize: "2em"
    },
    container: {
        display: "flex"
    },
    image: {

        borderRadius: "100%",
    },
    pfpContainer: {
        transition: "1s",
        padding: "2em"
    },
    infoContainer: {
        transition: "1s",
        fontSize: "1.2rem",
        width: "100%",
        margin: "5em"
    },
    fieldContainer: {
        transition: "1s",
        display:"flex"
    },
    fieldName: {
        transition: "1s",
        margin: "1em",
        width: "15%"
    },
    fieldValue: {
        transition: "1s",
        padding: "1em 0",

    },
    header: {
        fontSize: "1.2rem",
        textAlign: "center",
        width: "100%"
    },

})
interface IProfileProps {
    currentUser: IUser
}
interface IProfileState {
    password: string,
    badPassword: boolean,
    nickname: string,
    nicknameEmpty: boolean,
    confirmPassword: string,
    confirmPasswordBad: boolean,
    editFailed?: boolean,
    editMode: boolean,
    role?: Role,
    userProfile?: IUser
    fetchFailed: boolean
}

class ProfileComponent extends Component<IProfileProps, IProfileState> {

    constructor(props: IProfileProps) {
        super(props);
        this.state = {
            password: "",
            badPassword: false,
            nickname: "",
            nicknameEmpty: false,
            confirmPassword: "",
            confirmPasswordBad: false,
            editMode: false,
            fetchFailed: false,
        }
    }

    public async componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        if (!this.state.userProfile && !this.state.fetchFailed) {
            if (!username) {
                this.setState({ userProfile: this.props.currentUser });
                return;
            }

            try {
                const userProfile = await getUserProfile(username);
                if (userProfile) {
                    this.setState({ userProfile: userProfile });
                }
            }
            catch (e) {
                console.log(e)
                this.setState({ fetchFailed: true })
            }
        }
    }

    async Edit() {
        let error = false;
        if (this.state.password === "") {
            this.setState({ badPassword: true })
            error = true;
        }
        if (this.state.nickname === "") {
            this.setState({ nicknameEmpty: true });
            error = true;
        }
        if (!/.*[A-z]+.*/.test(this.state.password) || !/.*[0-9]+.*/.test(this.state.password)) {
            this.setState({ badPassword: true });
            error = true;
        }
        if (this.state.password !== this.state.confirmPassword) {
            this.setState({ confirmPasswordBad: true });
            error = true;
        }
        if (error) {
            return;
        }

        if (!(await tryChange(this.state.userProfile!.username, this.state.password, this.state.nickname, this.state.role!))) {
            this.setState({ editFailed: true });
            return;
        }
        else {
            this.setState({ editMode: false, editFailed: false });
        }
    }

    nicknameChanged(newValue: ChangeEvent<HTMLInputElement>) {
        const nickname = newValue?.currentTarget.value;
        this.setState({ nickname, nicknameEmpty: nickname === "" })
    }

    passwordChanged(newValue: ChangeEvent<HTMLInputElement>) {
        const password = newValue?.currentTarget.value;;
        this.setState({
            password,
            confirmPasswordBad: password === this.state.confirmPassword,
            badPassword: !/.*[A-z]+.*/.test(password) || !/.*[0-9]+.*/.test(password)
        });
    }

    confirmPasswordChanged(newValue: ChangeEvent<HTMLInputElement>) {
        const confirmPassword = newValue?.currentTarget.value;
        this.setState({ confirmPassword, confirmPasswordBad: confirmPassword !== this.state.password });
    }

    public render() {
        if (!this.state.userProfile) {
            return <div>Loading..</div>
        }
        return (
            <div className={styles.container}>
                <div className={styles.pfpContainer} ><img className={styles.image} src="img/default_pfp.jpg" alt="" /></div>
                <div className={styles.infoContainer}>
                    <div className={styles.fieldContainer}>
                        <div className={styles.fieldName}>Username:</div>
                        <div className={styles.fieldValue}>{this.state.userProfile.username}</div>
                    </div>
                    <div className={styles.fieldContainer}>
                        <div className={styles.fieldName}>Display name:</div>
                        {this.state.editMode ?
                            <input className={this.state.nicknameEmpty ? styles.errorInput : styles.input}
                                {...(this.state.nicknameEmpty ? { placeholder: "NICKNAME CAN'T BE EMPTYYYYYY!!!!" } : { placeholder: "Nickname" })}
                                value={this.state.nickname}
                                onChange={(ev) => this.nicknameChanged(ev)}
                                type="text"
                                onKeyDown={e => e.key === "Enter" && this.Edit()} />
                            :
                            <div className={styles.fieldValue}>{this.state.userProfile.displayName}</div>}
                    </div>
                    {((this.props.currentUser.username == this.state.userProfile.username || this.props.currentUser.role >= Role.Admin) && this.state.editMode) &&
                        <>
                            <div className={styles.fieldContainer}>
                                <div className={styles.fieldName}>Password:</div>

                                <input className={this.state.badPassword ? styles.errorInput : styles.input}
                                    {...(this.state.badPassword ? { placeholder: "BAD PASSWORD!!!!" } : { placeholder: "Password" })}
                                    value={this.state.password}
                                    onChange={(ev) => this.passwordChanged(ev)}
                                    type="password"
                                    onKeyDown={e => e.key === "Enter" && this.Edit()} />

                            </div>
                            <div className={styles.fieldContainer}>
                                <div className={styles.fieldName}>Confirm Password:</div>

                                <input className={this.state.confirmPasswordBad ? styles.errorInput : styles.input}
                                    {...(this.state.confirmPasswordBad ? { placeholder: "WTFFF YOUR PASSWORDS DON'T MATCH!!!!" } : { placeholder: "Confirm password" })}
                                    value={this.state.confirmPassword}
                                    onChange={(ev) => this.confirmPasswordChanged(ev)}
                                    type="password"
                                    onKeyDown={e => e.key === "Enter" && this.Edit()} />

                            </div>
                        </>
                    }
                    {this.state.editFailed && <span className={styles.errorSpan}>Failed to save changes</span>}

                    {(this.props.currentUser.username == this.state.userProfile.username || this.props.currentUser.role >= Role.Admin)
                        && this.state.editMode ? <div className={styles.EditButton} onClick={() => this.Edit()} >Save</div>
                        : <div className={styles.EditButton} onClick={() => this.setState({ editMode: true })}>Edit</div>}
                </div>





            </div>
        )
    }
}

export const Profile = ProfileComponent
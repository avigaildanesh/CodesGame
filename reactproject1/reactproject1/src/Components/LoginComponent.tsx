import { ChangeEvent, Component } from 'react'
import { tryLogin } from '../Utilities/Database';
import { createStyleSheet } from '../Utilities/Style'
import { withRouter } from '../Utilities/withRouter';
import { ILoginProps, IUser } from '../Utilities/DataTypes';
import { IRouterProps } from '../Utilities/withRouter';

const styles = createStyleSheet("LoginComponent", {
    flexDiv: {
        transition: "1s",
        backgroundColor: "#b5bcc89c",
        borderRadius: "0.5em",
    },
    loginButtonDiv: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "0.5em",
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
    loginDiv: {
        display: "flex",
        flex: "auto",
    },
    loginButton: {
        transition: "0.5s",
        backgroundColor: "#5cc1a0",
        color: "white",
        border: "1px solid black",
        height: "2em",
        maxHeight: "2em",
        lineHeight: "2em",
        textAlign: "center",
        cursor: "pointer",
        flex: "auto",
        width: "100%",
    },
    "loginButton:hover": {
        transition: "0.5s",
        color: "grey",
        backgroundColor: "#5cc1a0",
        boxShadow: "1px 0px 5px"
    },
    link: {
        color: "blue",
        cursor: "pointer"
    },
    errorSpan: {
        color: "red",
        fontSize: "2em"
    }
})

interface ILoginState {
    username: string;
    password: string;
    usernameEmpty: boolean;
    passwordEmpty: boolean;
    loginFailed?: boolean;
}

type ILoginComponentProps = ILoginProps & IRouterProps

export class LoginComponent extends Component<ILoginComponentProps, ILoginState> {
    constructor(props: ILoginComponentProps) {
        super(props);
        this.state = { username: "", password: "", usernameEmpty: false, passwordEmpty: false }
    }

    async login() {
        let error = false;
        if (this.state.username === "") {
            this.setState({ usernameEmpty: true })
            error = true;
        }
        if (this.state.password === "") {
            this.setState({ passwordEmpty: true })
            error = true;
        }

        if (error) {
            return;
        }

        const user: IUser = await tryLogin(this.state.username, this.state.password)
        if (user) {
            this.props.onLogin(user)
        }
        else {
            this.setState({ loginFailed: true })
        }
    }

    usernameChanged(newValue: ChangeEvent<HTMLInputElement>) {
        const username = newValue.currentTarget.value;
        this.setState({ username, usernameEmpty: username === "" })
    }

    passwordChanged(newValue: ChangeEvent<HTMLInputElement>) {
        const password = newValue.currentTarget.value;
        this.setState({ password, passwordEmpty: password === "" })
    }

    render() {
        return (
            <div className={styles.flexDiv}>
                <div className={styles.inputDiv}>
                    <input className={this.state.usernameEmpty ? styles.errorInput : styles.input}
                        {...(this.state.usernameEmpty ? { placeholder: "USERNAME CAN'T BE EMPTYYYYYY!!!!" } : { placeholder: "Username" })}
                        value={this.state.username}
                        onChange={(ev) => this.usernameChanged(ev)}
                        type="text"
                        onKeyDown={e => e.key === "Enter" && this.login()} />
                </div>
                <div className={styles.inputDiv}>
                    <input className={this.state.passwordEmpty ? styles.errorInput : styles.input}
                        {...(this.state.passwordEmpty ? { placeholder: "PASSWORD CAN'T BE EMPTYYYYYY!!!!" } : { placeholder: "Password" })}
                        value={this.state.password}
                        onChange={(ev) => this.passwordChanged(ev)}
                        type="password"
                        onKeyDown={e => e.key === "Enter" && this.login()} />
                </div>
                {this.state.loginFailed && <span className={styles.errorSpan}>Login failed!</span>}
                <div className={styles.loginButtonDiv}>
                    <div className={styles.loginButton} onClick={() => this.login()} >Login</div>
                    <div>Not registered? </div>
                    <div><span className={styles.link} onClick={() => this.props.changePage("/register")}>Click here</span> to register</div>
                </div>
            </div>
        )
    }
}

export const Login = withRouter(LoginComponent)
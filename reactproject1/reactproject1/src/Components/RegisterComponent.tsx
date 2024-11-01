import { ChangeEvent, Component } from 'react'
import { tryLogin, tryRegister } from '../Utilities/Database';
import { createStyleSheet } from '../Utilities/Style'
import { IRouterProps, withRouter } from '../Utilities/withRouter';
import { ILoginProps, IUser } from '../Utilities/DataTypes';

const styles = createStyleSheet("RegisterComponent", {
    input: {
        fontSize: "1.2rem",
        height: "2em",
        flex: "auto",
        boxSizing: "border-box",
        display: "flex",
        margin: "0.5em 0.5em 0 0.5em",
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
        margin: "0.5em 0.5em 0 0.5em",
        alignItems: "center",
        rowGap: "0.5em",
    },
    "errorInput::placeholder": {
        color: "red",
        opacity: 0.7
    },
    RegisterButton: {
        transition: "0.5s",
        backgroundColor: "#5cc1a0",
        color: "white",
        border: "1px solid black",
        lineHeight: "2em",
        cursor: "pointer",
        margin: "0.5em"
    },
    "RegisterButton:hover": {
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
        // padding: "1em",
        backgroundColor: "#b5bcc89c",
        textAlign: "center",
        borderRadius: "0.5em",
        display: "flex",
        flexDirection: "column"
    }
})

interface IRegisterState {
    username: string,
    password: string,
    usernameEmpty: boolean,
    badPassword: boolean,
    nickname: string,
    nicknameEmpty: boolean,
    confirmPassword: string,
    confirmPasswordBad: boolean,
    RegisterFailed?: boolean,
}

type IRegisterProps = ILoginProps & IRouterProps

class RegisterComponent extends Component<IRegisterProps, IRegisterState> {

    constructor(props: IRegisterProps) {
        super(props);
        this.state = {
            username: "",
            password: "",
            usernameEmpty: false,
            badPassword: false,
            nickname: "",
            nicknameEmpty: false,
            confirmPassword: "",
            confirmPasswordBad: false,
        }
    }

    async Register() {
        let error = false;
        if (this.state.username === "") {
            this.setState({ usernameEmpty: true });
            error = true;
        }
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

        if (!(await tryRegister(this.state.username, this.state.password, this.state.nickname))) {
            this.setState({ RegisterFailed: true });
            return;
        }
        const user: IUser = await tryLogin(this.state.username, this.state.password);
        if (user) {
            this.props.onLogin(user)
        }
        else {
            this.setState({ RegisterFailed: true })
        }
    }

    usernameChanged(newValue: ChangeEvent<HTMLInputElement>) {
        const username = newValue?.currentTarget.value;
        this.setState({ username, usernameEmpty: username === "" })
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

    render() {
        return (
            <div className={styles.container}>
                <input className={this.state.usernameEmpty ? styles.errorInput : styles.input}
                    {...(this.state.usernameEmpty ? { placeholder: "USERNAME CAN'T BE EMPTYYYYYY!!!!" } : { placeholder: "Username" })}
                    value={this.state.username}
                    onChange={(ev) => this.usernameChanged(ev)}
                    type="text"
                    onKeyDown={e => e.key === "Enter" && this.Register()} />
                <input className={this.state.nicknameEmpty ? styles.errorInput : styles.input}
                    {...(this.state.nicknameEmpty ? { placeholder: "NICKNAME CAN'T BE EMPTYYYYYY!!!!" } : { placeholder: "Nickname" })}
                    value={this.state.nickname}
                    onChange={(ev) => this.nicknameChanged(ev)}
                    type="text"
                    onKeyDown={e => e.key === "Enter" && this.Register()} />
                <input className={this.state.badPassword ? styles.errorInput : styles.input}
                    {...(this.state.badPassword ? { placeholder: "BAD PASSWORD!!!!" } : { placeholder: "Password" })}
                    value={this.state.password}
                    onChange={(ev) => this.passwordChanged(ev)}
                    type="password"
                    onKeyDown={e => e.key === "Enter" && this.Register()} />
                <input className={this.state.confirmPasswordBad ? styles.errorInput : styles.input}
                    {...(this.state.confirmPasswordBad ? { placeholder: "WTFFF YOUR PASSWORDS DON'T MATCH!!!!" } : { placeholder: "Confirm password" })}
                    value={this.state.confirmPassword}
                    onChange={(ev) => this.confirmPasswordChanged(ev)}
                    type="password"
                    onKeyDown={e => e.key === "Enter" && this.Register()} />
                {this.state.RegisterFailed && <span className={styles.errorSpan}>Register failed! Username already exists</span>}
                <div className={styles.RegisterButton} onClick={() => this.Register()} >Register</div>
                <div>Already registered?</div>
                <div><span className={styles.link} onClick={() => this.props.changePage("/login")}>Click here</span> to login</div>

            </div>
        )
    }
}

export const Register = withRouter(RegisterComponent)
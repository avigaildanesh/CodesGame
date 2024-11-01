import { Component } from 'react'
import { Login } from './LoginComponent';
import { Register } from './RegisterComponent';
import { Friendship, IUser, Role, UserCode } from "../Utilities/DataTypes"
import { Profile } from './ProfileComponent';
import { Home } from './Home';
import { Friends } from './FriendsComponent';
import { Codes } from './CodesComponent';
import { Replay } from './Replay';
// import { ReplayData } from '../Utilities/Renderer';
import { History } from './HistoryComponent';
import { Report } from './ReportsComponent';
import { Stats } from './StatsComponent';
interface IRoute {
    load: () => JSX.Element,
    requirement: () => boolean
}
interface IRouterState {
    path: string;
    username?: string;

}
interface IRouterProps {
    user?: IUser;
    // replayData: ReplayData | null
    onLogin(user: IUser): void;
    onFriendsChange(friends: Friendship[]): void;
    onCodesChange(codes: UserCode[]): void;
    callonce(): void
    release(): void
}
export class Router extends Component<IRouterProps, IRouterState> {
    private listening: boolean;

    private login = () => (<Login onLogin={(user: IUser) => this.onLogin(user)} />)
    private register = () => (<Register onLogin={(user: IUser) => this.onLogin(user)} />)
    private profile = () => (<Profile currentUser={this.props.user!} />)
    private home = () => (<Home user={this.props.user} />)
    private friends = () => (<Friends user={this.props.user!} onFriendsChange={(friends) => this.props.onFriendsChange(friends)} />)
    private codes = () => (<Codes user={this.props.user!} onCodesChange={(codes) => this.props.onCodesChange(codes)} />)
    private replay = () => (<Replay
        // replayData={this.props.replayData}
        callOnce={this.props.callonce} release={this.props.release} />)
    private history = () => (<History user={this.props.user!} />)
    private reports = () => (<Report user={this.props.user!} />)
    private stats = () => (<Stats />)
    private routes: { [id: string]: IRoute } = {
        "/": {
            load: this.login,
            requirement: () => true
        },
        "/login": {
            load: this.login,
            requirement: () => true
        },
        "/register": {
            load: this.register,
            requirement: () => true
        },
        "/home": {
            load: this.home,
            requirement: () => true
        },
        "/profile": {
            load: this.profile,
            requirement: () => this.props.user != undefined
        },
        "/friends": {
            load: this.friends,
            requirement: () => this.props.user != undefined
        },
        "/codes": {
            load: this.codes,
            requirement: () => this.props.user != undefined
        },
        "/replay": {
            load: this.replay,
            requirement: () => true
        },
        "/history": {
            load: this.history,
            requirement: () => this.props.user != undefined
        },
        "/reports": {
            load: this.reports,
            requirement: () => this.props.user != undefined && this.props.user!.role >= Role.Admin
        },
        "/statistics": {
            load: this.stats,
            requirement: () => this.props.user != undefined
        }
    }

    constructor(props: IRouterProps) {
        super(props);
        this.listening = false;
        let path = window.location.pathname.split("?")[0];
        this.state = { path: path }
        if (!this.routes[path]) {
            path = "/login";
            window.history.pushState({}, "", path);
        }
    }

    private changePage(path: string) {
        this.setState({ path: path })
        window.history.pushState({}, "", path)
    }
    private onLogin(user: IUser) {
        this.props.onLogin(user);
        this.changePage("/home")
    }

    public componentDidMount() {
        if (!this.listening) {
            window.addEventListener("popstate", () => {
                this.changePage(window.location.pathname)
            })
            window.addEventListener("routerRequestedChange", ((ev: CustomEvent<string>) => {
                this.changePage(ev.detail)
            }) as EventListener);
            this.listening = true;
        }
    }

    public render() {
        const page = this.routes[this.state.path.split("?")[0]];
        if (page == undefined) {
            return <div>Unknown page</div>
        }
        if (page.requirement()) {
            return page.load();
        }
        else {
            return this.login()
        }
    }
}



export default Router
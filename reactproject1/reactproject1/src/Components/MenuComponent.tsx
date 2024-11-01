import { Component } from 'react'
import { Dialog } from './Dialog';
import { IRouterProps, withRouter } from '../Utilities/withRouter';
import { styles } from './MenuComponentStyles';
import { Friendship, FriendshipStatus, GameResult, IUser, Role } from '../Utilities/DataTypes';
import Router from './Router';
import { tryGetFriends, tryStartGame } from '../Utilities/Database';
import { Autocomplete } from './Autocomplete';
// import { ReplayData } from '../Utilities/Renderer';
import { callOnce, release } from '../Utilities/globa';

type IMenuProps = IRouterProps & {

}

interface IMenuState {
    selectedItem?: string
    dialogOpen: boolean
    selectedFriend: IUser | null
    user?: IUser
    friends?: IUser[]
    // replayData: ReplayData | null
}

interface MenuItem {
    title: string,
    page: string,
    authorization: Role
}

class MenuComponent extends Component<IMenuProps, IMenuState> {

    private menuItems: MenuItem[] = [
        {
            title: "Home",
            page: "/home",
            authorization: Role.Guest
        },
        {
            title: "Profile",
            page: "/profile",
            authorization: Role.User
        },
        {
            title: "Friends",
            page: "/friends",
            authorization: Role.User
        },
        {
            title: "History",
            page: "/history",
            authorization: Role.User
        },
        {
            title: "Manage Codes",
            page: "/codes",
            authorization: Role.User
        },
        // {
        //     title: "Leagues",
        //     page: "/leagues",
        //     authorization: Role.User
        // },
        {
            title: "Statistics",
            page: "/statistics",
            authorization: Role.User
        },
        {
            title: "Manage Reports",
            page: "/reports",
            authorization: Role.Admin
        },
    ]

    constructor(props: IMenuProps) {
        super(props);
        this.state = {
            dialogOpen: false,
            // replayData: null,
            selectedFriend: null
        }

    }
    private selectItem(item: MenuItem) {
        this.props.changePage(item.page);
        this.setState({ selectedItem: item.title })
    }

    private async startNewGame() {
        const result: GameResult = await tryStartGame(this.state.selectedFriend!.id);
        this.setState({
            dialogOpen: false,
            //  replayData: JSON.parse(result.replayData)
        });
        this.props.changePage(`/replay?id=${result.id}`)
    }

    private mapFriends(friends: Friendship[]) {
        return friends.filter(x => x.status == FriendshipStatus.Accepted).map(x => x.friendId == this.state.user!.id ? x.user : x.friend);
    }

    private async onLogin(user: IUser) {
        this.setState({ user: user });
        const friends = (await tryGetFriends() as Friendship[]);
        setTimeout(() => this.setState({ friends: this.mapFriends(friends) }), 500)
    }

    render() {
        return (
            <>
                <Dialog onBackdropClick={() => this.setState({ dialogOpen: false })} isOpen={this.state.dialogOpen} >

                    <div className={styles.dialogWrapper}>
                        <div className={styles.dialogTitle}>Start a new game</div>
                        <div className={styles.divider} />
                        <div>
                            {this.state.friends && this.state.friends.length > 0 ?
                                <>
                                    <Autocomplete
                                        value={this.state.selectedFriend?.username || ""}
                                        onChange={(item: string) => this.setState({ selectedFriend: this.state.friends!.find(x => x.username == item)! })}
                                        options={this.state.friends!.map((x) => ({ label: x.displayName, value: x.username }))}
                                    />
                                    <div className={styles.divider} />
                                    <div className={styles.button} onClick={() => this.startNewGame()} >Start</div>
                                </>
                                :
                                <div>You don't have any friends to play with.</div>
                            }
                        </div>
                    </div>
                </Dialog>
                <div className={styles.container}>
                    <div className={styles.flexColumns}>
                        <div className={styles.menuTitleDiv}>
                            <div><img className={styles.image} src="img/default_pfp.jpg" alt="" /></div>
                            <div>{this.state.user?.displayName ?? "Guest"}</div>
                            {this.state.user && <div className={styles.addANewFriend} onClick={() => this.setState({ dialogOpen: true })}>New game</div>}
                        </div>
                        <div className={styles.menuSelectorContainer}>
                            {this.menuItems.filter(x => x.authorization <= (this.state.user?.role ?? Role.Guest)).map(item => {
                                return (<div
                                    key={item.title}
                                    className={`${styles.menuItem} ${this.state.selectedItem == item.title ? styles.selectedMenuItem : ""}`}
                                    onClick={() => this.selectItem(item)}>{item.title}</div>)
                            })}
                        </div>
                        {
                            // this.state.menus.map(menu => )
                        }
                    </div>
                    <div className={styles.menuboxContainer}>
                        <Router
                            user={this.state.user}
                            // replayData={this.state.replayData}
                            onLogin={(user) => this.onLogin(user)}
                            onFriendsChange={(friends) => this.setState({ friends: this.mapFriends(friends) })}
                            onCodesChange={(codes) => this.setState({ user: { ...this.state.user!, userCodes: codes } })}
                            callonce={callOnce}
                            release={release}
                        />
                    </div>
                </div>
            </>
        )
    }
}

export const Menu = withRouter(MenuComponent)
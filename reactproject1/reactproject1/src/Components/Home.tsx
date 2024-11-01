import { Component } from "react"
import { IRouterProps, withRouter } from "../Utilities/withRouter"
import { GameResult, IUser } from "../Utilities/DataTypes"
import { createStyleSheet, mainColor } from "../Utilities/Style"
import { ColumnDefinition, Table } from "./TableComponent"
import { tryGetLatestGames } from "../Utilities/Database"

const styles = createStyleSheet("HomeComponent", {
    header: {
        fontSize: "1.2rem",
        textAlign: "center",
        width: "100%"
    },
    actionButton: {
        cursor: "pointer",
        color: mainColor,
        textDecoration: `underline`
    },
})

interface IHomeProps {
    user?: IUser
}
interface IHomeState {
    latestGames: GameResult[]

}

type HomeProps = IHomeProps & IRouterProps

class HomeComponent extends Component<HomeProps, IHomeState> {
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
            </div>)
        }
    ]

    constructor(props: HomeProps) {
        super(props);
        this.state = {
            latestGames: []
        }
    }
    private watchGame(item: GameResult) {
        this.props.changePage(`/replay?id=${item.id}`)
    }

    public async componentDidMount() {
        const result = await tryGetLatestGames();
        this.setState({ latestGames: result })
    }
    public render() {
        return (
            <div>
                <div className={styles.header}>
                    <div>Hello, {this.props.user?.displayName ?? "Guest"}.</div>
                    {!this.props.user && <div style={{ cursor: "pointer" }} onClick={() => this.props.changePage("/login")}>Please login to continue</div>}
                </div>
                <hr />
                <div>
                    <div className={styles.header}>Latest games:</div>
                    {
                        this.state.latestGames && this.state.latestGames.length > 0 ?
                            <Table columnDefintions={this.columnDefinitions} data={this.state.latestGames} itemsPerPage={10} />
                            :
                            <div>No games were played yet</div>
                    }
                </div>
            </div>
        )
    }
}

export const Home = withRouter(HomeComponent);
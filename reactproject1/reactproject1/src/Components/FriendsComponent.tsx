import React, { Component } from 'react'
import { createStyleSheet, mainColor, secondaryColor } from '../Utilities/Style';
import { ColumnDefinition, Table } from './TableComponent';
import { Friendship, FriendshipStatus, IUser } from '../Utilities/DataTypes';
import { tryAcceptFriend, tryAddFriend, tryGetFriends, tryRejectFriend, tryRemoveFriend, trySearchForUsername } from '../Utilities/Database';

interface FriendsComponentProps {
    user: IUser,
    onFriendsChange(friends: Friendship[]): void
}
type columnValue = IUser & { status: FriendshipStatus }
interface FriendsComponentState {
    inputValue: string,
    searchResult: columnValue[],
    friends: Friendship[]
}

const styles = createStyleSheet("FriendsComponent", {
    container: {
        margin: "1em",
    },
    friendsTable: {

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
    rejectButton: {
        cursor: "pointer",
        color: secondaryColor,
        textDecoration: "underline"
    }
})

class FriendsComponent extends Component<FriendsComponentProps, FriendsComponentState> {

    private readonly columnsDefinition: ColumnDefinition<columnValue>[] = [
        {
            fieldName: "username",
            label: "Username"
        },
        {
            fieldName: "displayName",
            label: "Name"
        },
        {
            fieldName: "displayName",
            "label": "",
            displayFunction: (item) => (
                <div>
                    {
                        (item.status == FriendshipStatus.Accepted && (<div className={styles.rejectButton} onClick={() => this.removeFriend(item)} >Remove friend</div>))
                        ||
                        (item.status == FriendshipStatus.Pending && (
                            this.state.friends.find(x => x.userId == this.props.user.id && x.friendId == item.id) ?
                                (<div>Friend request sent</div>)
                                :
                                (<div>
                                    <div className={styles.actionButton} onClick={() => this.acceptFriend(item)}>Accept</div>
                                    <div className={styles.rejectButton} onClick={() => this.rejectFriend(item)}>Decline</div>
                                </div>)
                        )
                        )
                        ||
                        (item.status == FriendshipStatus.Rejected && (<div style={{ color: "red" }}>Rejected</div>))
                        ||
                        (item.status == FriendshipStatus.NotFriends && <div className={styles.actionButton} onClick={() => this.addFriend(item)}>Add friend</div>)
                    }

                </div>

            )
        }
        // In the future maybe add a bit more statistics
    ]

    private initialized: boolean = false;


    constructor(props: FriendsComponentProps) {
        super(props);
        this.state = {
            friends: [],
            searchResult: [],
            inputValue: ""
        }
    }

    private mapFriends() {
        return this.state.friends.map(x => ({ ...(x.userId == this.props.user.id ? x.friend : x.user), status: x.status }));
    }

    public async componentDidMount() {
        if (!this.initialized) {
            await this.getFriends();
            this.setState({ searchResult: [...this.mapFriends()] })
            this.initialized = true;
        }
    }
    private async getFriends() {
        const friends = await tryGetFriends();
        this.setState({ friends: friends });
        this.props.onFriendsChange(friends);
    }

    private async search() {
        if (this.state.inputValue == "") {
            this.setState({ searchResult: [...this.mapFriends()] });
        }
        else {
            const users = await trySearchForUsername(this.state.inputValue);
            this.setState({ searchResult: users.map((x: IUser) => ({ ...x, status: this.state.friends.find(f => f.userId == x.id || f.friendId == x.id)?.status ?? FriendshipStatus.NotFriends })) });
        }
    }

    private async handleInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code == "Enter") {
            this.search()
        }
    }

    private async addFriend(item: columnValue) {
        if (await tryAddFriend(this.props.user.id, item.id)) {
            await this.getFriends().then(() => setTimeout(() => this.search(), 500));
        }
        else {
            alert("Error when sending friend request");
        }
    }

    private async acceptFriend(item: columnValue) {
        const from = item.id;
        const to = this.props.user.id;
        if (await tryAcceptFriend(from, to)) {
            await this.getFriends().then(() => setTimeout(() => this.search(), 500));
        }
        else {
            alert("Failed to accept friend request");
        }
    }

    private async rejectFriend(item: columnValue) {
        const from = item.id;
        const to = this.props.user.id;
        if (await tryRejectFriend(from, to)) {
            this.getFriends().then(() => setTimeout(() => this.search(), 500));

        }
        else {
            alert("Failed to reject friend request");
        }
    }
    private async removeFriend(item: columnValue) {
        const from = item.id
        const to = this.props.user.id;
        if (await tryRemoveFriend(from, to)) {
            this.getFriends().then(() => setTimeout(() => this.search(), 500));
        }
        else {
            alert("Failed to remove friend");
        }
    }

    render() {
        return (
            <div className={styles.container}>
                <div className={styles.header}>Friends</div>
                <hr />
                <div className={styles.inputDiv}>
                    <input value={this.state.inputValue} className={styles.input} placeholder='Search' onChange={(e) => this.setState({ inputValue: e.target.value })} onKeyUp={(e) => this.handleInputKey(e)} />
                </div>
                <div className={styles.friendsTable}>
                    {this.state.searchResult.length > 0 ? <Table columnDefintions={this.columnsDefinition} data={this.state.searchResult} itemsPerPage={3} />
                        : <div>No results, try searching for something</div>
                    }
                </div>
            </div>
        )
    }
}

export const Friends = FriendsComponent
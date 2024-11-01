export interface Friendship {
    userId: number
    user: IUser
    friendId: number
    friend: IUser
    status: FriendshipStatus
}

export interface IUser {
    id: number,
    username: string
    displayName: string
    role: Role
    friends: Friendship[]
    userCodes: UserCode[]
    selectedCode: UserCode
}

export interface UserCode {
    id: number
    userId: number
    user: IUser
    title: string
    createdDate: string
    code: string
}

export interface ILoginProps {
    onLogin: (user: IUser) => void;
}

export enum Role {
    Guest = -1,
    User = 0,
    Admin = 1,
}

export enum FriendshipStatus {
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    NotFriends = 3,
}

export interface GameResult {
    id: number;
    user1Id: number;
    user1: IUser;
    user2Id: number;
    user2: IUser;
    winner: number;
    user1Score: number;
    user2Score: number;
    replayData: string;
}

export interface GameReport {
    id: number;
    gameResultId: number;
    gameResult: GameResult;
    reportContent: string;
    reporterId: number;
    reporter: IUser;
}

export interface BannedUser {
    id: number;
    userId: number;
    user: IUser;
    reportId: number;
    gameReport: GameReport;
}

export interface StatsObject {
    user: string
    totalScore: number
    wins: number
    finalScore: number
}
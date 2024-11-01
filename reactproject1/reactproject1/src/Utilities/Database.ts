import { GameResult, IUser, Role } from "./DataTypes";

export const serverUrl = "https://localhost:7296";
const headers: { [name: string]: string } = { 'Content-Type': 'application/json', "Accept": "*/*", "Origin": window.location.origin };
const POST = "POST"
const GET = "GET"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function request(url: string, method: string, body?: any, server = ""): Promise<Response> {
    return fetch(`${server === "" ? serverUrl : server}/${url}`, { headers, body: method === GET ? undefined : JSON.stringify(body), method });
}

export async function getUserProfile(username: string) {
    try {
        const user: IUser = await (await request(`api/Users/GetProfile?user=${encodeURIComponent(username)}`, GET, {})).json();
        return user
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

export async function tryLogin(username: string, password: string) {
    try {
        const info = await (await request("api/Users/login", POST, { username, password })).json();
        if (info && info.token && info.user) {
            headers["Authorization"] = `Bearer ${info.token}`;
            return info.user;
        }
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

export async function tryRegister(username: string, password: string, displayName: string) {
    const user = {
        username,
        password,
        displayName,
    }

    try {
        await request("api/Users/register", POST, user);
        return true;
    }
    catch (e) {
        console.log(e)
        return false;
    }
}

export async function tryChange(username: string, password: string, displayName: string, role: Role) {
    const editedUser = {
        username, password, displayName, role
    };
    try {
        await request("api/Users/Change", POST, editedUser);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryGetFriends() {
    try {
        return await (await request("api/Friend/Get", GET)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryAddFriend(from: number, to: number) {
    const friendRequest = { from, to }
    try {
        await request("api/Friend/Invite", POST, friendRequest);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}
export async function tryAcceptFriend(from: number, to: number) {
    const friendRequest = { from, to }
    try {
        await request("api/Friend/Accept", POST, friendRequest);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryRejectFriend(from: number, to: number) {
    const friendRequest = { from, to }
    try {
        await request("api/Friend/Reject", POST, friendRequest);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryRemoveFriend(from: number, to: number) {
    const friendRequest = { from, to }
    try {
        await request("api/Friend/Remove", POST, friendRequest);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function trySearchForUsername(username: string) {
    const reqData = { username };
    try {
        return await (await request("api/Users/Search", POST, reqData)).json();
    }
    catch (e) {
        console.log(e);
        return []
    }
}

export async function tryCreateCode(title: string, code: string) {
    const reqData = { title, code };
    try {
        return await (await request("api/Code/Create", POST, reqData)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryGetMyCodes() {
    try {
        return await (await request("api/Code/GetMyCodes", GET)).json();
    }
    catch (e) {
        console.log(e);
        return []
    }
}

export async function tryDeleteCode(id: number) {
    const reqData = { id };
    try {
        return await (await request("api/Code/Delete", POST, reqData)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryEditCode(id: number, title: string, code: string) {
    const reqData = { id, title, code };
    try {
        return await (await request("api/Code/Edit", POST, reqData)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function trySelectCode(id: number) {
    const reqData = { id };
    try {
        return await (await request("api/Code/Select", POST, reqData)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryStartGame(user2Id: number) {
    try {
        const result = (await request(`api/Game/Start?player2=${user2Id}`, GET)).json();
        return result;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryGetGame(id: number) {
    try {
        const result = (await request(`api/Game/Get?id=${id}`, GET)).json();
        return result;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryGetGameHistory() {
    try {
        const result = (await request(`api/Game/GetHistory`, GET)).json();
        return result;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryReportGame(item: GameResult, message: string) {
    try {
        return await (await request(`api/Report/Submit?gameId=${item.id}&message=${encodeURIComponent(message)}`, GET)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryGetAllReports() {
    try {
        return await (await request(`api/Report/GetReports`, GET)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryDeleteReport(id: number) {
    try {
        return await (await request(`api/Report/Delete?reportId=${id}`, GET)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}


export async function tryBanUser(userId: number, reportId: number) {
    try {
        return await (await request(`api/Report/BanUser?userId=${userId}&reportId=${reportId}`, GET)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryGetStats(){
    try {
        return await (await request(`api/Game/Stats`, GET)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export async function tryGetLatestGames() {
    try {
        return await (await request(`api/Game/Latest`, GET)).json();
    }
    catch (e) {
        console.log(e);
        return false;
    }
}
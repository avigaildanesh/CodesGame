import {
    createStyleSheet
} from '../Utilities/Style';
export const styles = createStyleSheet("MenusComponent", {
    container: {
        display: "grid",
        gridTemplateColumns: "33fr 67fr",
        position: "absolute",
        top: "1em",
        bottom: "1em",
        left: "1em",
        right: "1em",
        boxShadow: "0px 0px 14px darkgray",
        backgroundColor: "white",
    },
    flexColumns: {
        display: "flex",
        flexDirection: "column",
        borderRight: "3px solid darkgray",
    },
    menuTitleDiv: {
        display: "flex",
        backgroundColor: "whitesmoke",
        borderBottom: "2px solid darkgrey",
        alignItems: "center",
        padding: "0.3em",
        height: "10vh"
    },
    menuboxContainer: {
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
    },
    inputsContainer: {
        padding: "1em",
        display: "flex",
    },
    mainMessageInput: {
        height: "2em",
        fontSize: "1.2rem",
        marginTop: "auto",
        flex: "auto"
    },
    messagesContainer: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        flex: "auto",
        padding: "1em",
        overflowY: "auto",
        rowGap: "0.5em"
    },
    message: {
        color: "white",
        border: "1px solid darkgrey",
        borderRadius: "0.5em",
        padding: "1em",
        wordBreak: "break-word",
        maxWidth: "75%",
    },
    messageFromMe: {
        marginLeft: "auto",
        backgroundColor: "rgba(100,112,255,1)",
        position: "relative",
    },
    "messageFromMe::after": {
        content: "''",
        position: "absolute",
        right: "0",
        top: "67%",
        width: "0",
        height: "0",
        border: "1rem solid transparent",
        borderLeftColor: "rgba(100,112,255,1)",
        borderRight: "0",
        borderBottom: "0",
        marginTop: "-0.8rem",
        marginRight: "-0.8rem",
    },
    messageFromOthers: {
        backgroundColor: "rgba(150,112,255,1)",
        marginRight: "auto",
        position: "relative",
    },
    "messageFromOthers::after": {
        content: "''",
        position: "absolute",
        left: "0",
        top: "67%",
        width: "0",
        height: "0",
        border: "1rem solid transparent",
        borderRightColor: "rgba(150,112,255,1)",
        borderLeft: "0",
        borderBottom: "0",
        marginTop: "-0.8rem",
        marginLeft: "-0.8rem",
    },
    image: {
        width: "4em",
        height: "4em",
        margin: "0.2em 1em 0em 1em",
        borderRadius: "100%",
    },
    input: {
        height: "2em",
        fontSize: "1em",
        width: "100%",
        boxSizing: "border-box",
    },
    errorInput: {
        height: "2em",
        fontSize: "1em",
        border: "2px solid red",
        width: "100%",
        boxSizing: "border-box",
    },
    "errorInput::placeholder": {
        color: "red",
        opacity: 0.7
    },
    addANewFriend: {
        width: "10em",
        transition: "0.5s",
        height: "2.5em",
        borderRadius: "1em",
        cursor: "pointer",
        backgroundColor: "#5cc1a0",
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
    "addANewFriend:hover": {
        transition: "1s",
        backgroundColor: "#2e9372",
        color: "white",
        border: "3px solid black",
        boxShadow: "0 0 20px whitesmoke",
        width: "12.5em",
        height: "3.125em",
    },
    attachment: {
        padding: "0.5em",
    },
    button: {
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
        padding: "0.2em",
        width: "100%",
        borderRadius: "0.3em",
    },
    "button:hover": {
        transition: "0.5s",
        backgroundColor: "#2e9372",
        boxShadow: "1px 0px 10px darkgrey"
    },
    media: {
        width: "100%",
    },
    recordingButtonsContainer: {
        display: "flex",
        gap: "1em",
    },
    sendButton: {
        transition: "0.5s",
        backgroundColor: "#5cc1a0",
        color: "white",
        border: "1px solid black",
        textAlign: "center",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        borderRadius: "0.3em",
        margin: "0 0 0 0.3em",
        padding: "0.3em",
    },
    "sendButton:hover": {
        transition: "0.5s",
        backgroundColor: "#2e9372",
        boxShadow: "1px 0px 10px darkgrey",
    },
    messageContainer: {
        display: "flex",
        flexDirection: "column",
    },
    date: {
        fontSize: "0.7rem",
        color: "#abd9ca",
        position: "absolute",
        right: "5px",
        bottom: "2px",
    },
    dialogWrapper: {
        width: "100%",
    },
    divider: {
        height: "1px",
        width: "100%",
        margin: "0.3em"
    },
    dialogAddButton: {
        transition: "0.5s",
        backgroundColor: "#5cc1a0",
        color: "white",
        border: "1px solid black",
        textAlign: "center",
        cursor: "pointer",
        borderRadius: "0.3em",
        padding: "0.3em",
        marginLeft: "70%",
    },
    "dialogAddButton:hover": {
        transition: "0.5s",
        backgroundColor: "#2e9372",
        boxShadow: "1px 0px 10px darkgrey"
    },
    dialogTitle: {
        fontSize: "1.2rem",
    },
    menuSelectorContainer: {
        display: "flex",
        flexDirection: "column"
    },
    menuItem: {
        transition: "0.5s",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid darkgrey",
        padding: "1em",
        position: "relative",
        cursor: "pointer",
    },
    "menuItem:hover": {
        transition: "0.5s",
        backgroundColor: "rgb(202, 206, 255)"
    },
    selectedMenuItem: {
        backgroundColor: "#2e9372 !important",
        color: "white"
    }

})
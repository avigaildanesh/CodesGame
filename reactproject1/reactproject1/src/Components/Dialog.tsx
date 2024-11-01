import React from 'react'
import { createStyleSheet } from '../Utilities/Style'

const styles = createStyleSheet("Dialog", {
    backdrop: {
        transition: "1s",
        display: "flex",
        position: "absolute",
        top: "0",
        left: "0",
        backgroundColor: "black",
        opacity: 0.6,
        zIndex: 10,
        width: "100%",
        height: "100%",
    },
    backdropHidden: {
        transition: "1s",
        display: "flex",
        position: "absolute",
        top: "0",
        left: "0",
        backgroundColor: "black",
        opacity: 0.0,
        zIndex: -1,
        width: "100%",
        height: "100%",
    },
    dialog: {
        transition: "1s",
        display: "flex",
        zIndex: 11,
        backgroundColor: "white",
        position: "absolute",
        top: "15%",
        left: "33.3%",
        right: "33.3%",
        minHeight: "50vh",
        padding: "1em",
        borderRadius: "8px",
        border: "1px solid black",
        boxShadow: "0 0 5px black"
    },
    dialogHidden: {
        transition: "1s",
        display: "flex",
        zIndex: -1,
        backgroundColor: "white",
        position: "absolute",
        top: "0%",
        left: "33.3%",
        right: "33.3%",
        minHeight: "50vh",
        padding: "4em",
        borderRadius: "8px",
        border: "1px solid black",
        boxShadow: "0 0 5px black",
        opacity: 0
    }
});

interface IDialogProps extends React.PropsWithChildren{
    isOpen: boolean
    onBackdropClick: React.MouseEventHandler<HTMLDivElement> 
}

export function Dialog(props: IDialogProps) {
    return (
        <>
            <div className={props.isOpen ? styles.backdrop : styles.backdropHidden} onClick={props.onBackdropClick} />
            <div className={props.isOpen ? styles.dialog : styles.dialogHidden}>
                {props.isOpen && props.children}
            </div>
        </>
    );
}
import React from "react"

export interface IRouterProps {
    changePage: (newPage: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withRouter<T>(WrappedComponent: typeof React.Component<T & IRouterProps>): React.FC<T> {
    const changePage = (newPage: string) => {
        window.dispatchEvent(new CustomEvent("routerRequestedChange", { detail: newPage }))
    }

    return (props: T) => (<WrappedComponent {...props} changePage={(newPage: string) => changePage(newPage)} />);
}


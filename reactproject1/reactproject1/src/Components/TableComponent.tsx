import { Component } from 'react'
import { createStyleSheet } from '../Utilities/Style';

export interface ColumnDefinition<T> {
    label: string,
    fieldName: keyof T,
    displayFunction?(item: T): string | JSX.Element
    onClick?(): void
}

interface ITableProps<T> {
    columnDefintions: ColumnDefinition<T>[]
    data: T[]
    itemsPerPage: number
}

interface ITableState {
    page: number
}

const styles = createStyleSheet("Table", {
    container: {
        transition: "1s",
    },
    col: {
        fontWeight: "bold",
        borderTop: "1px solid darkgrey"
    },
    colsContainer: {
        display: "flex",

    },
    rowsContainer: {
        transition: "1s",
    },
    row: {
        display: "flex",
    },
    cell: {
        padding: "1em",
        width: "100%",
        textAlign: "center",
        borderBottom: "1px solid darkgrey"
    },
    paginationContainer: {
        display: "flex",
    },
    paginationButton: {
        margin: "1em",
        fontSize: "1.2rem",
        width: "20%",
        cursor: "pointer",
        textAlign: "center",
    },
    paginationPages: {
        padding: "1em",
        fontSize: "1.2rem",
        width: "100%",
        textAlign: "center"
    }
});

class TableComponent<T> extends Component<ITableProps<T>, ITableState> {

    constructor(props: ITableProps<T>) {
        super(props);

        this.state = {
            page: 0,
        }
    }

    render() {
        const maxPages = Math.floor((this.props.data.length / this.props.itemsPerPage));
        const data = this.props.data.slice(this.state.page * this.props.itemsPerPage, (this.state.page + 1) * this.props.itemsPerPage);
        return (
            <div className={styles.container}>
                <div className={styles.colsContainer}>
                    {this.props.columnDefintions.map((col, index) => (<div className={`${styles.col} ${styles.cell}`} key={`${String(col.fieldName)}-${index}`}>{col.label}</div>))}
                </div>
                <div className={styles.rowsContainer}>
                    {
                        data.map((item, rowIndex) => (
                            <div className={styles.row} key={`${rowIndex}-${this.state.page}`}>{this.props.columnDefintions.map((col, colIndex) => (
                                <div className={styles.cell} key={`${rowIndex}-${colIndex}-${this.state.page}`}>{(col.displayFunction ? col.displayFunction(item) : String(item[col.fieldName]))}</div>
                            )
                            )}
                            </div>
                        )
                        )
                    }
                </div>
                {this.props.itemsPerPage < this.props.data.length &&
                    <div className={styles.paginationContainer}>
                        <div className={styles.paginationButton} onClick={() => this.state.page > 0 && this.state.page <= maxPages && this.setState({ page: this.state.page - 1 })}>&lt;</div>
                        <div className={styles.paginationPages}>
                            {this.state.page + 1} / {maxPages + 1}
                        </div>
                        <div className={styles.paginationButton} onClick={() => this.state.page >= 0 && this.state.page < maxPages && this.setState({ page: this.state.page + 1 })} >&gt;</div>
                    </div>
                }
            </div>
        )
    }
}

export const Table = TableComponent;
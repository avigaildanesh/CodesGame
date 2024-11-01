import { Component } from 'react'
import { ColumnDefinition, Table } from './TableComponent';
import { StatsObject } from '../Utilities/DataTypes';
import { createStyleSheet } from '../Utilities/Style';
import { tryGetStats } from '../Utilities/Database';

const styles = createStyleSheet("StatsComponent", {
    header: {
        fontSize: "1.2rem",
        textAlign: "center",
        width: "100%"
    },
    container: {
        margin: "1em",
    },
})



interface StatsState {
    result: StatsObject[]
}

class StatsComponent extends Component<object, StatsState> {
    private readonly columnsDefinition: ColumnDefinition<StatsObject>[] = [
        {
            fieldName: "user",
            label: "Username"
        },
        {
            fieldName: "wins",
            label: "Wins"
        },
        {
            fieldName: "totalScore",
            label: "Total Score"
        },
        {
            fieldName: "finalScore",
            label: "Final Score"
        },
    ]

    private initialized: boolean = false;


    constructor(props: object) {
        super(props);
        this.state = {
            result: []
        }
    }


    public async componentDidMount() {
        if (!this.initialized) {
            const result = await tryGetStats();
            this.setState({ result: result });
            this.initialized = true;
        }
    }

    render() {
        return (
            <div className={styles.container}>
                <div className={styles.header}>Statistics</div>
                <hr />
                <div>
                    {this.state.result.length > 0 ? <Table columnDefintions={this.columnsDefinition} data={this.state.result} itemsPerPage={10} />
                        : <div>No results, try searching for something</div>
                    }
                </div>
            </div>
        )
    }
}

export const Stats = StatsComponent
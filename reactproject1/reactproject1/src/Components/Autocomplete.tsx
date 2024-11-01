import { Component } from 'react'
import { createStyleSheet, mainColor, secondaryColor } from '../Utilities/Style'


const styles = createStyleSheet("AutocompleteDropdown", {
    container: {
        display: "block",
        backgroundColor: "white",
        borderRadius: "8px",
    },
    mainInput: {
        transition: "0.5s",
        width: "100%",
        border: "0",
        padding: "0.6em",
        backgroundColor: "unset",
        cursor: "pointer"
    },
    "mainInput:focus": {
        border: "0",
        outline: "none",
        cursor: "pointer"
    },
    inputContainer: {
        width: "100%",
        display: "table",
        border: "1px solid",
        cursor: "pointer"
    },
    icon: {
        display: "table-cell",
        textAlign: "center",
        cursor: "pointer"
    },
    stretcher: {
        display: "table-cell",
        cursor: "pointer"
    },
    dropdownContainer: {
        transition: "0.5s",
        position: "absolute",
        backgroundColor: "white",
        width: "100%",
        borderBottom: "1px solid darkgrey"
    },
    dropdownSelectedItem: {
        color: mainColor
    },
    dropdownItem: {
        transition: "0.5s",
        padding: "0.5em",
        cursor: "pointer",
        backgroundColor: "white",
        border: "1px solid darkgrey"
    },
    "dropdownItem:hover": {
        transition: "0.5s",
        backgroundColor: secondaryColor
    },
    middleContainer: {
        transition: "0.5s",
        position: "relative"
    },
    backdrop: {
        position: "fixed",
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
        opacity: "0"
    },
    hidden: {
        position: "fixed",
        top: "-100vh",
        left: "-100vw"
    }

})

interface option<T> {
    label: string
    value: T
}

interface ACProps<T> {
    value: string
    options: option<T>[]
    onChange: (item: T) => void
}

interface ACState<T> {
    inputValue: string
    filteredOptions: option<T>[]
    dropdownOpen: boolean
    useStateValue: boolean
}

export class AutocompleteDropdown<T> extends Component<ACProps<T>, ACState<T>> {
    private inputRef: HTMLInputElement | null

    constructor(props: ACProps<T>) {
        super(props)
        this.inputRef = null
        this.state = {
            inputValue: props.value,
            filteredOptions: props.options,
            dropdownOpen: false,
            // This is for Firefox, in firefox when the ctor is called props.value is an empty string and the component renders 3 times before it gets its value
            useStateValue: false
        }
    }

    private inputValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.value != this.state.inputValue) {
            const filteredOptions = this.props.options.filter(x => x.label.includes(event.target.value));
            this.setState({ filteredOptions: filteredOptions, inputValue: event.target.value, useStateValue: true })
        }
    }

    private onChange(item: option<T>) {
        this.setState({ inputValue: item.label, dropdownOpen: false })
        this.props.onChange(item.value)
    }

    private backdropFocus() {
        this.setState({ dropdownOpen: false, inputValue: this.props.value })
    }

    private inputContainerClick() {
        this.setState({ dropdownOpen: true, filteredOptions: this.props.options, inputValue: "", useStateValue: true })
        this.inputRef!.focus();
    }

    public render() {
        const renderOptions = this.state.filteredOptions; //.filter(x => x.value != this.props.value);
        return (
            <>
                {this.state.dropdownOpen && <div className={styles.backdrop} onClick={() => this.backdropFocus()} />}
                <div
                    className={styles.container}
                >
                    <div className={styles.middleContainer}>
                        <div className={styles.inputContainer} onClick={() => this.inputContainerClick()}>
                            <div className={styles.stretcher}>
                                <input
                                    className={`${styles.mainInput} ${(this.state.dropdownOpen ? "" : styles.hidden)}`}
                                    type="text"
                                    onChange={(e) => this.inputValueChanged(e)}
                                    ref={(r) => { this.inputRef = r }}
                                    value={this.state.useStateValue ? this.state.inputValue : this.props.value}
                                    placeholder="Type here to search..." />

                                <div className={styles.mainInput} hidden={this.state.dropdownOpen}>
                                    {this.state.useStateValue ? this.state.inputValue : this.props.value}
                                </div>
                            </div>
                            <div className={styles.icon}>
                                &gt;
                            </div>
                        </div>
                        {
                            this.state.dropdownOpen &&

                            <div className={styles.dropdownContainer}>
                                {/* <div
                                    className={`${styles.dropdownSelectedItem} ${styles.dropdownItem}`}
                                    onClick={() => this.setState({ dropdownOpen: false, inputValue: this.props.value })}
                                >
                                    {this.props.value}
                                </div> */}
                                {renderOptions.map(item => {
                                    return (
                                        <div key={item.label} onClick={() => this.onChange(item)} className={styles.dropdownItem}>{item.label}</div>
                                    )
                                }
                                )}
                            </div>
                        }
                    </div>
                </div>
            </>)
    }
}

export const Autocomplete = AutocompleteDropdown

import React from "react";

type Props = {
  row: number;
  column: number;
  inputType: string;
  initialValue: string;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type State = { value: string };

export class TechMapCell extends React.Component<Props, State> {
  state = {
    value: this.props.initialValue
  };

  input: HTMLInputElement | null = null;

  onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onBlur && this.props.onBlur(e);
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.state.value !== this.props.initialValue &&
      prevState.value === this.state.value
    ) {
      this.setState({
        value: this.props.initialValue
      });
    }
  }

  render() {
    if (this.input) {
      this.input.value = this.props.initialValue;
    }
    return (
      <input
        className="techMapTextCell"
        style={{ gridRow: this.props.row, gridColumn: this.props.column }}
        type={this.props.inputType}
        value={this.state.value}
        onChange={e => this.setState({value: e.target.value})}
        onBlur={e => this.onBlur(e)}
      />
    );
  }
}

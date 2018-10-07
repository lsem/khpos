import React, { Component } from "react";
import "./ListView.css";

export default class ListView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedKeys: []
    };

    this.itemClicked = this.itemClicked.bind(this);
  }

  itemClicked(key) {
    this.setState({ ...this.state, selectedKeys: [] });
    this.setState({ ...this.state, selectedKeys: [key] });
  }

  render() {
    let children = this.props.children.map(child => {
      return React.cloneElement(child, {
        onClick: () => this.itemClicked(child.key),
        selected: this.state.selectedKeys.includes(child.key)
      });
    });

    return <ul className="listView">{children}</ul>;
  }
}

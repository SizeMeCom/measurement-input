import React, { Component } from "react";

import MeasurementInput from "measurement-input";

export default class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  handleChange = (value) => {
    const messages = this.state.messages;
    messages.push("Value changed to: " + value);
    this.setState({messages});
  };

  render () {
    return (
      <div className="container">
        <MeasurementInput initialValue={120} onChange={this.handleChange} />
        <div>
          {this.state.messages.map((m, i) => <div key={i}>{m}</div>)}
        </div>
      </div>
    );
  }
}

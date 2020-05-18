import React, { Component } from "react";
import Switch from "react-switch";

//codigo sacado de https://www.npmjs.com/package/react-switch
class SwitchExample extends Component {
  constructor() {
    super();
    this.state = { checked: false };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(checked) {
    if (this.props.my_socket.connected) {
      alert("Socket Cerrado ");
      this.props.my_socket.close();
    } else {
      alert("Socket Abierto");
      this.props.my_socket.open();
    }
    this.setState({ checked });
  }

  render() {
    return (
      <label>
        <span>Apaga o Prende el socket!!</span>
        <Switch onChange={this.handleChange} checked={this.state.checked} />
      </label>
    );
  }
}

export default SwitchExample;

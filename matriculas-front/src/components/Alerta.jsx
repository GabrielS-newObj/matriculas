import React from "react";
 
export default class Alerta extends React.Component {
  render() {
    const { mensagem } = this.props;
    if (!mensagem) return null; 
    return (
      <div className={"alert alert-" + mensagem.tipo} role="alert">
        {mensagem.texto}
      </div>
    );
  }
}

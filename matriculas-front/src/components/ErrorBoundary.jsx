import React from "react";
 
export default class ErrorBoundary extends React.Component {
  state = { erro: false };
 
  static getDerivedStateFromError() {
    return { erro: true };
  }
 
  componentDidCatch(erro, info) {
    console.error("Erro capturado:", erro, info);
  }
 
  render() {
    if (this.state.erro)
      return (
        <div className="alert alert-danger m-4">
          Algo deu errado nesta tela. Recarregue a página.
        </div>
      );
    return this.props.children;
  }
}

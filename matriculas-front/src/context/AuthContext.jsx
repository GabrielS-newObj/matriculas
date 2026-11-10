import React from "react";
export const AuthContext = React.createContext({
  usuario: null,
  login: () => {},
  logout: () => {},
});

export class AuthProvider extends React.Component {
  state = { usuario: JSON.parse(localStorage.getItem("usuario")) };

  login = (usuario) => {
    localStorage.setItem("usuario", JSON.stringify(usuario));
    this.setState({ usuario });
  };
  logout = () => {
    localStorage.removeItem("usuario");
    this.setState({ usuario: null });
  };

  render() {
    const valor = { usuario: this.state.usuario, login: this.login, logout: this.logout };
    return <AuthContext.Provider value={valor}>{this.props.children}</AuthContext.Provider>;
  }
}

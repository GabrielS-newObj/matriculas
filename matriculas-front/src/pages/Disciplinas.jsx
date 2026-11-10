import React from "react";
import { api } from "../services/api";
import Alerta from "../components/Alerta";
 
const FORM_VAZIO = { nome: "", codigo: "", creditos: 4, preRequisitos: [] };
 
export default class Disciplinas extends React.Component {
  state = { disciplinas: [], form: FORM_VAZIO, mensagem: null };
 
  componentDidMount() {
    this.carregar();
  }
 
  carregar = () =>
    api
      .listar("disciplinas")
      .then((disciplinas) => this.setState({ disciplinas }))
      .catch((e) => this.setState({ mensagem: { tipo: "danger", texto: e.message } }));
 
  mudar = (e) => this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });
 
  alternarPreRequisito = (id) => {
    const atuais = this.state.form.preRequisitos;
    const novos = atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id];
    this.setState({ form: { ...this.state.form, preRequisitos: novos } });
  };
 
  salvar = async (e) => {
    e.preventDefault();
    const { form } = this.state;
    if (!form.nome.trim() || !form.codigo.trim())
      return this.setState({ mensagem: { tipo: "warning", texto: "Preencha nome e código." } });
    if (this.state.disciplinas.some((d) => d.codigo === form.codigo.trim()))
      return this.setState({ mensagem: { tipo: "warning", texto: "Já existe uma disciplina com esse código." } });
    try {
      await api.criar("disciplinas", { ...form, creditos: Number(form.creditos) });
      this.setState({ form: FORM_VAZIO, mensagem: { tipo: "success", texto: "Disciplina cadastrada!" } });
      this.carregar();
    } catch (err) {
      this.setState({ mensagem: { tipo: "danger", texto: err.message } });
    }
  };
 
  remover = async (id) => {
    try {
      await api.remover("disciplinas", id);
      this.carregar();
    } catch (err) {
      this.setState({ mensagem: { tipo: "danger", texto: err.message } });
    }
  };
 
  render() {
    const { disciplinas, form, mensagem } = this.state;
    return (
      <div className="row">
        <div className="col-md-5">
          <h2>Nova disciplina</h2>
          <Alerta mensagem={mensagem} />
          <form onSubmit={this.salvar}>
            <div className="mb-2">
              <label className="form-label">Nome</label>
              <input className="form-control" name="nome" value={form.nome} onChange={this.mudar} />
            </div>
            <div className="mb-2">
              <label className="form-label">Código</label>
              <input className="form-control" name="codigo" value={form.codigo} onChange={this.mudar} />
            </div>
            <div className="mb-3">
              <label className="form-label">Créditos</label>
              <input className="form-control" name="creditos" type="number" value={form.creditos} onChange={this.mudar} />
            </div>
            <p className="mb-1">Pré-requisitos:</p>
            {disciplinas.map((d) => (
              <div className="form-check" key={d.id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={form.preRequisitos.includes(d.id)}
                  onChange={() => this.alternarPreRequisito(d.id)}
                />
                <label className="form-check-label">{d.nome}</label>
              </div>
            ))}
            <button className="btn btn-primary mt-3">Salvar disciplina</button>
          </form>
        </div>
 
        <div className="col-md-7">
          <h2>Disciplinas</h2>
          <table className="table">
            <thead>
              <tr><th>Código</th><th>Nome</th><th>Pré-requisitos</th><th></th></tr>
            </thead>
            <tbody>
              {disciplinas.map((d) => (
                <tr key={d.id}>
                  <td>{d.codigo}</td>
                  <td>{d.nome}</td>
                  <td>
                    {d.preRequisitos.length === 0
                      ? "-"
                      : d.preRequisitos.map((id) => disciplinas.find((x) => x.id === id)?.nome).join(", ")}
                  </td>
                  <td>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => this.remover(d.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

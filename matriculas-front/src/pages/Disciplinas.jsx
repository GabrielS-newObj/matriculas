import React from "react";
import { api } from "../services/api";
import Alerta from "../components/Alerta";
import ModalConfirmacao from "../components/ModalConfirmacao";
 
const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
 
const FORM_VAZIO = { nome: "", creditos: 4, preRequisitos: [] };
 
export default class Disciplinas extends React.Component {
  state = { disciplinas: [], form: FORM_VAZIO, mensagem: null, confirmacao: null };
 
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
    const { form, disciplinas } = this.state;
    const nome = form.nome.trim();
    if (!nome)
      return this.setState({ mensagem: { tipo: "warning", texto: "Preencha o nome da disciplina." } });
    if (disciplinas.some((d) => normalizar(d.nome) === normalizar(nome)))
      return this.setState({
        mensagem: { tipo: "warning", texto: 'Já existe uma disciplina chamada "' + nome + '".' },
      });
    try {
      await api.criar("disciplinas", { ...form, nome, creditos: Number(form.creditos) });
      this.setState({ form: FORM_VAZIO, mensagem: { tipo: "success", texto: "Disciplina cadastrada!" } });
      this.carregar();
    } catch (err) {
      this.setState({ mensagem: { tipo: "danger", texto: err.message } });
    }
  };
 
  pedirRemocao = async (disciplina) => {
    try {
      const [turmas, matriculas] = await Promise.all([
        api.listar("turmas"),
        api.listar("matriculas"),
      ]);
      const idsTurmas = turmas.filter((t) => t.disciplinaId === disciplina.id).map((t) => t.id);
      const qtdMatriculas = matriculas.filter((m) => idsTurmas.includes(m.turmaId)).length;
      const dependentes = this.state.disciplinas.filter((d) =>
        d.preRequisitos.includes(disciplina.id)
      ).length;

      const itens = [
        idsTurmas.length + " turma(s) ofertada(s)",
        qtdMatriculas + " matrícula(s) de alunos nessas turmas",
      ];
      if (dependentes > 0) itens.push("o pré-requisito de " + dependentes + " outra(s) disciplina(s)");

      this.setState({
        confirmacao: {
          titulo: 'Remover a disciplina "' + disciplina.nome + '"?',
          linhas: ["Isso também vai apagar:"],
          itens,
          aviso: "Esta ação não pode ser desfeita.",
          textoConfirmar: "Sim, remover disciplina",
          disciplina,
        },
      });
    } catch (err) {
      this.setState({ mensagem: { tipo: "danger", texto: err.message } });
    }
  };

  remover = async () => {
    const { disciplina } = this.state.confirmacao;
    this.setState({ confirmacao: null });
    try {
      await api.remover("disciplinas", disciplina.id);
      this.setState({ mensagem: { tipo: "success", texto: "Disciplina removida." } });
      this.carregar();
    } catch (err) {
      this.setState({ mensagem: { tipo: "danger", texto: err.message } });
    }
  };
 
  render() {
    const { disciplinas, form, mensagem, confirmacao } = this.state;
    return (
      <div className="row">
        <div className="col-md-5">
          <h2>Nova disciplina</h2>
          <Alerta mensagem={mensagem} />
          <form onSubmit={this.salvar}>
            <input className="form-control mb-2" name="nome" placeholder="Nome" value={form.nome} onChange={this.mudar} />
            <label className="form-label" htmlFor="creditos">Créditos</label>
            <input className="form-control mb-3" id="creditos" name="creditos" type="number" value={form.creditos} onChange={this.mudar} />
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
                    <button className="btn btn-outline-danger btn-sm" onClick={() => this.pedirRemocao(d)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {confirmacao && (
          <ModalConfirmacao
            {...confirmacao}
            onConfirmar={this.remover}
            onCancelar={() => this.setState({ confirmacao: null })}
          />
        )}
      </div>
    );
  }
}

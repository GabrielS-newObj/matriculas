import React, { Profiler } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { decodificarHorario } from "../utils/horario";
import GradeSemanal from "../components/GradeSemanal";
import Alerta from "../components/Alerta";
import ModalConfirmacao from "../components/ModalConfirmacao";
 
export default class MinhaGrade extends React.Component {
  static contextType = AuthContext;
  state = { matriculas: [], turmas: [], disciplinas: [], professores: [], carregando: true, mensagem: null, confirmacao: null };
 
  componentDidMount() {
    this.carregar();
  }
 
  carregar = async () => {
    try {
      const alunoId = this.context.usuario.alunoId;
      const [matriculas, turmas, disciplinas, professores] = await Promise.all([
        api.listar("matriculas?alunoId=" + alunoId),
        api.listar("turmas"),
        api.listar("disciplinas"),
        api.listar("professores"),
      ]);
      this.setState({ matriculas, turmas, disciplinas, professores, carregando: false });
    } catch (e) {
      this.setState({ carregando: false, mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  pedirCancelamento = (item) => {
    this.setState({
      confirmacao: {
        titulo: 'Cancelar a matrícula em "' + item.disciplina + '"?',
        linhas: [
          decodificarHorario(item.horario).texto + " - " + item.professor + ".",
          "Você perde a vaga e ela pode ser ocupada por outra pessoa.",
        ],
        textoConfirmar: "Sim, cancelar matrícula",
        textoVoltar: "Manter matrícula",
        matriculaId: item.matriculaId,
      },
    });
  };

  cancelar = async () => {
    const { matriculaId } = this.state.confirmacao;
    this.setState({ confirmacao: null });
    try {
      await api.remover("matriculas", matriculaId);
      this.setState({ mensagem: { tipo: "success", texto: "Matrícula cancelada." } });
      this.carregar();
    } catch (e) {
      this.setState({ mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  
  itens() {
    const { matriculas, turmas, disciplinas, professores } = this.state;
    return matriculas
      .map((m) => {
        const turma = turmas.find((t) => t.id === m.turmaId);
        if (!turma) return null;
        const disciplina = disciplinas.find((d) => d.id === turma.disciplinaId);
        const professor = professores.find((p) => p.id === turma.professorId);
        const nomeDisciplina = disciplina ? disciplina.nome : "Disciplina";
        const nomeProfessor = professor ? professor.nome : "professor não informado";
        return {
          matriculaId: m.id,
          horario: turma.horario,
          disciplina: nomeDisciplina,
          professor: nomeProfessor,
          texto: nomeDisciplina + " - " + nomeProfessor,
        };
      })
      .filter(Boolean);
  }
 
  
  medir = (id, fase, duracao) => console.log(id, fase, duracao.toFixed(1) + " ms");
 
  render() {
    if (this.state.carregando) return <div className="spinner-border" role="status" />;
    const itens = this.itens();
    const { confirmacao } = this.state;
    return (
      <div>
        <h2>Minha grade</h2>
        <Alerta mensagem={this.state.mensagem} />
        <Profiler id="GradeSemanal" onRender={this.medir}>
          <GradeSemanal itens={itens} />
        </Profiler>
 
        <h5 className="mt-4">Minhas matrículas</h5>
        {itens.length === 0 && <p className="text-muted">Você ainda não tem matrículas.</p>}
        <ul className="list-group">
          {itens.map((i) => (
            <li className="list-group-item d-flex justify-content-between" key={i.matriculaId}>
              <span>
                {i.texto} ({decodificarHorario(i.horario).texto})
              </span>
              <button className="btn btn-outline-danger btn-sm" onClick={() => this.pedirCancelamento(i)}>
                Cancelar
              </button>
            </li>
          ))}
        </ul>
        {confirmacao && (
          <ModalConfirmacao
            {...confirmacao}
            onConfirmar={this.cancelar}
            onCancelar={() => this.setState({ confirmacao: null })}
          />
        )}
      </div>
    );
  }
}

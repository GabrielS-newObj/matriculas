import React from "react";
import { api } from "../services/api";
import { decodificarHorario } from "../utils/horario";
import GradeSemanal from "../components/GradeSemanal";
import Alerta from "../components/Alerta";
import ModalConfirmacao from "../components/ModalConfirmacao";
 
export default class GradeOfertas extends React.Component {
  state = { turmas: [], disciplinas: [], professores: [], matriculas: [], mensagem: null, confirmacao: null };
 
  componentDidMount() {
    this.carregar();
  }
 
  carregar = async () => {
    try {
      const [turmas, disciplinas, professores, matriculas] = await Promise.all([
        api.listar("turmas"),
        api.listar("disciplinas"),
        api.listar("professores"),
        api.listar("matriculas"),
      ]);
      this.setState({ turmas, disciplinas, professores, matriculas });
    } catch (e) {
      this.setState({ mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  pedirRemocaoTurma = async (turma, nomeDisciplina) => {
    try {
      const matriculas = await api.listar("matriculas?turmaId=" + turma.id);
      this.setState({
        confirmacao: {
          titulo: 'Remover a turma de "' + nomeDisciplina + '"?',
          linhas: [
            "Horário: " + decodificarHorario(turma.horario).texto + ".",
            "Isso também vai apagar " + matriculas.length + " matrícula(s) de alunos nesta turma.",
          ],
          aviso: "Esta ação não pode ser desfeita.",
          textoConfirmar: "Sim, remover turma",
          turma,
        },
      });
    } catch (e) {
      this.setState({ mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  removerTurma = async () => {
    const { turma } = this.state.confirmacao;
    this.setState({ confirmacao: null });
    try {
      await api.remover("turmas", turma.id);
      this.setState({ mensagem: { tipo: "success", texto: "Turma removida." } });
      this.carregar();
    } catch (e) {
      this.setState({ mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  render() {
    const { turmas, disciplinas, professores, matriculas, mensagem, confirmacao } = this.state;
    const itens = turmas.map((t) => {
      const disciplina = disciplinas.find((d) => d.id === t.disciplinaId);
      const professor = professores.find((p) => p.id === t.professorId);
      return {
        horario: t.horario,
        texto: (disciplina ? disciplina.nome : "?") + " - " + (professor ? professor.nome : "?"),
      };
    });
 
    return (
      <div>
        <h2>Grade de ofertas</h2>
        <Alerta mensagem={mensagem} />
        <GradeSemanal itens={itens} />
 
        <h4 className="mt-4">Turmas ofertadas</h4>
        {turmas.length === 0 && <p className="text-muted">Nenhuma turma ofertada.</p>}
        {turmas.length > 0 && (
          <table className="table">
            <thead>
              <tr><th>Disciplina</th><th>Professor</th><th>Horário</th><th>Vagas</th><th></th></tr>
            </thead>
            <tbody>
              {[...turmas].sort((a, b) => Number(a.horario) - Number(b.horario)).map((t) => {
                const disciplina = disciplinas.find((d) => d.id === t.disciplinaId);
                const professor = professores.find((p) => p.id === t.professorId);
                const nomeDisciplina = disciplina ? disciplina.nome : "?";
                const ocupadas = matriculas.filter((m) => m.turmaId === t.id).length;
                return (
                  <tr key={t.id}>
                    <td>{nomeDisciplina}</td>
                    <td>{professor ? professor.nome : "?"}</td>
                    <td>{decodificarHorario(t.horario).texto}</td>
                    <td>{ocupadas}/{t.vagas}</td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => this.pedirRemocaoTurma(t, nomeDisciplina)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
 
        <h4 className="mt-4">Carga dos professores</h4>
        {professores.map((p) => {
          const carga = turmas.filter((t) => t.professorId === p.id).length;
          const percentual = Math.round((carga / p.limiteTurmas) * 100);
          return (
            <div className="mb-3" key={p.id}>
              {p.nome}: {carga}/{p.limiteTurmas} turmas
              <div className="progress">
                <div
                  className={"progress-bar " + (percentual >= 100 ? "bg-danger" : "bg-success")}
                  style={{ width: percentual + "%" }}
                />
              </div>
            </div>
          );
        })}
        {confirmacao && (
          <ModalConfirmacao
            {...confirmacao}
            onConfirmar={this.removerTurma}
            onCancelar={() => this.setState({ confirmacao: null })}
          />
        )}
      </div>
    );
  }
}

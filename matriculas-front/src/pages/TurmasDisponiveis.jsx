import React from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { validarMatricula } from "../utils/regras";
import { decodificarHorario } from "../utils/horario";
import Alerta from "../components/Alerta";

const INTERVALO_ATUALIZACAO = 3000; 
const DURACAO_MENSAGEM = 5000; 

export default class TurmasDisponiveis extends React.Component {
  static contextType = AuthContext;

  state = {
    turmas: [],
    disciplinas: [],
    minhasMatriculas: [],
    todasMatriculas: [],
    aluno: null,
    carregando: true,
    mensagem: null,
  };

  componentDidMount() {
    this.carregar();
    this.intervalo = setInterval(() => this.carregar(true), INTERVALO_ATUALIZACAO);
  }

  componentWillUnmount() {
    clearInterval(this.intervalo);
    clearTimeout(this.timerMensagem);
  }

  mostrarMensagem = (mensagem) => {
    clearTimeout(this.timerMensagem);
    this.setState({ mensagem });
    this.timerMensagem = setTimeout(() => this.setState({ mensagem: null }), DURACAO_MENSAGEM);
  };

  carregar = async (silencioso = false) => {
    try {
      const alunoId = this.context.usuario.alunoId;
      const [turmas, disciplinas, minhasMatriculas, todasMatriculas, alunos] =
        await Promise.all([
          api.listar("turmas"),
          api.listar("disciplinas"),
          api.listar("matriculas?alunoId=" + alunoId),
          api.listar("matriculas"),
          api.listar("alunos"),
        ]);
      const aluno = alunos.find((a) => a.id === alunoId);

      const anteriores = this.state.disciplinas;
      const removidas = anteriores.filter((antiga) => !disciplinas.some((d) => d.id === antiga.id));

      this.setState({ turmas, disciplinas, minhasMatriculas, todasMatriculas, aluno, carregando: false });

      if (removidas.length > 0) {
        const nomes = removidas.map((d) => d.nome).join(", ");
        const texto =
          removidas.length === 1
            ? 'A disciplina "' + nomes + '" foi removida.'
            : "As disciplinas " + nomes + " foram removidas.";
        this.mostrarMensagem({ tipo: "warning", texto });
      }
    } catch (e) {
      if (!silencioso) this.setState({ carregando: false, mensagem: { tipo: "danger", texto: e.message } });
    }
  };

  matricular = async (turma) => {
    const { turmas, disciplinas, minhasMatriculas, todasMatriculas, aluno } = this.state;
    const disciplina = disciplinas.find((d) => d.id === turma.disciplinaId);
    const turmasDoAluno = minhasMatriculas
      .map((m) => turmas.find((t) => t.id === m.turmaId))
      .filter(Boolean);
    const ocupadas = todasMatriculas.filter((m) => m.turmaId === turma.id).length;

    const erro = validarMatricula({ aluno, turma, disciplina, disciplinas, turmasDoAluno, ocupadas });
    if (erro) return this.mostrarMensagem({ tipo: "warning", texto: erro });

    try {
      await api.criar("matriculas", { alunoId: aluno.id, turmaId: turma.id });
      this.mostrarMensagem({ tipo: "success", texto: "Matrícula realizada!" });
      this.carregar();
    } catch (e) {
      this.mostrarMensagem({ tipo: "danger", texto: e.message });
    }
  };

  render() {
    const { turmas, disciplinas, minhasMatriculas, todasMatriculas, carregando, mensagem } = this.state;
    if (carregando) return <div className="spinner-border" role="status" />;

    const turmasValidas = turmas
      .filter((t) => disciplinas.some((d) => d.id === t.disciplinaId))
      .sort((a, b) => Number(a.horario) - Number(b.horario));

    return (
      <div>
        <h2>Turmas disponíveis</h2>
        <Alerta mensagem={mensagem} />
        {turmasValidas.length === 0 && <p className="text-muted">Nenhuma turma ofertada.</p>}
        <div className="row">
          {turmasValidas.map((turma) => {
            const disciplina = disciplinas.find((d) => d.id === turma.disciplinaId);
            const ocupadas = todasMatriculas.filter((m) => m.turmaId === turma.id).length;
            const jaMatriculado = minhasMatriculas.some((m) => m.turmaId === turma.id);
            return (
              <div className="col-md-4 mb-3" key={turma.id}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{disciplina.nome}</h5>
                    <p className="card-text">
                      {decodificarHorario(turma.horario).texto}
                      <br />
                      Vagas ocupadas: {ocupadas}/{turma.vagas}
                    </p>
                    <button
                      className="btn btn-primary"
                      disabled={jaMatriculado}
                      onClick={() => this.matricular(turma)}
                    >
                      {jaMatriculado ? "Matriculado" : "Matricular"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
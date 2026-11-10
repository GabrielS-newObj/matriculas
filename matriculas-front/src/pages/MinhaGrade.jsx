import React, { Profiler } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { decodificarHorario } from "../utils/horario";
import GradeSemanal from "../components/GradeSemanal";
import Alerta from "../components/Alerta";
 
export default class MinhaGrade extends React.Component {
  static contextType = AuthContext;
  state = { matriculas: [], turmas: [], disciplinas: [], carregando: true, mensagem: null };
 
  componentDidMount() {
    this.carregar();
  }
 
  carregar = async () => {
    try {
      const alunoId = this.context.usuario.alunoId;
      const [matriculas, turmas, disciplinas] = await Promise.all([
        api.listar("matriculas?alunoId=" + alunoId),
        api.listar("turmas"),
        api.listar("disciplinas"),
      ]);
      this.setState({ matriculas, turmas, disciplinas, carregando: false });
    } catch (e) {
      this.setState({ carregando: false, mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  cancelar = async (id) => {
    try {
      await api.remover("matriculas", id);
      this.setState({ mensagem: { tipo: "success", texto: "Matrícula cancelada." } });
      this.carregar();
    } catch (e) {
      this.setState({ mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  
  itens() {
    const { matriculas, turmas, disciplinas } = this.state;
    return matriculas
      .map((m) => {
        const turma = turmas.find((t) => t.id === m.turmaId);
        if (!turma) return null;
        const disciplina = disciplinas.find((d) => d.id === turma.disciplinaId);
        return {
          matriculaId: m.id,
          horario: turma.horario,
          texto: disciplina ? disciplina.nome : "Disciplina",
        };
      })
      .filter(Boolean)
      .sort((a, b) => Number(a.horario) - Number(b.horario));
  }
 
  
  medir = (id, fase, duracao) => console.log(id, fase, duracao.toFixed(1) + " ms");
 
  render() {
    if (this.state.carregando) return <div className="spinner-border" role="status" />;
    const itens = this.itens();
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
              <button className="btn btn-outline-danger btn-sm" onClick={() => this.cancelar(i.matriculaId)}>
                Cancelar
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

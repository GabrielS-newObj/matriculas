import React from "react";
import { api } from "../services/api";
import GradeSemanal from "../components/GradeSemanal";
import Alerta from "../components/Alerta";
 
export default class GradeOfertas extends React.Component {
  state = { turmas: [], disciplinas: [], professores: [], mensagem: null };
 
  async componentDidMount() {
    try {
      const [turmas, disciplinas, professores] = await Promise.all([
        api.listar("turmas"),
        api.listar("disciplinas"),
        api.listar("professores"),
      ]);
      this.setState({ turmas, disciplinas, professores });
    } catch (e) {
      this.setState({ mensagem: { tipo: "danger", texto: e.message } });
    }
  }
 
  render() {
    const { turmas, disciplinas, professores, mensagem } = this.state;
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
      </div>
    );
  }
}

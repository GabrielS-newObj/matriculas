import React from "react";
import { api } from "../services/api";
import { validarOferta, validarVagas } from "../utils/regras";
import { horarioValido, DIAS, TURNOS } from "../utils/horario";
import Alerta from "../components/Alerta";

const FORM_VAZIO = { disciplinaId: "", professorId: "", dia: "", turno: "", vagas: 30 };

export default class NovaTurma extends React.Component {
  state = { disciplinas: [], professores: [], turmas: [], form: FORM_VAZIO, mensagem: null };

  componentDidMount() {
    this.carregar();
  }

  carregar = async () => {
    try {
      const [disciplinas, professores, turmas] = await Promise.all([
        api.listar("disciplinas"),
        api.listar("professores"),
        api.listar("turmas"),
      ]);
      this.setState({ disciplinas: disciplinas.sort((a, b) => a.codigo.localeCompare(b.codigo)), professores, turmas });
    } catch (e) {
      this.setState({ mensagem: { tipo: "danger", texto: e.message } });
    }
  };

  mudar = (e) => this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });

  salvar = async (e) => {
    e.preventDefault();
    const { form, professores, turmas } = this.state;
    const aviso = (texto) => this.setState({ mensagem: { tipo: "warning", texto } });

    const horario = form.dia + form.turno;
    if (!horarioValido(horario))
      return aviso("Selecione o dia e o turno.");
    const professor = professores.find((p) => p.id === Number(form.professorId));
    if (!professor || !form.disciplinaId) return aviso("Escolha a disciplina e o professor.");
    const erroVagas = validarVagas(form.vagas);
    if (erroVagas) return aviso(erroVagas);
 
    const erro = validarOferta({
      professor,
      turmasDoProfessor: turmas.filter((t) => t.professorId === professor.id),
      horario,
    });
    if (erro) return aviso(erro);

    try {
      await api.criar("turmas", {
        disciplinaId: Number(form.disciplinaId),
        professorId: professor.id,
        horario,
        vagas: Number(form.vagas),
      });
      this.setState({ form: FORM_VAZIO, mensagem: { tipo: "success", texto: "Turma ofertada!" } });
      this.carregar();
    } catch (err) {
      this.setState({ mensagem: { tipo: "danger", texto: err.message } });
    }
  };

  render() {
    const { disciplinas, professores, turmas, form, mensagem } = this.state;
    return (
      <div className="row">
        <div className="col-md-6">
          <h2>Ofertar turma</h2>
          <Alerta mensagem={mensagem} />
          <form onSubmit={this.salvar} noValidate>
            <div className="mb-3">
              <label className="form-label">Disciplina</label>
              <select className="form-select" name="disciplinaId" value={form.disciplinaId} onChange={this.mudar}>
                <option value="">Selecione...</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>{d.codigo} - {d.nome}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Professor</label>
              <select className="form-select" name="professorId" value={form.professorId} onChange={this.mudar}>
                <option value="">Selecione...</option>
                {professores.map((p) => {
                  const carga = turmas.filter((t) => t.professorId === p.id).length;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({carga}/{p.limiteTurmas} turmas)
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Dia</label>
              <select className="form-select" name="dia" value={form.dia} onChange={this.mudar}>
                <option value="">Selecione...</option>
                {Object.entries(DIAS).map(([valor, nome]) => (
                  <option key={valor} value={valor}>{nome} ({valor})</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Turno</label>
              <select className="form-select" name="turno" value={form.turno} onChange={this.mudar}>
                <option value="">Selecione...</option>
                {Object.entries(TURNOS).map(([valor, nome]) => (
                  <option key={valor} value={valor}>{nome} ({valor})</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Vagas (número inteiro, mínimo 1)</label>
              <input className="form-control" name="vagas" type="number" min="1" step="1" value={form.vagas} onChange={this.mudar} />
            </div>
            <button className="btn btn-primary">Ofertar turma</button>
          </form>
        </div>
      </div>
    );
  }
}

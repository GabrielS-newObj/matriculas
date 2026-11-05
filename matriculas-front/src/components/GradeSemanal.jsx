import React from "react";
import { DIAS, TURNOS } from "../utils/horario";
 
export default class GradeSemanal extends React.Component {
  render() {
    const { itens } = this.props;
    return (
      <table className="table table-bordered text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>Turno</th>
            {Object.values(DIAS).map((dia) => (
              <th key={dia}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(TURNOS).map((turno) => (
            <tr key={turno}>
              <th>{TURNOS[turno]}</th>
              {Object.keys(DIAS).map((dia) => {
                const doHorario = itens.filter((i) => i.horario === dia + turno);
                return (
                  <td key={dia}>
                    {doHorario.map((i, posicao) => (
                      <div key={posicao}>{i.texto}</div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

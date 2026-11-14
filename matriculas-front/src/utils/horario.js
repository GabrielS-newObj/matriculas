
export const DIAS = { 2: "Segunda", 3: "Terça", 4: "Quarta", 5: "Quinta", 6: "Sexta", 7: "Sábado" };
export const TURNOS = { 1: "Manhã", 2: "Tarde", 3: "Noite" };
 
export function horarioValido(codigo) {
  const texto = String(codigo);
  return texto.length === 2 && DIAS[texto[0]] !== undefined && TURNOS[texto[1]] !== undefined;
}
 
export function decodificarHorario(codigo) {
  const texto = String(codigo);
  return {
    dia: DIAS[texto[0]],
    turno: TURNOS[texto[1]],
    codigo: texto,
    texto: DIAS[texto[0]] + " - " + TURNOS[texto[1]] + " (" + texto + ")",
  };
}

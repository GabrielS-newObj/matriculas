export const VAGAS_MINIMAS = 1;
export const MSG_SEM_VAGAS = "Turma sem vagas.";
 
// Sem limite máximo (ex.: ensino EAD): vagas = número inteiro, de 1 para cima.
export function validarVagas(valor) {
  const numero = Number(valor);
  const vazio = valor === "" || valor === null || valor === undefined;
  if (vazio || !Number.isInteger(numero) || numero < VAGAS_MINIMAS)
    return "Vagas deve ser um número inteiro maior ou igual a " + VAGAS_MINIMAS + ".";
  return null;
}
 
export function validarMatricula({ aluno, turma, disciplina, disciplinas = [], turmasDoAluno, ocupadas }) {
  if (!disciplina) return "Disciplina da turma não encontrada.";
 
  if (aluno.disciplinasConcluidas.includes(disciplina.id))
    return "Você já concluiu esta disciplina.";
 
  if (turmasDoAluno.some((t) => t.disciplinaId === turma.disciplinaId))
    return "Você já está matriculado nesta disciplina.";
 
  const faltando = disciplina.preRequisitos.filter(
    (id) => !aluno.disciplinasConcluidas.includes(id)
  );
  if (faltando.length > 0) {
    const nomes = faltando.map((id) => {
      const d = disciplinas.find((x) => x.id === id);
      return d ? d.nome : "disciplina " + id;
    });
    return "Pré-requisitos não cumpridos: " + nomes.join(", ") + ".";
  }
 
  if (turmasDoAluno.some((t) => t.horario === turma.horario))
    return "Conflito de horário com outra turma sua.";
 
  if (ocupadas >= turma.vagas) return MSG_SEM_VAGAS;
 
  return null; 
}
 
export function validarOferta({ professor, turmasDoProfessor, horario }) {
  if (turmasDoProfessor.some((t) => t.horario === horario))
    return "O professor já tem turma neste horário.";
  if (turmasDoProfessor.length >= professor.limiteTurmas)
    return "O professor atingiu o limite de turmas.";
  return null;
}


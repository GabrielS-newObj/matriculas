import React from "react";
 
// Modal de confirmação padrão do sistema: TODA ação de remover ou cancelar passa por aqui.
// Acessível: role="dialog", foco no botão seguro (Voltar), Esc e clique fora também voltam.
export default class ModalConfirmacao extends React.Component {
  componentDidMount() {
    document.addEventListener("keydown", this.aoTeclar);
    if (this.botaoVoltar) this.botaoVoltar.focus();
  }
 
  componentWillUnmount() {
    document.removeEventListener("keydown", this.aoTeclar);
  }
 
  aoTeclar = (evento) => {
    if (evento.key === "Escape") this.props.onCancelar();
  };
 
  render() {
    const {
      titulo,
      linhas = [],
      itens = [],
      aviso,
      textoConfirmar = "Confirmar",
      textoVoltar = "Voltar",
      onConfirmar,
      onCancelar,
    } = this.props;
    return (
      <>
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-confirmacao-titulo"
          onClick={onCancelar}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modal-confirmacao-titulo">{titulo}</h5>
              </div>
              <div className="modal-body">
                {linhas.map((linha, i) => (
                  <p className="mb-2" key={i}>{linha}</p>
                ))}
                {itens.length > 0 && (
                  <ul className="mb-2">
                    {itens.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {aviso && <p className="mb-0 fw-semibold">{aviso}</p>}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  ref={(el) => (this.botaoVoltar = el)}
                  onClick={onCancelar}
                >
                  {textoVoltar}
                </button>
                <button type="button" className="btn btn-danger" onClick={onConfirmar}>
                  {textoConfirmar}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </>
    );
  }
}

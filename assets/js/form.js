document.addEventListener('DOMContentLoaded', () => {
  // Elementos do formulário
  const form         = document.getElementById('leadForm');
  const btn          = form.querySelector('button');
  const msgSuccess   = document.getElementById('msgSuccess');
  const msgError     = document.getElementById('msgError');
  const cepInput     = document.getElementById('cep');
  const cidadeInput  = document.getElementById('cidade');
  const bairroInput  = document.getElementById('bairro');
  const ruaInput     = document.getElementById('rua');
  const whatsappInput= document.getElementById('whatsapp');

  // Helper para manter o cursor no final do campo
  function setCursorToEnd(el) {
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }

  // ==== MÁSCARAS AO VIVO ====
  // CEP: 00000-000
  cepInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) {
      v = v.replace(/(\d{5})(\d+)/, '$1-$2');
    }
    e.target.value = v;
  });

  // WhatsApp: (00) 00000-0000 ou (00) 0000-0000
  whatsappInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (v.length > 5) {
      v = v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d+)/, '($1) $2');
    }
    e.target.value = v;
    setCursorToEnd(e.target);
  });

  // ==== AUTOCOMPLETE VIA CEP ====
  cepInput.addEventListener('blur', () => {
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(r => r.json())
      .then(data => {
        if (data.erro) throw new Error('CEP não encontrado');
        cidadeInput.value = data.localidade || '';
        bairroInput.value = data.bairro     || '';
        ruaInput.value    = data.logradouro || '';
      })
      .catch(err => {
        console.warn(err);
        // opcional: exibir aviso ao usuário
      });
  });

  // ==== INTERCEPTAR ENTER PARA PRÓXIMO CAMPO ====
  const focusable = Array.from(
    form.querySelectorAll('input, button')
  ).filter(el => !el.disabled);
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx  = focusable.indexOf(document.activeElement);
      const next = focusable[idx + 1] || focusable[0];
      next.focus();
    }
  });

  // ==== ENVIO DO FORMULÁRIO ====
  form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled       = true;
    msgError.style.display   = 'none';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    })
      .then(resp => resp.json())
      .then(json => {
        if (json.result === 'success') {
          form.style.display      = 'none';
          msgSuccess.style.display= 'block';
        } else {
          throw new Error(json.message || 'Erro genérico');
        }
      })
      .catch(err => {
        console.error(err);
        btn.disabled = false;
        msgError.textContent       = `Erro: ${err.message}`;
        msgError.style.display     = 'block';
      });
  });
});

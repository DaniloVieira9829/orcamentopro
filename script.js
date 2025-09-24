// Variáveis globais
let items = [];
let currentBudget = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar primeiro item
    addItem();
    
    // Atualizar pré-visualização quando o formulário mudar
    document.getElementById('budget-form').addEventListener('input', updatePreview);
    
    // Configurar eventos dos botões
    document.getElementById('add-item').addEventListener('click', addItem);
    document.getElementById('generate-pdf').addEventListener('click', generatePDF);
    document.getElementById('generate-excel').addEventListener('click', generateExcel);
    document.getElementById('get-ai-suggestions').addEventListener('click', getAISuggestions);
    document.getElementById('copy-message').addEventListener('click', copyMessage);
    document.getElementById('send-email').addEventListener('click', showEmailModal);
    
    // Configurar modal de e-mail
    const modal = document.getElementById('email-modal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-email');
    
    closeBtn.addEventListener('click', closeEmailModal);
    cancelBtn.addEventListener('click', closeEmailModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeEmailModal();
        }
    });
    
    document.getElementById('email-form').addEventListener('submit', sendEmail);
    
    // Atualizar pré-visualização inicial
    updatePreview();
});

// Adicionar item à tabela
function addItem() {
    const container = document.getElementById('items-container');
    
    const itemRow = document.createElement('tr');
    itemRow.innerHTML = `
        <td><input type="text" class="item-desc" placeholder="Descrição do item"></td>
        <td><input type="number" class="item-qty" value="1" min="1"></td>
        <td><input type="number" class="item-price" value="0.00" min="0" step="0.01"></td>
        <td class="item-total">R$ 0.00</td>
        <td><button type="button" class="btn-remove">🗑️</button></td>
    `;
    
    container.appendChild(itemRow);
    
    // Configurar eventos para o novo item
    const descInput = itemRow.querySelector('.item-desc');
    const qtyInput = itemRow.querySelector('.item-qty');
    const priceInput = itemRow.querySelector('.item-price');
    const removeBtn = itemRow.querySelector('.btn-remove');
    
    // Atualizar totais quando os valores mudarem
    [descInput, qtyInput, priceInput].forEach(input => {
        input.addEventListener('input', function() {
            updateItemTotal(itemRow);
            updatePreview();
        });
    });
    
    // Remover item
    removeBtn.addEventListener('click', function() {
        itemRow.remove();
        updatePreview();
    });
    
    // Atualizar total inicial
    updateItemTotal(itemRow);
    updatePreview();
}

// Atualizar total do item
function updateItemTotal(itemRow) {
    const qty = parseFloat(itemRow.querySelector('.item-qty').value) || 0;
    const price = parseFloat(itemRow.querySelector('.item-price').value) || 0;
    const total = qty * price;
    
    itemRow.querySelector('.item-total').textContent = `R$ ${total.toFixed(2)}`;
}

// Calcular totais do orçamento
function calculateTotals() {
    const itemRows = document.querySelectorAll('#items-container tr');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += qty * price;
    });
    
    // Aqui você pode adicionar impostos, descontos, etc.
    const tax = subtotal * 0.1; // Exemplo: 10% de imposto
    const total = subtotal + tax;
    
    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    };
}

// Atualizar pré-visualização
function updatePreview() {
    const clientName = document.getElementById('client-name').value || '[Nome do Cliente]';
    const clientEmail = document.getElementById('client-email').value || '[email@cliente.com]';
    const budgetTitle = document.getElementById('budget-title').value || '[Título do Orçamento]';
    const validity = document.getElementById('validity').value || '30';
    const notes = document.getElementById('notes').value || '';
    
    const totals = calculateTotals();
    const today = new Date();
    const validityDate = new Date();
    validityDate.setDate(today.getDate() + parseInt(validity));
    
    // Formatar datas
    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR');
    };
    
    // Gerar HTML da pré-visualização
    let itemsHTML = '';
    const itemRows = document.querySelectorAll('#items-container tr');
    
    itemRows.forEach((row, index) => {
        const desc = row.querySelector('.item-desc').value || `Item ${index + 1}`;
        const qty = row.querySelector('.item-qty').value || '1';
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = (parseFloat(qty) * price).toFixed(2);
        
        itemsHTML += `
            <tr>
                <td>${desc}</td>
                <td>${qty}</td>
                <td>R$ ${price.toFixed(2)}</td>
                <td>R$ ${total}</td>
            </tr>
        `;
    });
    
    const previewHTML = `
        <div class="preview-header">
            <h2>${budgetTitle}</h2>
            <p>Data: ${formatDate(today)} | Validade: ${formatDate(validityDate)}</p>
        </div>
        
        <div class="preview-details">
            <div>
                <h3>Para:</h3>
                <p>${clientName}<br>${clientEmail}</p>
            </div>
            <div>
                <h3>De:</h3>
                <p>Sua Empresa<br>contato@suaempresa.com<br>(11) 99999-9999</p>
            </div>
        </div>
        
        <div class="preview-items">
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Qtd.</th>
                        <th>Preço Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>
        
        <div class="preview-totals">
            <div>
                <span>Subtotal:</span>
                <span>R$ ${totals.subtotal}</span>
            </div>
            <div>
                <span>Impostos (10%):</span>
                <span>R$ ${totals.tax}</span>
            </div>
            <div class="total">
                <span>Total:</span>
                <span>R$ ${totals.total}</span>
            </div>
        </div>
        
        ${notes ? `<div class="preview-notes"><h3>Observações:</h3><p>${notes}</p></div>` : ''}
    `;
    
    document.getElementById('preview').innerHTML = previewHTML;
    
    // Atualizar objeto currentBudget
    currentBudget = {
        clientName,
        clientEmail,
        budgetTitle,
        validity,
        notes,
        items: Array.from(itemRows).map((row, index) => ({
            description: row.querySelector('.item-desc').value || `Item ${index + 1}`,
            quantity: row.querySelector('.item-qty').value || '1',
            price: parseFloat(row.querySelector('.item-price').value) || 0
        })),
        totals,
        date: today,
        validityDate
    };
}

// Gerar PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Adicionar título
    doc.setFontSize(20);
    doc.text(currentBudget.budgetTitle, 105, 20, { align: 'center' });
    
    // Adicionar informações da empresa
    doc.setFontSize(12);
    doc.text('Sua Empresa', 20, 40);
    doc.text('contato@suaempresa.com', 20, 47);
    doc.text('(11) 99999-9999', 20, 54);
    
    // Adicionar informações do cliente
    doc.text(`Para: ${currentBudget.clientName}`, 20, 70);
    doc.text(currentBudget.clientEmail, 20, 77);
    
    // Adicionar datas
    doc.text(`Data: ${currentBudget.date.toLocaleDateString('pt-BR')}`, 140, 40);
    doc.text(`Validade: ${currentBudget.validityDate.toLocaleDateString('pt-BR')}`, 140, 47);
    
    // Adicionar tabela de itens
    let yPosition = 100;
    
    // Cabeçalho da tabela
    doc.setFillColor(52, 152, 219);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition, 170, 10, 'F');
    doc.text('Descrição', 22, yPosition + 7);
    doc.text('Qtd.', 120, yPosition + 7);
    doc.text('Preço Unit.', 140, yPosition + 7);
    doc.text('Total', 170, yPosition + 7);
    
    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    
    // Itens
    currentBudget.items.forEach(item => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        const total = (item.quantity * item.price).toFixed(2);
        
        doc.text(item.description.substring(0, 40), 22, yPosition + 7);
        doc.text(item.quantity.toString(), 120, yPosition + 7);
        doc.text(`R$ ${item.price.toFixed(2)}`, 140, yPosition + 7);
        doc.text(`R$ ${total}`, 170, yPosition + 7);
        
        yPosition += 10;
    });
    
    // Totais
    yPosition += 10;
    doc.text(`Subtotal: R$ ${currentBudget.totals.subtotal}`, 140, yPosition);
    yPosition += 7;
    doc.text(`Impostos (10%): R$ ${currentBudget.totals.tax}`, 140, yPosition);
    yPosition += 7;
    doc.setFontSize(14);
    doc.text(`Total: R$ ${currentBudget.totals.total}`, 140, yPosition);
    
    // Observações
    if (currentBudget.notes) {
        yPosition += 20;
        doc.setFontSize(12);
        doc.text('Observações:', 20, yPosition);
        yPosition += 7;
        doc.text(currentBudget.notes, 20, yPosition);
    }
    
    // Salvar PDF
    doc.save(`Orcamento_${currentBudget.clientName.replace(/\s+/g, '_')}.pdf`);
    showNotification('PDF gerado com sucesso!');
}

// Gerar Excel
function generateExcel() {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Preparar dados
    const worksheetData = [
        ['Orçamento', currentBudget.budgetTitle],
        ['Cliente', currentBudget.clientName],
        ['E-mail', currentBudget.clientEmail],
        ['Data', currentBudget.date.toLocaleDateString('pt-BR')],
        ['Validade', currentBudget.validityDate.toLocaleDateString('pt-BR')],
        [],
        ['Descrição', 'Quantidade', 'Preço Unitário', 'Total']
    ];
    
    // Adicionar itens
    currentBudget.items.forEach(item => {
        const total = (item.quantity * item.price).toFixed(2);
        worksheetData.push([
            item.description,
            item.quantity,
            item.price.toFixed(2),
            total
        ]);
    });
    
    // Adicionar totais
    worksheetData.push([]);
    worksheetData.push(['Subtotal', '', '', `R$ ${currentBudget.totals.subtotal}`]);
    worksheetData.push(['Impostos (10%)', '', '', `R$ ${currentBudget.totals.tax}`]);
    worksheetData.push(['Total', '', '', `R$ ${currentBudget.totals.total}`]);
    
    // Adicionar observações
    if (currentBudget.notes) {
        worksheetData.push([]);
        worksheetData.push(['Observações:']);
        worksheetData.push([currentBudget.notes]);
    }
    
    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Orçamento');
    
    // Salvar arquivo
    XLSX.writeFile(wb, `Orcamento_${currentBudget.clientName.replace(/\s+/g, '_')}.xlsx`);
    showNotification('Planilha Excel gerada com sucesso!');
}

// Obter sugestões da IA
function getAISuggestions() {
    // Simulação de uma IA que analisa o orçamento e faz sugestões
    const suggestions = [
        {
            title: "Ajuste de Preço",
            description: "Baseado em orçamentos similares, sugerimos aumentar o preço do primeiro item em 15% para melhor margem.",
            action: () => {
                const firstItem = document.querySelector('#items-container tr:first-child .item-price');
                if (firstItem) {
                    const currentPrice = parseFloat(firstItem.value) || 0;
                    firstItem.value = (currentPrice * 1.15).toFixed(2);
                    updatePreview();
                    showNotification('Preço ajustado conforme sugestão da IA');
                }
            }
        },
        {
            title: "Adicionar Item Recomendado",
            description: "Clientes que contratam serviços similares frequentemente incluem 'Suporte Técnico por 30 dias'. Considere adicionar.",
            action: () => {
                addItem();
                const newItem = document.querySelector('#items-container tr:last-child');
                newItem.querySelector('.item-desc').value = 'Suporte Técnico por 30 dias';
                newItem.querySelector('.item-qty').value = '1';
                newItem.querySelector('.item-price').value = '150.00';
                updatePreview();
                showNotification('Item recomendado adicionado');
            }
        },
        {
            title: "Melhorar Descrição",
            description: "Sua descrição atual é muito genérica. Sugerimos detalhar mais os benefícios para o cliente.",
            action: () => {
                document.getElementById('notes').value += '\n\nBenefícios incluídos:\n- Garantia de 90 dias\n- Suporte prioritário\n- Atualizações gratuitas';
                updatePreview();
                showNotification('Descrição melhorada com sugestões da IA');
            }
        }
    ];
    
    // Exibir sugestões
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'suggestion-item';
        suggestionElement.innerHTML = `
            <h4>${suggestion.title}</h4>
            <p>${suggestion.description}</p>
        `;
        
        suggestionElement.addEventListener('click', suggestion.action);
        suggestionsList.appendChild(suggestionElement);
    });
    
    // Mostrar seção de sugestões
    document.getElementById('ai-suggestions').style.display = 'block';
    showNotification('Sugestões da IA carregadas');
}

// Copiar mensagem personalizada
function copyMessage() {
    const message = `Prezado(a) ${currentBudget.clientName || 'Cliente'},

Segue o orçamento solicitado:

${currentBudget.budgetTitle}

Valor total: R$ ${currentBudget.totals?.total || '0.00'}

Este orçamento é válido por ${currentBudget.validity || '30'} dias.

Atenciosamente,
Sua Empresa`;

    navigator.clipboard.writeText(message).then(() => {
        showNotification('Mensagem copiada para a área de transferência!');
    });
}

// Mostrar modal de e-mail
function showEmailModal() {
    document.getElementById('email-modal').style.display = 'block';
    
    // Preencher campos com valores padrão
    document.getElementById('sender-name').value = 'Sua Empresa';
    document.getElementById('sender-email').value = 'contato@suaempresa.com';
    document.getElementById('email-subject').value = `Orçamento - ${currentBudget.budgetTitle}`;
    
    const message = `Prezado(a) ${currentBudget.clientName},

Segue em anexo o orçamento solicitado.

Valor total: R$ ${currentBudget.totals?.total || '0.00'}

Este orçamento é válido por ${currentBudget.validity || '30'} dias.

Atenciosamente,
Sua Empresa`;
    
    document.getElementById('email-message').value = message;
}

// Fechar modal de e-mail
function closeEmailModal() {
    document.getElementById('email-modal').style.display = 'none';
}

// Enviar e-mail
function sendEmail(e) {
    e.preventDefault();
    
    const senderName = document.getElementById('sender-name').value;
    const senderEmail = document.getElementById('sender-email').value;
    const subject = document.getElementById('email-subject').value;
    const message = document.getElementById('email-message').value;
    
    // Simulação de envio de e-mail
    // Em um ambiente real, você usaria um serviço como EmailJS ou uma API backend
    
    // Para demonstração, vamos simular o envio
    setTimeout(() => {
        closeEmailModal();
        showNotification('E-mail enviado com sucesso! (simulação)');
    }, 1000);
}

// Mostrar notificação
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

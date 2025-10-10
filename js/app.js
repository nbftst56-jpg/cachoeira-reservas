let currentMonth = new Date();
let currentTimelineMonth = new Date();
let reservas = [];
let contatos = [];
let limpezas = [];
let manutencoes = [];
let currentEditingId = null;

function parseDate(dateString) {
    
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;  
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

async function loadData() {
    try {
        await window.loadAllData();
        reservas = window.reservas;
        contatos = window.contatos;
        limpezas = window.limpezas || [];
        manutencoes = window.manutencoes || [];
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do servidor.');
    }
}

window.initializeApp = async function() {
    await loadData();
    updateCalendar();
    renderTimeline();
    updateStats();
    updateReservasTable();
    updateContatosTable();
    updateContatosStats();
    setupEventListeners();

    window.addEventListener('beforeunload', function(e) {
        
        if (reservas.length > 0 || contatos.length > 0) {
            const message = 'Lembre-se de fazer backup dos seus dados! Deseja realmente sair?';
            e.preventDefault();
            e.returnValue = message;
            return message;
        }
    });
}

function setupEventListeners() {
    document.getElementById('reservaFormElement').addEventListener('submit', handleReservaSubmit);
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    checkinInput.min = today;
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        checkinDate.setDate(checkinDate.getDate() + 1);
        checkoutInput.min = checkinDate.toISOString().split('T')[0];
    });

    setupAutocomplete();
}

function setupAutocomplete() {
    const nomeInput = document.getElementById('nome');
    const suggestionsContainer = document.getElementById('nomeSuggestions');
    let selectedSuggestionIndex = -1;
    let currentSuggestions = [];

    nomeInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        currentSuggestions = contatos.filter(contato => 
            contato.nome && contato.nome.toLowerCase().includes(query)
        );

        if (currentSuggestions.length > 0) {
            showSuggestions(currentSuggestions);
        } else {
            hideSuggestions();
        }
    });

    nomeInput.addEventListener('keydown', function(e) {
        if (currentSuggestions.length === 0) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, currentSuggestions.length - 1);
                updateSelectedSuggestion();
                break;
            
            case 'ArrowUp':
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSelectedSuggestion();
                break;
            
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    selectSuggestion(currentSuggestions[selectedSuggestionIndex]);
                }
                break;
            
            case 'Escape':
                hideSuggestions();
                break;
        }
    });

    document.addEventListener('click', function(e) {
        if (!nomeInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions();
        }
    });

    function showSuggestions(suggestions) {
        suggestionsContainer.innerHTML = '';
        selectedSuggestionIndex = -1;

        suggestions.forEach((contato, index) => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.style.cssText = 'padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background-color 0.2s ease;';
            
            suggestionDiv.innerHTML = `
                <div style="font-weight: 500; color: #1565c0;">${contato.nome}</div>
                <div style="font-size: 0.85rem; color: #666; margin-top: 2px;">
                    ${contato.whatsapp ? `📱 ${contato.whatsapp}` : 'Sem WhatsApp'}
                    ${contato.pais ? ` • ${contato.pais}` : ''}
                    ${contato.unidade ? ` • Pref: ${contato.unidade}` : ''}
                </div>
            `;

            suggestionDiv.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#e3f2fd';
            });

            suggestionDiv.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });

            suggestionDiv.addEventListener('click', () => selectSuggestion(contato));
            suggestionsContainer.appendChild(suggestionDiv);
        });

        suggestionsContainer.style.display = 'block';
    }

    function hideSuggestions() {
        suggestionsContainer.style.display = 'none';
        selectedSuggestionIndex = -1;
        currentSuggestions = [];
    }

    function updateSelectedSuggestion() {
        const suggestions = suggestionsContainer.querySelectorAll('div');
        suggestions.forEach((suggestion, index) => {
            if (index === selectedSuggestionIndex) {
                suggestion.style.backgroundColor = '#e3f2fd';
            } else {
                suggestion.style.backgroundColor = 'transparent';
            }
        });
    }

    function selectSuggestion(contato) {
        
        document.getElementById('nome').value = contato.nome;
        
        if (contato.whatsapp && contato.whatsapp.trim()) {
            document.getElementById('whatsapp').value = contato.whatsapp;
        }
        
        if (contato.pais && contato.pais.trim()) {
            document.getElementById('pais').value = contato.pais;
        }

        if (contato.unidade && contato.unidade.trim()) {
            document.getElementById('unidade').value = contato.unidade;
        }

        hideSuggestions();

        nomeInput.style.borderColor = '#4caf50';
        setTimeout(() => {
            nomeInput.style.borderColor = '#e0e0e0';
        }, 1000);

        document.getElementById('checkin').focus();
    }
}

function showTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    if (tabName === 'calendario') updateCalendar();
    else if (tabName === 'reservas') { updateReservasTable(); updateStats(); }
    else if (tabName === 'contatos') { updateContatosTable(); updateContatosStats(); }
}

function updateCalendar() {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    ['A6', 'A7', 'A8', 'A9'].forEach(unit => {
        renderCalendarForUnit(unit);
        updateUnitReservaCount(unit);
    });
}
['A6', 'A7', 'A8', 'A9'].forEach(unit => {
    
    const calendarHTML = `
        <div class="unit-calendar">
            <div class="unit-header">
                <h3>🏠 ${unit}</h3>
                <span class="reserva-count" id="count-${unit}">0 reservas</span>
            </div>
            <div class="calendar-days">
                <div class="weekdays">
                    <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>
                <div class="days" id="days-${unit}"></div>
            </div>
            <div class="legend-mini">
                <div><span class="dot entrada"></span>Entrada</div>
                <div><span class="dot saida"></span>Saída</div>
                <div><span class="dot sobreposicao"></span>Sobreposição</div>
                <div><span class="dot hospedagem"></span>Hospedagem</div>
            </div>
        </div>
    `;

    document.getElementById('calendar-grid').innerHTML += calendarHTML;
});

function renderCalendarForUnit(unit) {
    const daysContainer = document.getElementById(`days-${unit}`);
    daysContainer.innerHTML = '';
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = date.getDate();
        if (date.getMonth() !== currentMonth.getMonth()) dayElement.classList.add('other-month');
        const dayReservas = getReservasForDate(unit, date);
        const status = getDayStatus(unit, date);
        dayElement.classList.add(status);

        if (status !== 'livre') {
            dayElement.dataset.unit = unit;
            dayElement.dataset.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            dayElement.addEventListener('mouseenter', showTooltip);
            dayElement.addEventListener('mouseleave', hideTooltip);
            dayElement.addEventListener('mousemove', moveTooltip);
        }
        
        if (dayReservas.length > 1) {
            const badge = document.createElement('div');
            badge.className = 'day-badge';
            badge.textContent = dayReservas.length;
            dayElement.appendChild(badge);
        }
        daysContainer.appendChild(dayElement);
    }
}

function getReservasForDate(unit, date) {
    return reservas.filter(reserva => {
        if (reserva.unidade !== unit || reserva.status === 'Canc') return false;
        const checkinDate = parseDate(reserva.checkin);
        const checkoutDate = parseDate(reserva.checkout);
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return targetDate >= checkinDate && targetDate < checkoutDate;
    });
}

function getDayStatus(unit, date) {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const todasReservas = reservas.filter(r => r.unidade === unit && r.status !== 'Canc');
    
    let entradas = [];
    let saidas = [];
    let hospedagens = [];
    
    todasReservas.forEach(reserva => {
        const checkinDate = parseDate(reserva.checkin);
        const checkoutDate = parseDate(reserva.checkout);

        if (targetDate.getTime() === checkinDate.getTime()) {
            entradas.push(reserva);
        }

        if (targetDate.getTime() === checkoutDate.getTime()) {
            saidas.push(reserva);
        }

        if (targetDate >= checkinDate && targetDate < checkoutDate) {
            hospedagens.push(reserva);
        }
    });

    if (entradas.length > 0 && saidas.length > 0) {
        return 'sobreposicao';  
    } else if (entradas.length > 0) {
        return 'entrada';  
    } else if (saidas.length > 0) {
        return 'saida';  
    } else if (hospedagens.length > 0) {
        return 'hospedagem';  
    } else {
        return 'livre';  
    }
}

let tooltipElement = null;

function createTooltip() {
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip';
        document.body.appendChild(tooltipElement);
    }
    return tooltipElement;
}

function showTooltip(event) {
    const dayElement = event.currentTarget;
    const unit = dayElement.dataset.unit;
    const dateStr = dayElement.dataset.date;
    const date = parseDate(dateStr);
    
    const tooltip = createTooltip();
    const tooltipContent = getTooltipContent(unit, date);
    
    if (tooltipContent) {
        tooltip.innerHTML = tooltipContent;
        tooltip.classList.add('show');
        moveTooltip(event);
    }
}

function hideTooltip() {
    if (tooltipElement) {
        tooltipElement.classList.remove('show');
    }
}

function moveTooltip(event) {
    if (tooltipElement && tooltipElement.classList.contains('show')) {
        const x = event.clientX + 15;
        const y = event.clientY + 15;
        if (!tooltipElement) return;
        tooltipElement.style.left = x + 'px';
        tooltipElement.style.top = y + 'px';
    }
}

function getTooltipContent(unit, date) {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todasReservas = reservas.filter(r => r.unidade === unit && r.status !== 'Canc');
    
    let entradas = [];
    let saidas = [];
    let hospedagens = [];
    
    todasReservas.forEach(reserva => {
        const checkinDate = parseDate(reserva.checkin);
        const checkoutDate = parseDate(reserva.checkout);
        
        if (targetDate.getTime() === checkinDate.getTime()) {
            entradas.push(reserva);
        }
        
        if (targetDate.getTime() === checkoutDate.getTime()) {
            saidas.push(reserva);
        }
        
        if (targetDate >= checkinDate && targetDate < checkoutDate) {
            hospedagens.push(reserva);
        }
    });
    
    let content = '';

    if (entradas.length > 0 && saidas.length > 0) {
        content += '<strong>🔄 SOBREPOSIÇÃO</strong><br>';
        
        saidas.forEach(reserva => {
            content += `<div class="tooltip-divider"></div>`;
            content += `<strong>📤 SAÍDA:</strong> ${reserva.nome}<br>`;
            if (reserva.whatsapp) content += `📱 ${reserva.whatsapp}<br>`;
            content += `🏠 ${reserva.unidade}<br>`;
            content += `📅 ${formatDate(reserva.checkin)} → ${formatDate(reserva.checkout)}`;
        });
        
        entradas.forEach(reserva => {
            content += `<div class="tooltip-divider"></div>`;
            content += `<strong>📥 ENTRADA:</strong> ${reserva.nome}<br>`;
            if (reserva.whatsapp) content += `📱 ${reserva.whatsapp}<br>`;
            content += `🏠 ${reserva.unidade}<br>`;
            content += `📅 ${formatDate(reserva.checkin)} → ${formatDate(reserva.checkout)}`;
        });
    }
    
    else if (entradas.length > 0) {
        entradas.forEach((reserva, index) => {
            if (index > 0) content += `<div class="tooltip-divider"></div>`;
            content += `<strong>📥 ENTRADA:</strong> ${reserva.nome}<br>`;
            if (reserva.whatsapp) content += `📱 ${reserva.whatsapp}<br>`;
            content += `🏠 ${reserva.unidade}<br>`;
            content += `📅 ${formatDate(reserva.checkin)} → ${formatDate(reserva.checkout)}<br>`;
            content += `💰 R$ ${reserva.valor.toFixed(2)}`;
        });
    }
    
    else if (saidas.length > 0) {
        saidas.forEach((reserva, index) => {
            if (index > 0) content += `<div class="tooltip-divider"></div>`;
            content += `<strong>📤 SAÍDA:</strong> ${reserva.nome}<br>`;
            if (reserva.whatsapp) content += `📱 ${reserva.whatsapp}<br>`;
            content += `🏠 ${reserva.unidade}<br>`;
            content += `📅 ${formatDate(reserva.checkin)} → ${formatDate(reserva.checkout)}<br>`;
            content += `💰 R$ ${reserva.valor.toFixed(2)}`;
        });
    }
    
    else if (hospedagens.length > 0) {
        hospedagens.forEach((reserva, index) => {
            if (index > 0) content += `<div class="tooltip-divider"></div>`;
            content += `<strong>🏠 HOSPEDAGEM:</strong> ${reserva.nome}<br>`;
            if (reserva.whatsapp) content += `📱 ${reserva.whatsapp}<br>`;
            content += `🏠 ${reserva.unidade}<br>`;
            content += `📅 ${formatDate(reserva.checkin)} → ${formatDate(reserva.checkout)}<br>`;
            content += `💰 R$ ${reserva.valor.toFixed(2)}`;
        });
    }
    
    return content;
}

function updateUnitReservaCount(unit) {
    const countElement = document.getElementById(`count-${unit}`);
    if (countElement) {
        const count = reservas.filter(r => r.unidade === unit && r.status !== 'Canc').length;
        countElement.textContent = `${count} reservas`;
    }
}

function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    updateCalendar();
}

function changeTimelineMonth(direction) {
    currentTimelineMonth.setMonth(currentTimelineMonth.getMonth() + direction);
    renderTimeline();
}

function goToTimelineToday() {
    currentTimelineMonth = new Date();
    renderTimeline();
}

function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    const monthLabel = document.getElementById('timelineMonth');
    
    if (!container || !monthLabel) return;
    
    const year = currentTimelineMonth.getFullYear();
    const month = currentTimelineMonth.getMonth();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    monthLabel.textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let html = '<div class="timeline-wrapper"><div class="timeline-grid">';

    html += '<div class="timeline-header">';
    html += '<div class="timeline-unit-label">Unidade</div>';
    html += '<div class="timeline-days-header">';
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
        html += `<div class="timeline-day-header">${dayName}<span class="day-number">${day}</span></div>`;
    }
    
    html += '</div></div>';

    ['A6', 'A7', 'A8', 'A9'].forEach(unit => {
        html += '<div class="timeline-row">';
        html += `<div class="timeline-unit-cell">🏠 ${unit}</div>`;
        html += '<div class="timeline-days-row">';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = getDayStatus(unit, date);
            
            html += `<div class="timeline-day-cell ${status}" 
                          data-unit="${unit}" 
                          data-date="${dateStr}"
                          onmouseenter="showTooltip(event)"
                          onmouseleave="hideTooltip()"
                          onmousemove="moveTooltip(event)">
                     </div>`;
        }
        
        html += '</div></div>';
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

function goToToday() {
    currentMonth = new Date();
    updateCalendar();
}

function gerarRelatorio() {
    const mes = currentMonth.getMonth();
    const ano = currentMonth.getFullYear();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let relatorio = '';
    relatorio += '===========================================================================\n';
    relatorio += '                    RELATORIO DE RESERVAS E DISPONIBILIDADE\n';
    relatorio += '                    Cachoeira do Bom Jesus - Temporada 2025/2026\n';
    relatorio += '===========================================================================\n\n';
    relatorio += `Periodo: ${monthNames[mes]} de ${ano}\n`;
    relatorio += `Data de Geracao: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}\n\n`;

    const reservasAtivas = reservas.filter(r => r.status !== 'Canc');
    const reservasConfirmadas = reservas.filter(r => r.status === 'Conf');
    const valorTotal = reservasAtivas.reduce((sum, r) => sum + (r.valor || 0), 0);
    
    relatorio += '---------------------------------------------------------------------------\n';
    relatorio += '                           ESTATISTICAS GERAIS\n';
    relatorio += '---------------------------------------------------------------------------\n\n';
    relatorio += `Total de Reservas Ativas: ${reservasAtivas.length}\n`;
    relatorio += `Reservas Confirmadas: ${reservasConfirmadas.length}\n`;
    relatorio += `Valor Total: R$ ${valorTotal.toFixed(2)}\n\n`;

    const mesesTemporada = [
        { mes: 10, ano: 2025, nome: 'Nov/25' },
        { mes: 11, ano: 2025, nome: 'Dez/25' },
        { mes: 0, ano: 2026, nome: 'Jan/26' },
        { mes: 1, ano: 2026, nome: 'Fev/26' },
        { mes: 2, ano: 2026, nome: 'Mar/26' },
        { mes: 3, ano: 2026, nome: 'Abr/26' },
        { mes: 4, ano: 2026, nome: 'Mai/26' }
    ];
    
    const dadosDisponibilidade = {};
    
    ['A6', 'A7', 'A8', 'A9'].forEach(unit => {
        dadosDisponibilidade[unit] = {
            meses: [],
            totalDias: 0,
            totalOcupados: 0,
            totalLivres: 0,
            taxaGeral: 0
        };
        
        mesesTemporada.forEach(mesInfo => {
            const diasNoMes = new Date(mesInfo.ano, mesInfo.mes + 1, 0).getDate();
            let diasOcupados = 0;
            
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const date = new Date(mesInfo.ano, mesInfo.mes, dia);
                const reservasNoDia = getReservasForDate(unit, date);
                if (reservasNoDia.length > 0) {
                    diasOcupados++;
                }
            }
            
            const diasLivres = diasNoMes - diasOcupados;
            const taxaOcupacao = ((diasOcupados / diasNoMes) * 100).toFixed(1);
            
            dadosDisponibilidade[unit].meses.push({
                nome: mesInfo.nome,
                diasNoMes: diasNoMes,
                diasOcupados: diasOcupados,
                diasLivres: diasLivres,
                taxaOcupacao: taxaOcupacao
            });
            
            dadosDisponibilidade[unit].totalDias += diasNoMes;
            dadosDisponibilidade[unit].totalOcupados += diasOcupados;
        });
        
        dadosDisponibilidade[unit].totalLivres = dadosDisponibilidade[unit].totalDias - dadosDisponibilidade[unit].totalOcupados;
        dadosDisponibilidade[unit].taxaGeral = ((dadosDisponibilidade[unit].totalOcupados / dadosDisponibilidade[unit].totalDias) * 100).toFixed(1);
    });

    ['A6', 'A7', 'A8', 'A9'].forEach(unit => {
        const reservasUnit = reservasAtivas.filter(r => r.unidade === unit);
        
        relatorio += '===========================================================================\n';
        relatorio += `                                 ${unit}\n`;
        relatorio += '===========================================================================\n\n';
        
        if (reservasUnit.length === 0) {
            relatorio += '  - Nenhuma reserva cadastrada para esta unidade.\n\n';
        } else {
            relatorio += `  Total de Reservas: ${reservasUnit.length}\n\n`;

            reservasUnit.sort((a, b) => parseDate(a.checkin) - parseDate(b.checkin));

            const valorTotalUnit = reservasUnit.reduce((sum, r) => sum + (r.valor || 0), 0);
            
            reservasUnit.forEach((reserva, index) => {
                relatorio += `  Reserva ${index + 1}\n`;
                relatorio += `  Cliente: ${reserva.nome}\n`;
                if (reserva.whatsapp) {
                    relatorio += `  WhatsApp: ${reserva.whatsapp}\n`;
                }
                if (reserva.pais && reserva.pais !== 'Brasil') {
                    relatorio += `  País: ${reserva.pais}\n`;
                }
                relatorio += `  Check-in: ${formatDate(reserva.checkin)}\n`;
                relatorio += `  Check-out: ${formatDate(reserva.checkout)}\n`;
                
                const dias = Math.ceil((parseDate(reserva.checkout) - parseDate(reserva.checkin)) / (1000 * 60 * 60 * 24));
                relatorio += `  Duração: ${dias} dia(s)\n`;
                
                const statusText = getStatusText(reserva.status);
                relatorio += `  Status: ${statusText}\n`;
                relatorio += `  Valor Total: R$ ${reserva.valor.toFixed(2)}\n`;
                
                if (reserva.valorSinal && reserva.valorSinal > 0) {
                    relatorio += `  Valor do Sinal: R$ ${reserva.valorSinal.toFixed(2)}\n`;
                    const saldo = reserva.valor - reserva.valorSinal;
                    relatorio += `  Saldo Restante: R$ ${saldo.toFixed(2)}\n`;
                }
                
                if (reserva.dataPagamento) {
                    relatorio += `  Data do Pagamento: ${formatDate(reserva.dataPagamento)}\n`;
                }
                
                if (reserva.formaPagamento) {
                    relatorio += `  Forma de Pagamento: ${reserva.formaPagamento}\n`;
                }
                
                if (reserva.observacoes) {
                    relatorio += `  Obs: ${reserva.observacoes}\n`;
                }
                
                relatorio += '\n';
            });

            relatorio += '  ---------------------------------------------------------------------------\n';
            relatorio += `  VALOR TOTAL DA ${unit}: R$ ${valorTotalUnit.toFixed(2)}\n`;
            relatorio += '  ---------------------------------------------------------------------------\n\n';
        }
    });

    relatorio += '===========================================================================\n';
    relatorio += '           DISPONIBILIDADE DA TEMPORADA 2025/2026 (NOV/25 - MAI/26)\n';
    relatorio += '===========================================================================\n\n';

    relatorio += '  Unidade  - Nov/25 - Dez/25 - Jan/26 - Fev/26 - Mar/26 - Abr/26 - Mai/26 -  TOTAL\n';
    relatorio += '  ---------+--------+--------+--------+--------+--------+--------+--------+---------\n';

    ['A6', 'A7', 'A8', 'A9'].forEach(unit => {
        const dados = dadosDisponibilidade[unit];

        let linha = `  ${unit}     -`;
        dados.meses.forEach(m => {
            linha += ` ${m.diasOcupados.toString().padStart(2, ' ')}/${m.diasNoMes} -`;
        });
        linha += ` ${dados.totalOcupados}/${dados.totalDias}\n`;
        relatorio += linha;

        linha = `  Taxa (%) -`;
        dados.meses.forEach(m => {
            linha += ` ${m.taxaOcupacao.padStart(5, ' ')} -`;
        });
        linha += ` ${dados.taxaGeral.padStart(5, ' ')}\n`;
        relatorio += linha;
        
        relatorio += '  ---------+--------+--------+--------+--------+--------+--------+--------+---------\n';
    });
    
    relatorio += '\n  Legenda: Dias Ocupados/Total de Dias no Mes\n\n';
    
    relatorio += '===========================================================================\n';
    relatorio += '                              FIM DO RELATORIO\n';
    relatorio += '===========================================================================\n';

    mostrarModalRelatorio(relatorio);
}

function mostrarModalRelatorio(relatorio) {
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 900px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e0e0e0;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '📄 Relatório de Reservas';
    title.style.cssText = 'color: #1565c0; margin: 0;';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const textArea = document.createElement('textarea');
    textArea.value = relatorio;
    textArea.readOnly = true;
    textArea.style.cssText = `
        flex: 1;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        resize: none;
        margin-bottom: 20px;
        line-height: 1.5;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '💾 Baixar TXT';
    downloadBtn.className = 'btn-primary';
    downloadBtn.onclick = () => baixarRelatorio(relatorio);
    
    const printBtn = document.createElement('button');
    printBtn.textContent = '🖨️ Imprimir';
    printBtn.className = 'btn-secondary';
    printBtn.style.cssText = 'background: #2196f3; color: white;';
    printBtn.onclick = () => imprimirRelatorio(relatorio);
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(printBtn);
    
    modalContent.appendChild(header);
    modalContent.appendChild(textArea);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function baixarRelatorio(relatorio) {
    const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const filename = `Relatorio_Reservas_${monthNames[currentMonth.getMonth()]}_${currentMonth.getFullYear()}.txt`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function imprimirRelatorio(relatorio) {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Relatório de Reservas</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: "Courier New", monospace; font-size: 12px; line-height: 1.5; padding: 20px; }');
    printWindow.document.write('pre { white-space: pre-wrap; word-wrap: break-word; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<pre>' + relatorio + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function showReservaForm() {
    document.getElementById('reservaForm').style.display = 'block';
    document.getElementById('reservaFormElement').reset();
    document.getElementById('pais').value = 'Brasil';
    document.getElementById('status').value = 'Resv';
    document.getElementById('formTitle').textContent = 'Nova Reserva';
    currentEditingId = null;

    document.getElementById('nomeSuggestions').style.display = 'none';
    
    document.getElementById('reservaForm').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        document.getElementById('nome').focus();
    }, 300);
}

function hideReservaForm() {
    document.getElementById('reservaForm').style.display = 'none';
    currentEditingId = null;
}

function handleReservaSubmit(event) {
    event.preventDefault();
    try {
        const formData = {
            id: currentEditingId || Date.now(),
            nome: document.getElementById('nome').value.trim(),
            whatsapp: document.getElementById('whatsapp').value.trim(),
            pais: document.getElementById('pais').value.trim(),
            unidade: document.getElementById('unidade').value,
            checkin: document.getElementById('checkin').value,
            checkout: document.getElementById('checkout').value,
            status: document.getElementById('status').value,
            valor: parseFloat(document.getElementById('valor').value.replace(',', '.')) || 0,
            valorSinal: parseFloat(document.getElementById('valorSinal').value.replace(',', '.')) || 0,
            dataPagamento: document.getElementById('dataPagamento').value,
            formaPagamento: document.getElementById('formaPagamento').value,
            observacoes: document.getElementById('observacoes').value.trim()
        };
        if (!formData.nome) { alert('Nome do cliente é obrigatório!'); return; }
        if (!formData.unidade) { alert('Selecione uma unidade!'); return; }
        if (!formData.checkin || !formData.checkout) { alert('Datas de check-in e check-out são obrigatórias!'); return; }
        if (parseDate(formData.checkout) <= parseDate(formData.checkin)) { alert('A data de check-out deve ser posterior ao check-in!'); return; }
        const conflictResult = checkReservationConflicts(formData, currentEditingId);
        if (!conflictResult.valid) { alert(conflictResult.message); return; }
        
        await window.saveReserva(formData);
        reservas = window.reservas;
        updateReservasTable();
        updateStats();
        updateCalendar();
        renderTimeline();
        hideReservaForm();
        alert('Reserva salva com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar reserva:', error);
        alert('Erro ao salvar reserva. Tente novamente.');
    }
}

function checkReservationConflicts(newReserva, editingId = null) {
    const checkinDate = parseDate(newReserva.checkin);
    const checkoutDate = parseDate(newReserva.checkout);
    checkinDate.setHours(0, 0, 0, 0);
    checkoutDate.setHours(0, 0, 0, 0);
    const conflictingReservas = reservas.filter(reserva => reserva.unidade === newReserva.unidade && reserva.status !== 'Canc' && reserva.id !== editingId);
    for (let existingReserva of conflictingReservas) {
        const existingCheckin = parseDate(existingReserva.checkin);
        const existingCheckout = parseDate(existingReserva.checkout);
        existingCheckin.setHours(0, 0, 0, 0);
        existingCheckout.setHours(0, 0, 0, 0);
        const hasOverlap = !(checkoutDate <= existingCheckin || checkinDate >= existingCheckout);
        if (hasOverlap) {
            const sameDay = isSameDay(checkoutDate, existingCheckin) || isSameDay(checkinDate, existingCheckout);
            if (!sameDay) {
                return {
                    valid: false,
                    message: \`CONFLITO: A reserva de "\${newReserva.nome}" conflita com "\${existingReserva.nome}" na \${newReserva.unidade}.

Sobreposição só é permitida quando um cliente sai e outro entra no mesmo dia.\`
                };
            }
        }
    }
    return { valid: true };
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

function updateReservasTable() {
    const tbody = document.getElementById('reservasTable');
    tbody.innerHTML = '';
    if (reservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666; padding: 40px;">Nenhuma reserva cadastrada. Clique em "+ Nova Reserva" para começar.</td></tr>';
        return;
    }
    reservas.forEach(reserva => {
        const valor = typeof reserva.valor === 'number' ? reserva.valor : parseFloat(reserva.valor) || 0;
        const valorSinal = typeof reserva.valorSinal === 'number' ? reserva.valorSinal : parseFloat(reserva.valorSinal) || 0;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reserva.nome || 'Nome não informado'}</td>
            <td>${reserva.unidade || '-'}</td>
            <td>${formatDate(reserva.checkin)}</td>
            <td>${formatDate(reserva.checkout)}</td>
            <td><span class="status-badge status-${(reserva.status || 'resv').toLowerCase()}">${getStatusText(reserva.status)}</span></td>
            <td>R$ ${valor.toFixed(2)}</td>
            <td>${valorSinal > 0 ? 'R$ ' + valorSinal.toFixed(2) : '-'}</td>
            <td>
                <button class="btn-secondary" onclick="editReserva(${reserva.id})" style="margin-right: 5px; padding: 4px 8px; font-size: 0.8rem;">Editar</button>
                <button class="btn-secondary" onclick="deleteReserva(${reserva.id})" style="background: #f44336; color: white; padding: 4px 8px; font-size: 0.8rem;">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats() {
    const total = reservas.length;
    const confirmadas = reservas.filter(r => r.status === 'Conf').length;
    const reservadas = reservas.filter(r => r.status === 'Resv').length;
    const executadas = reservas.filter(r => r.status === 'Exec').length;
    document.getElementById('total-reservas').textContent = total;
    document.getElementById('confirmadas').textContent = confirmadas;
    document.getElementById('reservadas').textContent = reservadas;
    document.getElementById('executadas').textContent = executadas;
}

function showImportForm() { document.getElementById('importForm').style.display = 'block'; }
function hideImportForm() { document.getElementById('importForm').style.display = 'none'; }

function importContatos() {
    const text = document.getElementById('importText').value.trim();
    if (!text) { alert('Cole a lista de contatos antes de importar.'); return; }
    const lines = text.split('\n').filter(line => line.trim());
    let imported = 0;
    let duplicados = 0;
    let erros = [];
    
    lines.forEach((line, index) => {
        const parts = line.trim().split('-');
        if (parts.length >= 6) {
            const nomeNovo = parts[0].trim().toLowerCase();
            const whatsappNovo = parts[1].trim();

            const jaExiste = contatos.find(c => 
                c.nome.toLowerCase() === nomeNovo || 
                (c.whatsapp === whatsappNovo && whatsappNovo !== '')
            );
            
            if (!jaExiste) {
                const contato = {
                    id: crypto.randomUUID(),
                    nome: parts[0].trim(),
                    whatsapp: parts[1].trim(),
                    pais: parts[2].trim(),
                    tempo: parts[3].trim(),
                    unidade: parts[4].trim(),
                    status: parts[5].trim()
                };
                contatos.push(contato);
                imported++;
            } else {
                duplicados++;
            }
        } else {
            erros.push(`Linha ${index + 1}: "${line.trim()}" - Formato inválido`);
        }
    });

    updateContatosTable();
    updateContatosStats();
    hideImportForm();
    document.getElementById('importText').value = '';
    
    let message = `Importação concluída:\n✅ ${imported} novos contatos\n🔄 ${duplicados} duplicados ignorados`;
    if (erros.length > 0) {
        message += `\n❌ ${erros.length} erros encontrados:\n${erros.slice(0, 5).join('\n')}`;
        if (erros.length > 5) message += `\n... e mais ${erros.length - 5} erros.`;
    }
    alert(message);
}

function updateContatosTable() {
    const tbody = document.getElementById('contatosTable');
    tbody.innerHTML = '';
    if (contatos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666; padding: 40px;">Nenhum contato cadastrado. Use o botão "Importar Lista" para adicionar contatos.</td></tr>';
        return;
    }
    contatos.forEach(contato => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contato.nome}</td>
            <td>${contato.whatsapp || '-'}</td>
            <td>${contato.pais}</td>
            <td>${contato.tempo}</td>
            <td>${contato.unidade}</td>
            <td><span class="status-badge status-${(contato.status || 'aguardando').toLowerCase()}">${getStatusText(contato.status)}</span></td>
            <td><button class="btn-secondary" onclick="deleteContato('${contato.id}')" style="background: #f44336; color: white; padding: 4px 8px; font-size: 0.8rem;">Excluir</button></td>
        `;
        tbody.appendChild(row);
    });
}

function updateContatosStats() {
    const total = contatos.length;
    const comWhatsapp = contatos.filter(c => c.whatsapp && c.whatsapp.trim()).length;
    const aguardando = contatos.filter(c => c.status === 'Aguardando').length;
    document.getElementById('total-contatos').textContent = total;
    document.getElementById('com-whatsapp').textContent = comWhatsapp;
    document.getElementById('aguardando').textContent = aguardando;
}

function formatDate(dateString) {
    if (!dateString) return 'Data inválida';
    try { 
        
        const parts = dateString.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('pt-BR');
    }
    catch (error) { 
        console.error('Erro ao formatar data:', dateString, error);
        return 'Data inválida'; 
    }
}

function getStatusText(status) {
    const statusMap = { 'Resv': 'Reserva', 'Conf': 'Confirmada', 'Canc': 'Cancelada', 'Exec': 'Executada', 'Aguardando': 'Aguardando' };
    return statusMap[status] || 'Reserva';
}

function editReserva(id) {
    const reserva = reservas.find(r => r.id == id); 
    if (!reserva) {
        alert('Reserva não encontrada!');
        return;
    }
    
    document.getElementById('nome').value = reserva.nome || '';
    document.getElementById('whatsapp').value = reserva.whatsapp || '';
    document.getElementById('pais').value = reserva.pais || 'Brasil';
    document.getElementById('unidade').value = reserva.unidade || '';
    document.getElementById('checkin').value = reserva.checkin || '';
    document.getElementById('checkout').value = reserva.checkout || '';
    document.getElementById('status').value = reserva.status || 'Resv';
    document.getElementById('valor').value = reserva.valor || 0;
    document.getElementById('valorSinal').value = reserva.valorSinal || 0;
    document.getElementById('dataPagamento').value = reserva.dataPagamento || '';
    document.getElementById('formaPagamento').value = reserva.formaPagamento || '';
    document.getElementById('observacoes').value = reserva.observacoes || '';
    
    currentEditingId = id;
    document.getElementById('formTitle').textContent = 'Editar Reserva';
    document.getElementById('reservaForm').style.display = 'block';
    document.getElementById('reservaForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteReserva(id) {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
        try {
            await window.deleteReserva(id);
            reservas = window.reservas;
            updateReservasTable();
            updateStats();
            updateCalendar();
            renderTimeline();
            alert('Reserva excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir reserva:', error);
            alert('Erro ao excluir reserva. Tente novamente.');
        }
    }
}

async function deleteContato(id) {
    if (confirm('Tem certeza que deseja excluir este contato?')) {
        try {
            await window.deleteContato(id);
            contatos = window.contatos;
            updateContatosTable();
            updateContatosStats();
            alert('Contato excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir contato:', error);
            alert('Erro ao excluir contato. Tente novamente.');
        }
    }
}

function exportarBackup() {
    try {
        const backup = {
            versao: '1.0',
            data: new Date().toISOString(),
            reservas: reservas,
            contatos: contatos,
            totalReservas: reservas.length,
            totalContatos: contatos.length
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `backup-cachoeira-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Backup exportado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar backup:', error);
        alert('Erro ao exportar backup. Tente novamente.');
    }
}

function showImportBackup() {
    document.getElementById('importBackupForm').style.display = 'block';
}

function hideImportBackup() {
    document.getElementById('importBackupForm').style.display = 'none';
    document.getElementById('backupFile').value = '';
}

async function importBackupToFirestore(backup) {
    try {
        const importedReservas = Array.isArray(backup.reservas) ? backup.reservas : [];
        const importedContatos = Array.isArray(backup.contatos) ? backup.contatos : [];

        const validReservas = importedReservas.filter(r => r && r.nome && r.unidade);
        const validContatos = importedContatos.filter(c => c && c.nome);

        if (window.firebaseDb && window.firebaseModules) {
            const { collection, getDocs, deleteDoc, doc, addDoc } = window.firebaseModules;
            const db = window.firebaseDb;

            const reservasSnap = await getDocs(collection(db, 'reservas'));
            for (const docSnap of reservasSnap.docs) {
                await deleteDoc(doc(db, 'reservas', docSnap.id));
            }

            const contatosSnap = await getDocs(collection(db, 'contatos'));
            for (const docSnap of contatosSnap.docs) {
                await deleteDoc(doc(db, 'contatos', docSnap.id));
            }

            for (const reserva of validReservas) {
                const { id, ...data } = reserva;
                await addDoc(collection(db, 'reservas'), data);
            }

            for (const contato of validContatos) {
                const { id, ...data } = contato;
                await addDoc(collection(db, 'contatos'), data);
            }

            await window.loadAllData();
            reservas = window.reservas;
            contatos = window.contatos;

            updateCalendar();
            renderTimeline();
            updateReservasTable();
            updateStats();
            updateContatosTable();
            updateContatosStats();
            
            hideImportBackup();
            alert(`Backup importado com sucesso!\n\n✅ ${validReservas.length} reservas\n✅ ${validContatos.length} contatos`);
        }
    } catch (error) {
        console.error('Erro ao importar backup:', error);
        alert('Erro ao importar backup para o Firestore. Tente novamente.');
    }
}

function importarBackup() {
    const fileInput = document.getElementById('backupFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Selecione um arquivo de backup!');
        return;
    }
    
    if (!file.name.endsWith('.json')) {
        alert('Por favor, selecione um arquivo JSON válido!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            if (!backup.reservas || !backup.contatos) {
                alert('Arquivo de backup inválido! Estrutura não reconhecida.');
                return;
            }
            
            if (confirm(`Importar backup de ${backup.data ? new Date(backup.data).toLocaleDateString('pt-BR') : 'data desconhecida'}?\n\nReservas: ${backup.totalReservas || backup.reservas.length}\nContatos: ${backup.totalContatos || backup.contatos.length}\n\n⚠️ ATENÇÃO: Isso substituirá todos os dados atuais!`)) {
                
                importBackupToFirestore(backup);
            }
            
        } catch (error) {
            console.error('Erro ao importar backup:', error);
            alert('Erro ao ler o arquivo de backup. Verifique se é um arquivo JSON válido.');
        }
    };
    
    reader.readAsText(file);
}

async function limparTodosDados() {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá APAGAR TODOS OS DADOS!\n\n• Todas as reservas\n• Todos os contatos\n• Configurações\n\nEsta ação NÃO PODE SER DESFEITA!\n\nTem certeza que deseja continuar?')) {
        if (confirm('ÚLTIMA CONFIRMAÇÃO:\n\nApagar PERMANENTEMENTE todos os dados?')) {
            try {
                
                if (window.firebaseDb && window.firebaseModules) {
                    const { collection, getDocs, deleteDoc, doc } = window.firebaseModules;
                    const db = window.firebaseDb;

                    const reservasSnap = await getDocs(collection(db, 'reservas'));
                    for (const docSnap of reservasSnap.docs) {
                        await deleteDoc(doc(db, 'reservas', docSnap.id));
                    }

                    const contatosSnap = await getDocs(collection(db, 'contatos'));
                    for (const docSnap of contatosSnap.docs) {
                        await deleteDoc(doc(db, 'contatos', docSnap.id));
                    }
                }

                reservas = [];
                contatos = [];
                currentEditingId = null;

                updateCalendar();
                renderTimeline();
                updateReservasTable();
                updateStats();
                updateContatosTable();
                updateContatosStats();

                hideReservaForm();
                hideImportForm();
                hideImportBackup();
                
                alert('✅ Todos os dados foram apagados com sucesso!');
            } catch (error) {
                console.error('Erro ao limpar dados:', error);
                alert('Erro ao limpar dados. Tente novamente.');
            }
        }
    }
}
// 🔄 Inicialização segura da aplicação após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.initializeApp === "function") {
        window.initializeApp();
    } else {
        console.error("❌ initializeApp ainda não está disponível — tentando novamente em 1s...");
        setTimeout(() => {
            if (typeof window.initializeApp === "function") window.initializeApp();
            else console.error("⚠️ Falha ao carregar initializeApp após 1s.");
        }, 1000);
    }
});

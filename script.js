        // Função para formatar o valor como moeda brasileira
        function formatCurrency(input) {
            let value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
            value = (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); // Formata como moeda BRL
            input.value = value; // Atualiza o valor do campo de entrada
        }

        // Função para converter uma string de moeda em número
        function parseCurrency(value) {
            return parseFloat(value.replace(/[^0-9,-]+/g, '').replace(',', '.')) || 0; // Remove caracteres não numéricos e converte para float
        }

        // Função para calcular os juros compostos
        function calculate() {
            const initialValue = parseCurrency(document.getElementById('initialValue').value); // Valor inicial
            const monthlyValue = parseCurrency(document.getElementById('monthlyValue').value); // Valor mensal
            let interestRate = parseFloat(document.getElementById('interestRate').value); // Taxa de juros
            const interestType = document.getElementById('interestType').value; // Tipo de taxa (anual ou mensal)
            let period = parseInt(document.getElementById('period').value); // Período de tempo
            const periodType = document.getElementById('periodType').value; // Tipo de período (anos ou meses)

            // Validação dos campos
            if (isNaN(initialValue) || isNaN(monthlyValue) || isNaN(interestRate) || isNaN(period)) {
                alert("Por favor, preencha todos os campos corretamente."); // Alerta caso algum campo esteja incorreto
                return;
            }

            // Conversão da taxa de juros anual para mensal, se necessário
            if (interestType === 'annual') {
                interestRate = Math.pow(1 + interestRate / 100, 1 / 12) - 1;
            } else {
                interestRate /= 100;
            }

            // Conversão do período de anos para meses, se necessário
            if (periodType === 'years') {
                period *= 12; // Converte anos em meses para o cálculo
            }

            let totalInvested = initialValue; // Valor total investido inicial
            const investedData = [initialValue]; // Armazena dados de investimento para o gráfico
            const interestData = [0]; // Armazena dados de juros para o gráfico
            const labels = ['Início']; // Rótulos para o gráfico

            // Loop para calcular o valor total e juros ao longo do tempo
            for (let i = 1; i <= period; i++) {
                totalInvested += monthlyValue;
                const totalAmount = initialValue * Math.pow(1 + interestRate, i) +
                                    monthlyValue * ((Math.pow(1 + interestRate, i) - 1) / interestRate);

                const totalInterest = totalAmount - totalInvested;

                // Adiciona dados para o gráfico e tabela, limitando a quantidade de pontos
                if ((periodType === 'months' && i <= 50) || (periodType === 'years' && i % 12 === 0 && i / 12 <= 50)) {
                    investedData.push(totalInvested);
                    interestData.push(totalInterest);
                    labels.push(periodType === 'years' ? i / 12 : i);
                }
            }

            // Renderiza o gráfico usando os dados calculados
            renderChart(investedData, interestData, labels, periodType);
            // Renderiza a tabela com os resultados
            renderTable(labels, investedData, interestData);

            const finalTotal = initialValue * Math.pow(1 + interestRate, period) +
                               monthlyValue * ((Math.pow(1 + interestRate, period) - 1) / interestRate);

            // Exibe os resultados finais na interface
            document.getElementById('result').innerHTML = `
                <div class="result-block">
                    <strong>Valor Total Final</strong>
                    <p>R$ ${finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div class="result-block">
                    <strong>Valor Total Investido</strong>
                    <p>R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div class="result-block">
                    <strong>Total em Juros</strong>
                    <p>R$ ${(finalTotal - totalInvested).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            `;

            // Mostrar o bloco de resultados
            document.getElementById('result-container').style.display = 'block';

            // Mover a calculadora para cima
            document.querySelector('.content-wrapper').style.marginTop = '20px';
        }

        // Função para limpar os campos do formulário
        function clearFields() {
            document.getElementById('initialValue').value = '';
            document.getElementById('monthlyValue').value = '';
            document.getElementById('interestRate').value = '';
            document.getElementById('period').value = '';
            document.getElementById('result').innerText = '';
            document.getElementById('table-container').innerHTML = '';
            document.getElementById('result-container').style.display = 'none'; // Esconder o bloco de resultados
            document.querySelector('.content-wrapper').style.marginTop = '50px'; // Resetar a posição da calculadora
            if (window.myChart) {
                window.myChart.destroy();
            }
        }

        // Função para renderizar o gráfico de crescimento
        function renderChart(investedData, interestData, labels, periodType) {
            const ctx = document.getElementById('growthChart').getContext('2d');
            if (window.myChart) {
                window.myChart.destroy();
            }

            const themeColor = document.body.classList.contains('dark-theme') ? '#fff' : '#000';

            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Valor Investido',
                            data: investedData,
                            borderColor: themeColor,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.1
                        },
                        {
                            label: 'Total em Juros',
                            data: interestData,
                            borderColor: '#077728',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: themeColor
                            }
                        },
                        tooltip: {
                            intersect: false,
                            mode: 'index',
                            callbacks: {
                                label: function(context) {
                                    return `R$ ${context.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                }
                            }
                        },
                        hover: {
                            mode: 'index',
                            axis: 'x'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: periodType === 'years' ? 'Anos' : 'Meses',
                                color: themeColor
                            },
                            ticks: {
                                color: themeColor,
                                callback: function(value) { return value; }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Valor',
                                color: themeColor
                            },
                            ticks: {
                                color: themeColor,
                                callback: function(value) {
                                    if (value >= 1000) {
                                        return (value / 1000).toFixed(1) + 'k';
                                    }
                                    return value;
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    elements: {
                        line: {
                            borderWidth: 2
                        },
                        point: {
                            radius: 3,
                            hoverRadius: 5
                        }
                    },
                    layout: {
                        padding: {
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20
                        }
                    }
                }
            });
        }

        // Função para renderizar a tabela com os resultados
        function renderTable(labels, investedData, interestData) {
            const tableContainer = document.getElementById('table-container');
            let html = `<table class="styled-table"><tr>
                <th>Período</th>
                <th>Valor Investido</th>
                <th>Total em Juros</th>
            </tr>`;

            for (let i = 0; i < labels.length; i++) {
                html += `<tr>
                    <td>${labels[i]}</td>
                    <td>R$ ${investedData[i].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>R$ ${interestData[i].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>`;
            }

            html += '</table>';
            tableContainer.innerHTML = html;
        }

        // Função para alternar entre temas claro e escuro
        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
            const themeIcon = document.getElementById('theme-toggle');
            themeIcon.textContent = document.body.classList.contains('dark-theme') ? '🌞' : '🌙';
            if (window.myChart) {
                const themeColor = document.body.classList.contains('dark-theme') ? '#fff' : '#000';
                window.myChart.data.datasets[0].borderColor = themeColor;
                window.myChart.options.plugins.legend.labels.color = themeColor;
                window.myChart.options.scales.x.title.color = themeColor;
                window.myChart.options.scales.x.ticks.color = themeColor;
                window.myChart.options.scales.y.title.color = themeColor;
                window.myChart.options.scales.y.ticks.color = themeColor;
                window.myChart.update();
            }
        }

        // Função para exportar os dados da tabela para um arquivo Excel
        function exportToExcel() {
            let table = document.querySelector('.styled-table');
            if (!table) {
                alert('Nenhuma tabela disponível para exportar.');
                return;
            }

            // Cria uma matriz de dados a partir da tabela
            const data = [];
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const rowData = [];
                row.querySelectorAll('th, td').forEach(cell => {
                    rowData.push(cell.innerText);
                });
                data.push(rowData);
            });

            // Cria uma nova planilha
            const worksheet = XLSX.utils.aoa_to_sheet(data);

            // Define largura das colunas
            worksheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }];

            // Cria um novo livro de trabalho e adiciona a planilha
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');

            // Salva o arquivo Excel
            XLSX.writeFile(workbook, 'resultado.xlsx');
        }
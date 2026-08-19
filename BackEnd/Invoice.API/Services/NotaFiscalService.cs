    namespace Invoice.API.Services;

    using Invoice.API.DTOs;
    using Invoice.API.Models;
    using Invoice.API.Repositories;

    public class NotaFiscalService : INotaFiscalService
    {
        private readonly INotaFiscalRepository _repository;
        private readonly IStockIntegrationService _stockService;

        public NotaFiscalService(INotaFiscalRepository repository, IStockIntegrationService stockService)
        {
            _repository = repository;
            _stockService = stockService;
        }

        public async Task<IEnumerable<NotaFiscal>> ObterTodasAsync()
        {
            return await _repository.ObterTodasAsync();
        }

        public async Task<NotaFiscal?> ObterPorIdAsync(int id)
        {
            return await _repository.ObterPorIdAsync(id);
        }

        public async Task<NotaFiscal> CriarAsync(CriarNotaFiscalDto dto)
        {
            if (dto.Itens == null || !dto.Itens.Any())
            {
                throw new ArgumentException("A nota fiscal deve conter pelo menos um item.");
            }

            var novaNota = new NotaFiscal
            {
                Status = "Aberta",
                DataCriacao = DateTime.UtcNow,
                Itens = dto.Itens.Select(i => new ItemNotaFiscal
                {
                    ProdutoId = i.ProdutoId,
                    Quantidade = i.Quantidade
                }).ToList()
            };

            var newId = await _repository.CriarAsync(novaNota);
            var notaCriada = await _repository.ObterPorIdAsync(newId);

            if (notaCriada == null)
            {
                throw new InvalidOperationException("Erro ao recuperar nota fiscal criada.");
            }

            return notaCriada;
        }

        public async Task<(bool Sucesso, string Mensagem)> ImprimirAsync(int id)
        {
            var nota = await _repository.ObterPorIdAsync(id);
            if (nota == null)
            {
                return (false, $"Nota fiscal com ID {id} não encontrada.");
            }

            if (nota.Status != "Aberta")
            {
                return (false, $"Apenas notas fiscais com status 'Aberta' podem ser impressas. Status atual: '{nota.Status}'.");
            }

            foreach (var item in nota.Itens)
            {
                var sucesso = await _stockService.AbaterSaldoEstoqueAsync(item.ProdutoId, item.Quantidade);
                if (!sucesso)
                {
                    return (false, $"Falha ao abater saldo do produto {item.ProdutoId} no estoque. Impressão cancelada.");
                }
            }

            var atualizado = await _repository.AtualizarStatusAsync(id, "Fechada");
            if (!atualizado)
            {
                return (false, "Estoque abatido, porém ocorreu uma falha ao atualizar o status da nota fiscal.");
            }

            return (true, "Nota fiscal impressa e estoque atualizado com sucesso.");
        }
    }

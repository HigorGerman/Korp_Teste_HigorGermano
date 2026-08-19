namespace Stock.API.Exceptions;

using System;

/// <summary>
/// Exceção de negócio lançada quando uma operação de débito de estoque falha devido a
/// saldo insuficiente ou a um conflito de concorrência (Race Condition) no banco de dados.
/// </summary>
public class EstoqueInsuficienteException : Exception
{
    public EstoqueInsuficienteException(string message) : base(message)
    {
    }

    public EstoqueInsuficienteException(string message, Exception innerException) : base(message, innerException)
    {
    }
}

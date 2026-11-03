package com.senai.layane.comprebem.dto;

import java.math.BigDecimal;

public record ProdutoRequestDTO(
        String nome,
        String descricao,
        BigDecimal preco,
        String categoria,
        String imagem
) {
}

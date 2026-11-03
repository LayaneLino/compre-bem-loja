package com.senai.layane.comprebem.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.senai.layane.comprebem.entity.Produto;

public record ProdutoResponseDTO(
        UUID produtoId,
        String nome,
        String descricao,
        BigDecimal preco,
        String categoria,
        String imagem
) {
    public static  ProdutoResponseDTO toDto(Produto produto) {
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getCategoria(),
                produto.getImagem()
        );
    }
}

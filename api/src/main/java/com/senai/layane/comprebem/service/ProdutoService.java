package com.senai.layane.comprebem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.senai.layane.comprebem.dto.ProdutoRequestDTO;
import com.senai.layane.comprebem.dto.ProdutoResponseDTO;
import com.senai.layane.comprebem.entity.Produto;
import com.senai.layane.comprebem.exception.ResourceNotFoundException;
import com.senai.layane.comprebem.repository.ProdutoRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public Page<ProdutoResponseDTO> findAll(String busca, Pageable pageable) {
        int size = pageable.getPageSize() > 50 ? 50 : pageable.getPageSize();
        Pageable validPageable = PageRequest.of(pageable.getPageNumber(), size, pageable.getSort());

        Page<Produto> produtosPage;

        if (busca != null && !busca.trim().isEmpty()) {
            produtosPage = produtoRepository.findByNomeContainingIgnoreCase(busca, validPageable);
        } else {
            produtosPage = produtoRepository.findAll(validPageable);
        }

        return produtosPage.map(ProdutoResponseDTO::toDto);
    }

    public ProdutoResponseDTO findById(UUID id) {
        var produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));

        return ProdutoResponseDTO.toDto(produto);
    }
    
    public ProdutoResponseDTO save(ProdutoRequestDTO produto) {
        Produto produtoSalvo = produtoRepository.save(Produto.toEntity(produto));
        return ProdutoResponseDTO.toDto(produtoSalvo);
    }

    public void delete(UUID produtoId) {
        produtoRepository.deleteById(produtoId);
    }

    public ProdutoResponseDTO update(UUID produtoId, ProdutoRequestDTO produto) {
        Produto produtoExistente = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));

        produtoExistente.setNome(produto.nome());
        produtoExistente.setDescricao(produto.descricao());
        produtoExistente.setPreco(produto.preco());
        produtoExistente.setCategoria(produto.categoria());
        produtoExistente.setImagem(produto.imagem());

        Produto produtoAtualizado = produtoRepository.save(produtoExistente);
        return ProdutoResponseDTO.toDto(produtoAtualizado);
    }
}
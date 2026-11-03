package com.senai.layane.comprebem.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.senai.layane.comprebem.entity.Produto;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {

    @Query("SELECT p FROM Produto p WHERE p.nome LIKE %:filtro% OR p.descricao LIKE %:filtro%")
    List<Produto> findByFiltro(String filtro);

    Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}

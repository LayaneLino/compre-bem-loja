package com.senai.layane.comprebem.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.senai.layane.comprebem.entity.Produto;

import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {

    @Query("SELECT p FROM Produto p " +
            "WHERE LOWER(p.nome) LIKE LOWER(CONCAT('%', :filtro, '%')) " +
            "OR LOWER(p.descricao) LIKE LOWER(CONCAT('%', :filtro, '%'))")
    Page<Produto> findByFiltro(@Param("filtro") String filtro, Pageable pageable);

    Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}

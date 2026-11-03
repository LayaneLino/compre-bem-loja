package com.senai.layane.comprebem.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.senai.layane.comprebem.entity.Produto;
import com.senai.layane.comprebem.repository.ProdutoRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class PopulaBase {

    @Bean
    CommandLineRunner initDatabase(ProdutoRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<Produto> produtos = new ArrayList<>();
                
                for (int i = 1; i <= 60; i++) {
                    Produto p = new Produto();
                    p.setNome(i % 2 == 0 ? "Cadeira Gamer " + i : "Mesa de Escritório " + i);
                    p.setPreco(new BigDecimal("100.00").multiply(new BigDecimal(i)));
                    p.setDescricao("Descrição detalhada do produto " + i);
                    p.setCategoria(i % 2 == 0 ? "Móveis" : "Escritório");
                    p.setImagem("http://imagem.com/produto" + i + ".png");
                    p.setQuantidade(50);
                    produtos.add(p);
                }
                
                repository.saveAll(produtos);
                System.out.println("60 Produtos inseridos com sucesso para teste!");
            }
        };
    }
}
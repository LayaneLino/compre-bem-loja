package com.senai.layane.comprebem;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition
public class ComprebemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComprebemApplication.class, args);
    }

}

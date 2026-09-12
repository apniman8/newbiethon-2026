package com.example.newbie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class NewbieApplication {

	public static void main(String[] args) {
		SpringApplication.run(NewbieApplication.class, args);
	}

}

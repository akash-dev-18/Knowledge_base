package com.springboot.backend.service;


import com.springboot.backend.dto.request.UpdateCompanyRequest;
import com.springboot.backend.dto.response.CompanyResponse;
import com.springboot.backend.entity.Company;
import com.springboot.backend.mapper.CompanyMapper;
import com.springboot.backend.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;


    @Transactional
    public Company create(String name ,String description){
        if (companyRepository.existsByName(name)){
            throw new RuntimeException("Company already exists "+name );
        }
        return  companyRepository.save(Company.builder()
                .name(name)
                .description(description)
                .build());
    }

    @Transactional
    public CompanyResponse update(UUID id, UpdateCompanyRequest request){
        Company company=companyRepository.findById(id).orElseThrow(()-> new RuntimeException("Company not exists."));

        if (request.getName()!=null){
            company.setName(request.getName());
        }
        if (request.getDescription()!= null){
            company.setDescription(request.getDescription());
        }
        if (request.getLogoUrl()!=null){
        company.setLogoUrl(request.getLogoUrl());
        }

        return companyMapper.toResponse(company);

    }

    @Transactional
    public void delete(UUID id){
        Company company=companyRepository.findById(id).orElseThrow(()-> new RuntimeException("Company does not exist."));
        companyRepository.deleteById(id) ;
    }


    public CompanyResponse getById(UUID id){
        return companyMapper.toResponse(companyRepository.findById(id).orElseThrow(()-> new RuntimeException("Company does not exist.")));

    }


}

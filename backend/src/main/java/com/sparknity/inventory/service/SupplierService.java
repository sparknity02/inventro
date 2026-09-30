package com.sparknity.inventory.service;

import com.sparknity.inventory.dto.SupplierRequest;
import com.sparknity.inventory.dto.SupplierResponse;
import com.sparknity.inventory.entity.Supplier;
import com.sparknity.inventory.exception.ResourceNotFoundException;
import com.sparknity.inventory.repository.ItemRepository;
import com.sparknity.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ItemRepository itemRepository;

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(SupplierResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = findSupplierEntityById(id);
        return SupplierResponse.fromEntity(supplier);
    }

    public Supplier findSupplierEntityById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier with ID " + id + " not found"));
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .build();
        Supplier saved = supplierRepository.save(supplier);
        return SupplierResponse.fromEntity(saved);
    }

    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = findSupplierEntityById(id);
        supplier.setName(request.getName().trim());
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        supplier.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        Supplier updated = supplierRepository.save(supplier);
        return SupplierResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier with ID " + id + " not found");
        }
        if (itemRepository.existsBySupplierId(id)) {
            throw new IllegalStateException("Cannot delete supplier: supplier is currently associated with active inventory items.");
        }
        supplierRepository.deleteById(id);
    }
}

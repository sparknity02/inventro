package com.sparknity.inventory.service;

import com.sparknity.inventory.dto.SupplierRequest;
import com.sparknity.inventory.dto.SupplierResponse;
import com.sparknity.inventory.entity.Supplier;
import com.sparknity.inventory.exception.ResourceNotFoundException;
import com.sparknity.inventory.repository.ItemRepository;
import com.sparknity.inventory.repository.SupplierRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private SupplierService supplierService;

    @Test
    @DisplayName("Should create supplier successfully")
    void shouldCreateSupplier() {
        SupplierRequest request = SupplierRequest.builder()
                .name("TechCorp")
                .phone("9876543210")
                .email("info@techcorp.com")
                .build();

        Supplier savedSupplier = Supplier.builder()
                .id(1L)
                .name("TechCorp")
                .phone("9876543210")
                .email("info@techcorp.com")
                .build();

        when(supplierRepository.save(any(Supplier.class))).thenReturn(savedSupplier);

        SupplierResponse response = supplierService.createSupplier(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("TechCorp", response.getName());
        verify(supplierRepository, times(1)).save(any(Supplier.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when supplier not found")
    void shouldThrowExceptionWhenSupplierNotFound() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> supplierService.getSupplierById(99L));
        verify(supplierRepository, times(1)).findById(99L);
    }
}

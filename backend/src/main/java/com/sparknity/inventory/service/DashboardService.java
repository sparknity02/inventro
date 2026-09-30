package com.sparknity.inventory.service;

import com.sparknity.inventory.dto.DashboardResponse;
import com.sparknity.inventory.repository.ItemRepository;
import com.sparknity.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ItemRepository itemRepository;
    private final SupplierRepository supplierRepository;

    public DashboardResponse getDashboardStatistics() {
        long totalItems = itemRepository.count();
        long totalSuppliers = supplierRepository.count();
        long lowStockItems = itemRepository.countByQuantityLessThan(10);
        Double totalInventoryValue = itemRepository.calculateTotalInventoryValue();

        return DashboardResponse.builder()
                .totalItems(totalItems)
                .totalSuppliers(totalSuppliers)
                .lowStockItems(lowStockItems)
                .totalInventoryValue(totalInventoryValue != null ? totalInventoryValue : 0.0)
                .build();
    }
}

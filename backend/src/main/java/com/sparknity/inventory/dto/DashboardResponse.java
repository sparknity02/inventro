package com.sparknity.inventory.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalItems;
    private long totalSuppliers;
    private long lowStockItems;
    private Double totalInventoryValue;
}

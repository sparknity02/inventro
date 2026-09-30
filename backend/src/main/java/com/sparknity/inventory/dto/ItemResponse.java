package com.sparknity.inventory.dto;

import com.sparknity.inventory.entity.Item;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {

    private Long id;
    private String name;
    private String category;
    private Integer quantity;
    private Double price;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ItemResponse fromEntity(Item item) {
        if (item == null) return null;
        return ItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .category(item.getCategory())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .supplierId(item.getSupplier() != null ? item.getSupplier().getId() : null)
                .supplierName(item.getSupplier() != null ? item.getSupplier().getName() : null)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}

package com.sparknity.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;
}

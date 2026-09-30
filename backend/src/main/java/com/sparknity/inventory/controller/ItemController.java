package com.sparknity.inventory.controller;

import com.sparknity.inventory.dto.ItemRequest;
import com.sparknity.inventory.dto.ItemResponse;
import com.sparknity.inventory.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Tag(name = "Items", description = "Inventory Item Management API")
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    @Operation(summary = "Get items with optional filtering by name and category, or pagination")
    public ResponseEntity<?> getItems(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        if (page != null && size != null) {
            Page<ItemResponse> pagedResult = itemService.getItemsPaged(
                    name,
                    category,
                    PageRequest.of(page, size, Sort.by("id").descending())
            );
            return ResponseEntity.ok(pagedResult);
        }

        return ResponseEntity.ok(itemService.getItems(name, category));
    }

    @GetMapping("/search")
    @Operation(summary = "Search items by name")
    public ResponseEntity<List<ItemResponse>> searchItems(@RequestParam String name) {
        return ResponseEntity.ok(itemService.getItems(name, null));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get items with quantity below threshold (default 10)")
    public ResponseEntity<List<ItemResponse>> getLowStockItems(
            @RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(itemService.getLowStockItems(threshold));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get list of distinct item categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(itemService.getCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item by ID")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new inventory item")
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody ItemRequest request) {
        ItemResponse created = itemService.createItem(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing inventory item")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request) {
        return ResponseEntity.ok(itemService.updateItem(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an inventory item")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}

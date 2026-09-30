package com.sparknity.inventory.service;

import com.sparknity.inventory.dto.ItemRequest;
import com.sparknity.inventory.dto.ItemResponse;
import com.sparknity.inventory.entity.Item;
import com.sparknity.inventory.entity.Supplier;
import com.sparknity.inventory.exception.ResourceNotFoundException;
import com.sparknity.inventory.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final SupplierService supplierService;

    public List<ItemResponse> getItems(String name, String category) {
        List<Item> items;
        boolean hasName = name != null && !name.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();

        if (hasName && hasCategory) {
            items = itemRepository.findByNameContainingIgnoreCaseAndCategoryIgnoreCase(name.trim(), category.trim());
        } else if (hasName) {
            items = itemRepository.findByNameContainingIgnoreCase(name.trim());
        } else if (hasCategory) {
            items = itemRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            items = itemRepository.findAll();
        }

        return items.stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<ItemResponse> getItemsPaged(String name, String category, Pageable pageable) {
        String searchName = (name != null && !name.trim().isEmpty()) ? name.trim() : null;
        String searchCategory = (category != null && !category.trim().isEmpty()) ? category.trim() : null;

        return itemRepository.findFiltered(searchName, searchCategory, pageable)
                .map(ItemResponse::fromEntity);
    }

    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item with ID " + id + " not found"));
        return ItemResponse.fromEntity(item);
    }

    @Transactional
    public ItemResponse createItem(ItemRequest request) {
        Supplier supplier = supplierService.findSupplierEntityById(request.getSupplierId());

        Item item = Item.builder()
                .name(request.getName().trim())
                .category(request.getCategory().trim())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .supplier(supplier)
                .build();

        Item saved = itemRepository.save(item);
        return ItemResponse.fromEntity(saved);
    }

    @Transactional
    public ItemResponse updateItem(Long id, ItemRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item with ID " + id + " not found"));

        Supplier supplier = supplierService.findSupplierEntityById(request.getSupplierId());

        item.setName(request.getName().trim());
        item.setCategory(request.getCategory().trim());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setSupplier(supplier);

        Item updated = itemRepository.save(item);
        return ItemResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item with ID " + id + " not found");
        }
        itemRepository.deleteById(id);
    }

    public List<ItemResponse> getLowStockItems(Integer threshold) {
        int limit = (threshold != null && threshold >= 0) ? threshold : 10;
        return itemRepository.findByQuantityLessThan(limit).stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return itemRepository.findDistinctCategories();
    }
}

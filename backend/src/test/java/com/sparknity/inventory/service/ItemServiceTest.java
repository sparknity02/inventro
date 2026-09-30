package com.sparknity.inventory.service;

import com.sparknity.inventory.dto.ItemRequest;
import com.sparknity.inventory.dto.ItemResponse;
import com.sparknity.inventory.entity.Item;
import com.sparknity.inventory.entity.Supplier;
import com.sparknity.inventory.exception.ResourceNotFoundException;
import com.sparknity.inventory.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private SupplierService supplierService;

    @InjectMocks
    private ItemService itemService;

    private Supplier mockSupplier;
    private Item mockItem;

    @BeforeEach
    void setUp() {
        mockSupplier = Supplier.builder()
                .id(1L)
                .name("Alpha Supply")
                .email("alpha@supply.com")
                .build();

        mockItem = Item.builder()
                .id(10L)
                .name("Wireless Mouse")
                .category("Electronics")
                .quantity(5)
                .price(799.00)
                .supplier(mockSupplier)
                .build();
    }

    @Test
    @DisplayName("Should create item successfully when supplier exists")
    void shouldCreateItem() {
        ItemRequest request = ItemRequest.builder()
                .name("Wireless Mouse")
                .category("Electronics")
                .quantity(5)
                .price(799.00)
                .supplierId(1L)
                .build();

        when(supplierService.findSupplierEntityById(1L)).thenReturn(mockSupplier);
        when(itemRepository.save(any(Item.class))).thenReturn(mockItem);

        ItemResponse response = itemService.createItem(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Wireless Mouse", response.getName());
        assertEquals(1L, response.getSupplierId());
        verify(itemRepository, times(1)).save(any(Item.class));
    }

    @Test
    @DisplayName("Should retrieve item by ID")
    void shouldRetrieveItemById() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(mockItem));

        ItemResponse response = itemService.getItemById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Wireless Mouse", response.getName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when item not found")
    void shouldThrowExceptionWhenItemNotFound() {
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itemService.getItemById(999L));
        verify(itemRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Should filter items with quantity below threshold")
    void shouldFilterLowStockItems() {
        Item item1 = Item.builder().id(1L).name("Keyboard").quantity(3).price(1200.0).supplier(mockSupplier).build();
        Item item2 = Item.builder().id(2L).name("Mouse").quantity(7).price(500.0).supplier(mockSupplier).build();

        when(itemRepository.findByQuantityLessThan(10)).thenReturn(Arrays.asList(item1, item2));

        List<ItemResponse> lowStock = itemService.getLowStockItems(10);

        assertEquals(2, lowStock.size());
        assertTrue(lowStock.stream().allMatch(i -> i.getQuantity() < 10));
        verify(itemRepository, times(1)).findByQuantityLessThan(10);
    }
}

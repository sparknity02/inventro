package com.sparknity.inventory.repository;

import com.sparknity.inventory.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByQuantityLessThan(Integer threshold);

    long countByQuantityLessThan(Integer threshold);

    List<Item> findByNameContainingIgnoreCase(String name);

    List<Item> findByCategoryIgnoreCase(String category);

    List<Item> findByNameContainingIgnoreCaseAndCategoryIgnoreCase(String name, String category);

    boolean existsBySupplierId(Long supplierId);

    @Query("SELECT COALESCE(SUM(i.quantity * i.price), 0.0) FROM Item i")
    Double calculateTotalInventoryValue();

    @Query("SELECT DISTINCT i.category FROM Item i ORDER BY i.category")
    List<String> findDistinctCategories();

    @Query("SELECT i FROM Item i WHERE " +
           "(:name IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:category IS NULL OR LOWER(i.category) = LOWER(:category))")
    Page<Item> findFiltered(@Param("name") String name, @Param("category") String category, Pageable pageable);
}

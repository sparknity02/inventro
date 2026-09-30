package com.sparknity.inventory.config;

import com.sparknity.inventory.entity.Item;
import com.sparknity.inventory.entity.Supplier;
import com.sparknity.inventory.repository.ItemRepository;
import com.sparknity.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SupplierRepository supplierRepository;
    private final ItemRepository itemRepository;

    @Override
    public void run(String... args) {
        if (supplierRepository.count() == 0) {
            Supplier s1 = Supplier.builder()
                    .name("TechSource Pvt Ltd")
                    .phone("+91 98765 43210")
                    .email("contact@techsource.in")
                    .build();

            Supplier s2 = Supplier.builder()
                    .name("Global Electronics")
                    .phone("+91 91234 56789")
                    .email("support@globalelec.com")
                    .build();

            Supplier s3 = Supplier.builder()
                    .name("SmartSupply India")
                    .phone("+91 99887 76655")
                    .email("info@smartsupply.in")
                    .build();

            Supplier s4 = Supplier.builder()
                    .name("OfficeMart")
                    .phone("+91 94455 66778")
                    .email("sales@officemart.com")
                    .build();

            List<Supplier> suppliers = supplierRepository.saveAll(Arrays.asList(s1, s2, s3, s4));

            Supplier techSource = suppliers.get(0);
            Supplier globalElec = suppliers.get(1);
            Supplier smartSupply = suppliers.get(2);
            Supplier officeMart = suppliers.get(3);

            List<Item> initialItems = Arrays.asList(
                    Item.builder().name("Wireless Mouse").category("Electronics").quantity(5).price(799.00).supplier(techSource).build(),
                    Item.builder().name("Mechanical Keyboard").category("Electronics").quantity(3).price(2499.00).supplier(techSource).build(),
                    Item.builder().name("USB-C Cable").category("Accessories").quantity(2).price(299.00).supplier(smartSupply).build(),
                    Item.builder().name("Laptop Stand").category("Accessories").quantity(25).price(1199.00).supplier(officeMart).build(),
                    Item.builder().name("HDMI Cable").category("Accessories").quantity(40).price(399.00).supplier(smartSupply).build(),
                    Item.builder().name("Webcam").category("Electronics").quantity(14).price(1899.00).supplier(globalElec).build(),
                    Item.builder().name("External SSD").category("Storage").quantity(18).price(6499.00).supplier(globalElec).build(),
                    Item.builder().name("Office Chair").category("Furniture").quantity(12).price(8999.00).supplier(officeMart).build()
            );

            itemRepository.saveAll(initialItems);
        }
    }
}

package com.campus.lostandfound.repository;

import com.campus.lostandfound.entity.Category;
import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.ItemStatus;
import com.campus.lostandfound.entity.ItemType;
import com.campus.lostandfound.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    Page<Item> findByReportedByOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByReportedBy(User user);

    long countByStatus(ItemStatus status);

    long countByType(ItemType type);

    long countByCategoryId(Long categoryId);

    long countByLocationId(Long locationId);

    List<Item> findByTypeAndStatusAndCategory(ItemType type, ItemStatus status, Category category);

    @Query("SELECT c.name, COUNT(i) FROM Item i JOIN i.category c GROUP BY c.name")
    List<Object[]> countItemsByCategory();

    List<Item> findTop5ByOrderByCreatedAtDesc();
}
